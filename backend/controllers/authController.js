import bcrypt from 'bcryptjs';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import { User } from '../models/userModelNew.js';
import createError from '../utils/appError.js';
import { OAuth2Client } from 'google-auth-library';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '90d';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const signToken = (user) =>
  jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

// REGISTER USER - local
export const signup = async (req, res, next) => {
  try {
    const { email, password, ...rest } = req.body;

    // Validate required fields
    if (!email || !password) {
      return next(new createError("Email and password are required", 400));
    }

    // Enforce a strong password policy
    // Adjust options as needed. Current options require:
    // minLength 8, at least 1 lowercase, 1 uppercase, 1 number, 1 symbol
    const passwordOptions = {
      minLength: 8,
      minLowercase: 3,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    };

    if (!validator.isStrongPassword(password, passwordOptions)) {
      return next(
        new createError(
          "Password is too weak. It must be at least 8 characters long and include uppercase, lowercase, number and symbol.",
          400
        )
      );
    }

    // Optional: validate email format
    if (!validator.isEmail(email)) {
      return next(new createError("Invalid email address", 400));
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return next(new createError("User already exists!", 400));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      ...rest,
      email,
      password: hashedPassword,
      provider: 'local',
    });

    const token = signToken(newUser);
    res.status(201).json({
      status: 'success',
      message: "User registered successfully!",
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        provider: newUser.provider,
      },
    });
  } catch (error) {
    next(error);
  }
};

//LOGIN USER (local)
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, provider: 'local' });
    if (!user) return next(new createError("User not found!", 404));
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new createError("Invalid email or password!", 401));
    }
    // const token = jwt.sign({ _id: user._id }, "secretkey123", {
    //   expiresIn: '90d',
    // });
    const token = signToken(user);
    res.status(200).json({
      status: 'success',
      token,
      message: "Logged in successfully!",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        provider: user.provider,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ========== GOOGLE AUTH (One-Tap / Google button) ==========
export const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body; // ID token from front-end
    if (!credential) return next(new createError("Missing credential", 400));

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    // payload contains: sub (googleId), email, name, picture, email_verified, etc.
    const { sub: googleId, email, name, picture, email_verified } = payload;

    if (!email || !email_verified) {
      return next(new createError("Google account email not verified", 401));
    }

    // Try match existing Google user
    let user = await User.findOne({ googleId, provider: 'google' });

    // Or fallback to existing local user with same email (link accounts)
    if (!user) {
      user = await User.findOne({ email });
      if (user && user.provider === 'local') {
        // Link Google to existing local account
        user.googleId = googleId;
        user.provider = 'google';
        user.picture = user.picture || picture;
        await user.save();
      }
    }

    // If still not found, create a new Google user
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        provider: 'google',
        picture,
        role: 'user',
      });
    }

    const token = signToken(user);
    res.status(200).json({
      status: 'success',
      token,
      message: "Google authentication successful!",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        provider: user.provider,
        picture: user.picture,
      },
    });
  } catch (error) {
    next(error);
  }
};
