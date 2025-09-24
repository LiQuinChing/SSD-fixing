import express from "express";
import mongoose from "mongoose";
import sanitizeHtml from "sanitize-html";
import cardPaymentsRoute from './routes/cardPaymentsRoute.js';
import cashPaymentsRoute from './routes/cashPaymentsRoute.js';
import paymentMethodRoute from './routes/paymentMethodRoute.js';
import refundRequestsRoute from './routes/refundRequestsRoute.js';
import stripePaymentsRoute from './routes/stripePaymentsRoute.js';
import sgMail from '@sendgrid/mail';
import fs from 'fs';
import offersRoutes from './routes/offersRoutes.js';
import cors from 'cors';
import multer from 'multer';
import nodemailer from 'nodemailer';
import cron from 'node-cron';
import dotenv from 'dotenv';
import { PORT, mongoDBURL } from './config.js';
import { corsOptions } from './config/corsConfig.js';
import chatRoutes from './routes/chatRoutes.js';
import userRoutes from './routes/userRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import rentHisRoute from './routes/rentHisRoute.js';
import authRouter from './routes/authRoute.js';
import LicenseRepository from './controllers/LicenseRepository.js';
import InsuranceRepository from './controllers/InsuranceRepository.js';
import recordsRoute from './routes/recordsRoute.js'
import carRoutes from './routes/carRoute.js'
import booksRoute from './routes/booksRoute.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import helmet from 'helmet';
import { globalErrorHandler, handleNotFound, requestLogger } from './middleware/errorHandler.js';
import secureLogger from './utils/secureLogger.js';

dotenv.config();

const app = express();

app.use(express.json());

app.set('trust proxy', 1);

app.use(requestLogger);

const isProd = process.env.NODE_ENV === 'production';
app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            "default-src": ["'self'"],
            "base-uri": ["'self'"],
            "frame-ancestors": ["'self'"],
            "img-src": ["'self'", 'data:', 'blob:'],
            "object-src": ["'none'"],
            // Note: loosened for common dev tools/CDNs. Tighten by listing exact hosts when possible.
            "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https:'],
            "script-src-attr": ["'none'"],
            "style-src": ["'self'", "'unsafe-inline'", 'https:'],
            "font-src": ["'self'", 'https:', 'data:'],
            "connect-src": ["'self'", 'https:', 'ws:', 'wss:'],
            "frame-src": ["'self'", 'https:'],
            'upgrade-insecure-requests': [],
        },
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: isProd ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
}));

app.use((req, res, next) => {
    res.setHeader('Permissions-Policy', [
        'accelerometer=()',
        'camera=()',
        'geolocation=()',
        'gyroscope=()',
        'magnetometer=()',
        'microphone=()',
        'payment=(self)',
        'usb=()'
    ].join(', '));
    next();
});

app.use(cors(corsOptions));

// Security headers specifically for Google OAuth
app.use((req, res, next) => {
    // Essential for Google OAuth popup/redirect flow
    res.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');

    // Additional security headers that don't interfere with OAuth
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');

    // Referrer policy that works with OAuth
    res.header('Referrer-Policy', 'strict-origin-when-cross-origin');

    next();
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });
app.use('/uploads', express.static('uploads', {
    dotfiles: 'ignore',
    index: false
}));

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.get('/', (req, res) => res.status(200).send('Welcome'));
app.use('/chat', chatRoutes);
app.use('/user', userRoutes);
app.use('/vehicle', vehicleRoutes);
app.use('/admin', adminRoutes);
app.use('/rents', rentHisRoute);
app.use('/cardpayments', cardPaymentsRoute);
app.use('/cashpayments', cashPaymentsRoute);
app.use('/savepaymentmethod', paymentMethodRoute);
app.use('/refundrequests', refundRequestsRoute);
app.use('/stripepayments', stripePaymentsRoute);
app.use('/api/auth', authRouter);
app.use('/records', recordsRoute);
app.use('/offers', offersRoutes);
app.use('/cars', carRoutes);
app.use('/books', booksRoute);
app.use('/feedbacks', feedbackRoutes);
app.all('*', handleNotFound);
app.use(globalErrorHandler);

mongoose.connect(mongoDBURL || process.env.DB_URI)
    .then(() => {
        secureLogger.info('MongoDB connected successfully');
        app.listen(PORT || process.env.PORT, () => {
            secureLogger.info(`Server running on port ${PORT || process.env.PORT}`);
        });
    })
    .catch(err => {
        secureLogger.error('MongoDB connection failed', err);
        process.exit(1);
    });

// Scheduled tasks
cron.schedule('0 7 * * *', async () => {
        secureLogger.info('Running daily tasks at 7:00 AM...');
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        // Handle license expirations
        try {
            const licenses = await LicenseRepository.getAllLicenses();
            licenses.forEach(async (license) => {
                const endDate = new Date(license.endDate);
                endDate.setHours(0, 0, 0, 0);
                if (Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24)) <= 7) {
                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: license.email,
                        subject: 'License Expiry Reminder',
                        text: `Hello, your license will expire on ${endDate.toDateString()}. Please renew it promptly.`
                    };
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            secureLogger.error('Failed to send license expiry email', error);
                        } else {
                            secureLogger.info('License expiry email sent successfully');
                        }
                    });
                }
            });
        } catch (error) {
            secureLogger.error('Error processing license expirations', error);
        }

        // Handle insurance expirations
        try {
            const insurances = await InsuranceRepository.getAllInsurances();
            insurances.forEach(async (insurance) => {
                const endDate = new Date(insurance.endDate);
                endDate.setHours(0, 0, 0, 0);
                if (Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24)) <= 7) {
                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: insurance.email,
                        subject: 'Insurance Expiry Reminder',
                        text: `Hello, your insurance will expire on ${endDate.toDateString()}. Please renew it promptly.`
                    };
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            secureLogger.error('Failed to send insurance expiry email', error);
                        } else {
                            secureLogger.info('Insurance expiry email sent successfully');
                        }
                    });
                }
            });
        } catch (error) {
            secureLogger.error('Error processing insurance expirations', error);
        }
});


// License API routes
app.post('/licenses', upload.single('uploadLicense'), async (req, res, next) => {
    try {
        const newLicense = await LicenseRepository.addLicense({
            vehicleNo: sanitizeHtml(req.body.vehicleNo || ""),
            startDate: sanitizeHtml(req.body.startDate || ""),
            endDate: sanitizeHtml(req.body.endDate || ""),
            uploadLicense: req.file ? req.file.path : null,
            email: sanitizeHtml(req.body.email || ""),
            notes: sanitizeHtml(req.body.notes || "")
        });
        res.status(201).json(newLicense); // Solved XSS vulnerability
    } catch (error) {
        secureLogger.error('Error when adding license', error);
        next(error);
    }
});

app.get('/licenses', async (req, res, next) => {
    try {
        const licenses = await LicenseRepository.getAllLicenses();
        res.send(licenses);
    } catch (error) {
        secureLogger.error('Error fetching licenses', error);
        next(error);
    }
});

app.put('/licenses/:id', async (req, res, next) => {
    try {
        const updatedLicense = await LicenseRepository.updateLicense(req.params.id, req.body);
        res.json(updatedLicense); // Solved XSS vulnerability
    } catch (error) {
        secureLogger.error('Error updating license', error);
        next(error);
    }
});

app.delete('/licenses/:id', async (req, res, next) => {
    try {
        const deletedLicense = await LicenseRepository.deleteLicense(req.params.id);
        res.json(deletedLicense); // Solved XSS vulnerability
    } catch (error) {
        secureLogger.error('Error deleting license', error);
        next(error);
    }
});
//>>>>>>> development-main

// Insurance API routes (similar structure to the license routes)
app.post('/insurances', upload.single('uploadInsurance'), async (req, res, next) => {
    try {
        const newInsurance = await InsuranceRepository.addInsurance({
            // include all required fields
            vehicleNo: sanitizeHtml(req.body.vehiclenumber),
            insuranceProvider: sanitizeHtml(req.body.insuranceProvider),
            policyNumber: sanitizeHtml(req.body.policyNumber),
            policyType: sanitizeHtml(req.body.policyType),
            coverageDetails: sanitizeHtml(req.body.coverageDetails),
            startDate: sanitizeHtml(req.body.startDate),
            endDate: sanitizeHtml(req.body.endDate),
            premiumAmount: sanitizeHtml(req.body.premiumAmount),
            contactInformation: sanitizeHtml(req.body.contactInformation),
            uploadInsurance: req.file ? req.file.path : null, // Assuming file is optional
            email: sanitizeHtml(req.body.email),
        });
        res.status(201).json(newInsurance); // Solved XSS vulnerability
    } catch (error) {
        secureLogger.error('Error when adding insurance', error);
        next(error);
    }
});

app.get('/insurances', async (req, res, next) => {
    try {
        const insurances = await InsuranceRepository.getAllInsurances();
        res.json(insurances); // Solved XSS vulnerability
    } catch (error) {
        secureLogger.error('Error fetching insurances', error);
        next(error);
    }
});

app.put('/insurances/:id', async (req, res, next) => {
    try {
        const updatedInsurance = await InsuranceRepository.updateInsurance(req.params.id, req.body);
        res.json(updatedInsurance); // Solved XSS vulnerability
    } catch (error) {
        secureLogger.error('Error updating insurance', error);
        next(error);
    }
});

app.delete('/insurances/:id', async (req, res, next) => {
    try {
        const deletedInsurance = await InsuranceRepository.deleteInsurance(req.params.id);
        res.json(deletedInsurance); // Solved XSS vulnerability
    } catch (error) {
        secureLogger.error('Error deleting insurance', error);
        next(error);
    }
});
export default app;