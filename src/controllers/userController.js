import { asyncHandler } from '../utils/asyncHandler.js'
import { UserModel } from '../models/userModel.js'
import { ApiValidationError } from '../utils/ApiValidationError.js'
import { ApiCatchError } from '../utils/ApiCatchError.js'
import { ApiSuccessResponse } from '../utils/ApiSuccessResponse.js'
import { uploadOnCloudinary } from '../utils/uploadCloudinary.js'


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

        let avatarLocalPath;
        if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
            avatarLocalPath = req.files.avatar[0].path;
        } else {
            return ApiValidationError(res, "Avatar file is required!", 400);
        }
        


        let coverImageLocalPath;
        if (req.files && Array.isArray(req.files.coverImage && req.files.coverImage.length > 0)) {
            coverImageLocalPath = req.files.coverImage[0].path
        }


        // uploading on the cloudinary
        const avatar = await uploadOnCloudinary(avatarLocalPath)
        // console.log('...',avatar);
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        if (!avatar) {
            return ApiValidationError(res, "Avatar file is required!", 400)
        }

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
        ApiCatchError(res, 'Error creating user', error, 500);
    }
}