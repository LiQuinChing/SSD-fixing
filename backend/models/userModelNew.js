import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },

    // local | google
    provider: { type: String, enum: ['local', 'google'], default: 'local' },

    // Present for Google users
    googleId: { type: String },

    // Optional avatar from Google
    picture: { type: String },

    role: {
        type: String,
        default: 'user',
    },
    password: {
        type: String,
        required: function () { return this.provider === 'local'; }
    },
});

export const User = mongoose.model('user', userSchema);
