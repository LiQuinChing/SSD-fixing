// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const helmet = require('helmet');
const carRoutes = require('./routes/carRoute');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Security middleware - disable X-Powered-By header and set security headers
app.use(helmet({
    xPoweredBy: false, // Explicitly disable X-Powered-By header
    contentSecurityPolicy: false, // Disable CSP for now to avoid breaking existing functionality
    crossOriginEmbedderPolicy: false // Disable COEP to avoid issues with CORS
}));

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the Car Rental API');
});

// Use car routes
app.use('/cars', carRoutes);

// Start server
const PORT = process.env.PORT || 8009;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
});
