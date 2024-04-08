import { ApiError } from "../utils/ApiError.js"
import JWT from 'jsonwebtoken'
import { UserModel } from "../models/userModel.js"
import { ApiCatchError } from "../utils/ApiCatchError.js"

export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || (req.headers["authorization"] && req.headers["authorization"].split(" ")[1]);

        // console.log("token", token);
        if (!token) {
            // throw new ApiError(401, "Unauthorized request...")
            return res.status(404).json({
                success: false,
                message: "Un-Authorized request"
            })
        }

        // if we got the token then we will verify/decode the token
        const decodedUser = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        // finding the user
        const user = await UserModel.findById(decodedUser?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }

        //now creating the user object in req like(req.user)
        req.user = user;
        next();
    } catch (error) {
        return ApiCatchError(res, "Error while verifying/decoding the user", error, 500);
    }
};


