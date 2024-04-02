import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({

    userName: {
        type: String,
        required: [true, "userName is required"],
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: [true, "fullName is required"],
        trim: true,
        index: true,
    },
    avatar: {
        type: String,
        required: [true, "Avatar is required"],
    },
    coverImage: {
        type: String,
    },
    watchHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    }],
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    refreshToken: {
        type: String,
    }
}, { timestamps: true })


export const UserModel = mongoose.model('User', userSchema)