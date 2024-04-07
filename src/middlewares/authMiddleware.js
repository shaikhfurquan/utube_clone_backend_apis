import { ApiValidationError } from "../utils/ApiValidationError.js"
import JWT from 'jsonwebtoken'
import { UserModel } from "../models/userModel.js"
import { ApiCatchError } from "../utils/ApiCatchError"

export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers["authorization"].split(" ")[1]
        if (!token) {
            return ApiValidationError(res, "Un-authenticated request", 401)
        }
    
        // if we got the token then we will verify/decode the token
        const decodedUser = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        // finding the user
        const user = await UserModel.findById(decodedUser?._id).select("-password -refreshToken")
    
        if (!user) {
            return ApiValidationError(res, "Invalid access token", 401)
        }
    
        //now creating the user object in req like(req.user)
        req.user = user
        next()
    } catch (error) {
        return ApiCatchError(res , "Error while verifying/docoding the user" , 500)
    }
}  