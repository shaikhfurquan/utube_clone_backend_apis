import { asyncHandler } from '../utils/asyncHandler.js'
import { UserModel } from '../models/userModel.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiCatchError } from '../utils/ApiCatchError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { uploadOnCloudinary } from '../utils/uploadCloudinary.js'
import JWT from 'jsonwebtoken'


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


export const refreshAccessToken = async (req, res) => {
    try {
        console.log(req.cookies);
        const inComingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
        if (!inComingRefreshToken) {
            throw new ApiError(404, "Unauthorized request")
        }

        const decodedToken = JWT.verify(inComingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await UserModel.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        // Matching these two tokens incomingrefreshToken and user token
        if (inComingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Invalid refresh token is expired or used")
        }

        // if these two are right we will generate new one 
        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }));

    } catch (error) {
        ApiCatchError(res, 'Error while generating refresh token user', error, 500);
    }
}


export const changeCurrentUserPassword = async (req, res) => {
    try {

        const { oldPassword, newPassword } = req.body
        const user = await UserModel.findById(req.user?._id)
        if (!user) {
            throw new ApiError(404, "User not found. With this Id")
        }

        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
        if (!isPasswordCorrect) {
            throw new ApiError(400, 'Invalid password')
        }

        user.password = newPassword
        await user.save({ validateBeforeSave: false })

        return res.status(200).json(new ApiResponse(200, {}, "password changed successfully"))

    } catch (error) {
        ApiCatchError(res, 'Error while changing the current user password', error, 500);
    }
}


export const getCurrentUser = async (req, res) => {
    try {
        const currentUser = req.user
        return res.status(200).json(new ApiResponse(200, currentUser, "Profile fetch successfully"))

    } catch (error) {
        ApiCatchError(res, 'Error while fetching current user profile', error, 500);
    }
}


export const updateAccountDetails = async (req, res) => {
    try {
        const { fullName, email } = req.body
        if (!fullName || !email) {
            throw new ApiError(404, "All fields must be provided")
        }

        const updatedUser = await UserModel.findByIdAndUpdate(req.user?._id,
            {
                $set: {
                    fullName,
                    email
                }
            },
            { new: true }
        ).select("-password")

        return res.status(200).json(new ApiResponse(200, updatedUser, "account details updated successfully"));
    } catch (error) {
        ApiCatchError(res, 'Error while updating account details', error, 500);
    }
}


export const updateUserAvatar = async (req, res) => {
    try {
        const avatarLocalPath = req.file?.path
        if (!avatarLocalPath) {
            throw new ApiError(400, 'Avata file is missing')
        }

        const avatar = uploadOnCloudinary(avatarLocalPath)
        if (!avatar.url) {
            throw new ApiError(400, 'Error while uploading avatar to cloudinary')
        }

        const user = await UserModel.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    avatar: avatar.url
                }
            },
            { new: true }
        ).select('-password')


        return res.status(200).json(new ApiResponse(200, user, 'Avatar image updated successfully'))
    } catch (error) {
        ApiCatchError(res, 'Error while updating avatar', error, 500);
    }
}


export const updateUserCoverImage = async (req, res) => {
    try {
        const coverImageLocalPath = req.file?.path
        if (!coverImageLocalPath) {
            throw new ApiError(400, 'Cover image is missing')
        }

        const coverImage = uploadOnCloudinary(coverImageLocalPath)
        if (!coverImage.url) {
            throw new ApiError(400, 'Error while uploading coverImage to cloudinary')
        }

        const user = await UserModel.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    coverImage: coverImage.url
                }
            },
            { new: true }
        ).select('-password')

        return res.status(200).json(new ApiResponse(200, user, 'Cover image updated successfully'))

    } catch (error) {
        ApiCatchError(res, 'Error while updating coverImage', error, 500);
    }
}

export const getUserChennelProfile = async (req, res) => {
    try {

        const { userName } = req.params
        if (!userName?.trim()) {
            throw new ApiError(400, 'User name is missing')
        }

        const channel = await UserModel.aggregate([
            // getting(matching) username like(cac)
            {
                $match: {
                    userName: userName?.toLowerCase()
                }
            },
            // getting(count) through chennel subscriber of(cac)
            {
                $lookup: {
                    from: 'subscription',
                    localField: _id,
                    foreignField: 'chennel',
                    as: 'subscribers'
                }

            },
            // getting how many i have subscribed through subscriber
            {
                $lookup: {
                    from: 'subscription',
                    localField: _id,
                    foreignField: 'subscriber',
                    as: 'subscribedTo'
                }
            },
            //adding fields in original user
            {
                $addFields: {
                    subsribersCount: {
                        $size: '$subscribers'
                    },
                    chennelSubscribedToCount: {
                        $size: '$subscribedTo'
                    },
                    isSubscribed: {
                        $cond: {
                            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            // providing details to the ui
            {
                $project: {
                    fullName: 1,
                    userName: 1,
                    subsribersCount: 1,
                    chennelSubscribedToCount: 1,
                    isSubscribed: 1,
                    avatar: 1,
                    coverImage: 1,
                    email: 1
                }
            }
        ])

        if (!channel?.length) {
            throw new ApiError(404, 'Channel does not exists')
        }

        return res.status(200).json(
            new ApiResponse(200, channel[0], 'User chennel fetched successfully')
        )
    } catch (error) {
        ApiCatchError(res, 'Error while getting the chennel profile', error, 500);
    }
}