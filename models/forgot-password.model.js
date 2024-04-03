const mongoose = require("mongoose");

const forgotPasswordSchema = new mongoose.Schema(
    {
        email: String,
        otp: String,
        expireAt: {
            type: Date,
            expires: 1800  // tồn tại trong 180s
        }
    },
    { timestamps: true }
);

const ForgotPassword = mongoose.model('ForgotPassword', forgotPasswordSchema, "forgot-password");

module.exports = ForgotPassword;