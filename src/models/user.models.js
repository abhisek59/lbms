import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    section:{
        type:String,
        required:true
    },
    address:{
        type: String,
        required: true,
        trim: true,
    },
    phoneNo: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    avatar: {
        type: String, // Cloudinary URL
        required: true,
    },
      password: {
        type: String,
        required: [true, "Password is required"],
    },
    membershipDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true,
        required: true
    },
    refreshToken: {
        type: String,
    },

}, {
    timestamps: true
});

// 🔐 Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// 🔑 Compare passwords
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// 🔐 Generate access token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        username: this.username,
        email: this.email,
        fullname: this.fullname,
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    });
};

// 🔐 Generate refresh token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
    }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    });
};

export const User = mongoose.model("User", userSchema);
