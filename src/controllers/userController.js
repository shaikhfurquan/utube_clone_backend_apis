import { asyncHandler } from '../utils/asyncHandler.js'
import { UserModel } from '../models/userModel.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiCatchError } from '../utils/ApiCatchError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { uploadOnCloudinary } from '../utils/uploadCloudinary.js'


// generating the access and refresh tokens
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        // finding the user
        const user = await UserModel.findById(userId)
        // console.log("a r t",user);

        const accessToken = user.generateAccessToken() // giving access token to the user
        const refreshToken = user.generateRefreshToken() // saving the refresh token in database

        // console.log(accessToken, refreshToken);
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        return ApiCatchError(res, "Error while generating access and refresh tokens")
    }
}

export const registerUser = async (req, res) => {

    try {

        // console.log(req.files);
        // getting the user fields
        const { fullName, email, userName, password } = req.body

        // validating the fields
        if (!(fullName, email, userName, password)) {
            throw new ApiError(400, "All fields are required")
        }

        // check whether the user is already registered or not
        const existedUser = await UserModel.findOne({
            $or: [{ userName }, { email }]
        })
        if (existedUser) {
            throw new ApiError(409, "Already registered with this username or email address.")
        }

        // avatar file validation
        let avatarLocalPath;
        if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
            avatarLocalPath = req.files.avatar[0].path;
        } else {
            throw new ApiError(400, "Avatar file is required!");
        }

        // cover image file validation
        let coverImageLocalPath;
        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0].path
        }

        // uploading on the cloudinary
        const avatar = await uploadOnCloudinary(avatarLocalPath)
        // console.log('...',avatar);
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)


        // creating user
        const createUser = await UserModel.create({
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            userName
        })

        // check createdUser
        const createdUser = await UserModel.findById(createUser._id).select("-password -refreshToken")
        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while creating user!")
        }

        return res.status(201).json(
            new ApiResponse(200, createdUser, "User registered Successfully")
        )
    } catch (error) {
        ApiCatchError(res, 'Error while creating user', error, 500);
    }
}


export const loginUser = async (req, res) => {
    try {
        // console.log(req.body);
        const { email, userName, password } = req.body
        if (!(userName || email)) {
            throw new ApiError(400, "Email or username is required.")
        }
        if (!password) {
            throw new ApiError(400, "Password is required.")
        }

        const user = await UserModel.findOne({
            $or: [{ userName }, { email }]
        })
        if (!user) {
            throw new ApiError(400, "User does not exist, register first")
        }

        const isPasswordValid = await user.isPasswordCorrect(password)
        if (!isPasswordValid) {
            throw new ApiError(400, "Invalid credentials")
        }


        // console.log(generateAccessAndRefreshTokens(user._id));
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

        const loggedInUser = await UserModel.findById(user._id).select("-password -refreshToken")

        // console.log(accessToken , refreshToken);
        // sending the token into the cookie
        const options = {
            httpOnly: true,
            secure: true
        }

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, `Welcome ${loggedInUser.userName}`, { user: loggedInUser, accessToken, refreshToken }));

    } catch (error) {
        ApiCatchError(res, 'Error while login user', error, 500);
    }
}


export const logoutUser = async (req, res) => {
    try {
        UserModel.findByIdAndUpdate(req.user._id, { $set: { refreshToken: undefined } }, { new: true })

        const options = {
            httpOnly: true,
            secure: true
        }

        return res.status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, "User Logged-Out success", {}));

    } catch (error) {
        ApiCatchError(res, 'Error while logout user', error, 500);
    }
}