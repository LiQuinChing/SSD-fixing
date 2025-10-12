// userRoutes.js (replace existing content with this)
import express from "express";
import { userModel } from "../models/userModel.js";
import sanitizeHtml from 'sanitize-html';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const router = express.Router();

router.post('/create', async (request, response, next) => {
  try {
    const { idN, password } = request.body;

    if (!idN || !password) {
      return response.status(400).send('Send all the required fields');
    }

    // Validate & sanitize
    const safeIdN = sanitizeHtml(String(idN));
    const rawPassword = String(password);

    // Enforce password policy (same options as above, adjust if needed)
    const passwordOptions = {
      minLength: 8,
      minLowercase: 3,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    };

    if (!validator.isStrongPassword(rawPassword, passwordOptions)) {
      return response.status(400).json({
        error:
          "Password is too weak. It must be at least 8 characters long and include uppercase, lowercase, number and symbol.",
      });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(rawPassword, 12);

    const newUser = {
      idN: safeIdN,
      password: hashedPassword,
    };

    const newUserFinal = await userModel.create(newUser);
    return response.status(201).json({
      message: "User created",
      user: { id: newUserFinal._id, idN: newUserFinal.idN },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (request, response, next) => {
  try {
    const { idN, password } = request.body;
    if (!idN || !password) {
      return response.status(400).json({ error: "idN and password are required" });
    }

    // Sanitize idN when querying
    const safeIdN = sanitizeHtml(String(idN));

    const user = await userModel.findOne({ idN: safeIdN });
    if (!user) {
      return response.status(401).json({ error: "Incorrect login details" });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(String(password), user.password);
    if (!isMatch) {
      return response.status(401).json({ error: "Incorrect login details" });
    }

    // Success — you can return user info or sign a token if desired
    return response.json({ success: "Success", user: user.idN });
  } catch (error) {
    next(error);
  }
});

export default router;
// 