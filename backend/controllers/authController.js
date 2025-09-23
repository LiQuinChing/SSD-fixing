import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {User} from '../models/userModelNew.js'; 
import createError from '../utils/appError.js';

// For the password validation
import validator from 'validator'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);

// Helpers
function checkPasswordStrength(password) {
  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });
}

// REGISTER USER - Solved Weak Password & Password Restriction vulnerability
export const signup = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return next(new createError('Email and password are required', 400));
    }

    if (!validator.isEmail(String(email))) {
      return next(new createError('Invalid email address', 400));
    }

    if (!checkPasswordStrength(String(password))) {
      return next(
        new createError(
          'Password too weak. It must be at least 8 chars, include a number and a lowercase letter.',
          400
        )
      );
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return next(new createError('User already exists!', 400));
    }

    const hashedPassword = await bcrypt.hash(String(password), BCRYPT_SALT_ROUNDS);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
    });

    const token = jwt.sign({ _id: newUser._id }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '90d' });

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully!',
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

//LOGIN USER
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new createError('Email and password are required', 400));
    }

    const user = await User.findOne({ email });
    if (!user) return next(new createError('User not found!', 404));

    const isPasswordValid = await bcrypt.compare(String(password), user.password);
    if (!isPasswordValid) {
      return next(new createError('Invalid email or password!', 401));
    }

    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '90d' });

    res.status(200).json({
      status: 'success',
      token,
      message: 'Logged in successfully!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
