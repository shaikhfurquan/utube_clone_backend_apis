import { asyncHandler } from '../utils/asyncHandler.js'
import { UserModel } from '../models/userModel.js'
import { ApiValidationError } from '../utils/ApiValidationError.js'
import { ApiCatchError } from '../utils/ApiCatchError.js'
import { ApiSuccessResponse } from '../utils/ApiSuccessResponse.js'
import { uploadOnCloudinary } from '../utils/uploadCloudinary.js'


// generating the access and refresh tokens
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        // finding the user
        const user = await UserModel.findById(userId)

        const accessToken = user.generateAccessToken() // giving access token to the user
        const refreshToken = user.generateRefreshToken() // saving the refresh token in database

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken , refreshToken}

    } catch (error) {
        return ApiCatchError(res, "Error while generating access and refresh tokens")
    }
}

export const registerUser = async (req, res) => {

    try {

        // getting the user fields
        const { fullName, email, userName, password } = req.body

        // validating the fields
        if (!(fullName, email, userName, password)) {
            return ApiValidationError(res, "All fields are required", 400)
        }

        // check whether the user is already registered or not
        const existedUser = await UserModel.findOne({
            $or: [{ userName }, { email }]
        })
        if (existedUser) {
            return ApiValidationError(res, "Already registered with this username or email address.", 400)
        }

        // avatar file validation
        let avatarLocalPath;
        if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
            avatarLocalPath = req.files.avatar[0].path;
        } else {
            return ApiValidationError(res, "Avatar file is required!", 400);
        }

        // cover image file validation
        let coverImageLocalPath;
        if (req.files && Array.isArray(req.files.coverImage && req.files.coverImage.length > 0)) {
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
            return ApiValidationError(res, "Something went wrong while creating user!", 500)
        }

        return ApiSuccessResponse(res, "User created successfully", createdUser, 201);
    } catch (error) {
        ApiCatchError(res, 'Error while creating user', error, 500);
    }
}


export const loginUser = async (req, res) => {
    try {
        const { email, userName, password } = req.body
        if (!email || !userName || !password) {
            const errorMessage = !email || !userName ? "userName or email is required" : "password is required";
            return ApiValidationError(res, errorMessage, 404);
        }


        const user = await UserModel.findOne({
            $or: [{ userName }, { email }]
        })
        if (!user) {
            return ApiValidationError(res, "User does not exist, register first", 400)
        }

        const isPasswordValid = await user.isPasswordCorrect(password)
        if (!isPasswordValid) {
            return ApiValidationError(res, "Invalid credentials", 401)
        }

        
        console.log(generateAccessAndRefreshTokens(user._id));
        const{accessToken , refreshToken} = await generateAccessAndRefreshTokens(user._id)

        const loggedInUser = await UserModel.findById(user._id).select("-password , -refreshToken")

        // sending the token into the cookie
        const options = {
            httpOnly : true,
            secure : true
        }

        return res.status(200)
        .cookie("accessToken" , accessToken , options)
        .cookie("refreshToken" , refreshToken , options).json(
            ApiSuccessResponse({user : loggedInUser , accessToken, refreshToken} , `Welcome ${user.userName || user.email}` , 200) 
        );

    } catch (error) {
        ApiCatchError(res, 'Error while login user', error, 500);
    }
}