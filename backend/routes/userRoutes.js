// userRoutes.js
import express from 'express';
import { userModel } from '../models/userModel.js';
import sanitizeHtml from 'sanitize-html';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const router = express.Router();
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);

function checkPasswordStrength(password) {
  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 0,
    minNumbers: 1,
    minSymbols: 0,
  });
}

router.post('/create', async (request, response, next) => {
  try {
    const { idN, password } = request.body;
    if (!idN || !password) {
      return response.status(400).send('Send all the required fields');
    }

    if (!checkPasswordStrength(String(password))) {
      return response.status(400).send('Password does not meet strength requirements.');
    }

    // Solved XSS vulnerability
    const safeIdN = sanitizeHtml(String(idN));

    // hash password
    const hashed = await bcrypt.hash(String(password), BCRYPT_SALT_ROUNDS);

    const newUser = {
      idN: safeIdN,
      password: hashed,
    };

    const newUserFinal = await userModel.create(newUser);
    return response.status(201).json({
      message: 'User created',
      user: { idN: newUserFinal.idN, _id: newUserFinal._id },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (request, response, next) => {
  try {
    const { idN, password } = request.body;

    const user = await userModel.findOne({ idN: idN });
    if (!user) {
      return response.status(401).json({ error: 'Incorrect login details' });
    }

    const isValid = await bcrypt.compare(String(password), user.password);
    if (!isValid) return response.status(401).json({ error: 'Incorrect login details' });

    // TODO: issue token (prefer using same authController token logic)
    return response.json({ success: 'Success', user: user.idN });
  } catch (err) {
    next(err);
  }
});


export default router;