import mongoose from 'mongoose'
import JWT from 'jsonwebtoken'
import bcrypt from 'bcrypt'

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

userSchema.pre('save', async function (next) {
    if (!this.isModified("password")) return next()
    this.password =await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

// ACCESS_TOKEN
userSchema.methods.generateAccessToken =  function () {
    return JWT.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// REFRESH_TOKEN
userSchema.methods.generateRefreshToken =  function () {
    return JWT.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const UserModel = mongoose.model('User', userSchema)