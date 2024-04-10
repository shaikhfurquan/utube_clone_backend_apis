import express from 'express';
import { changeCurrentUserPassword, getCurrentUser, getUserChennelProfile, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from '../controllers/userController.js';
import { upload } from '../middlewares/multerMiddleware.js'
import { isAuthenticated } from '../middlewares/authMiddleware.js';

const userRouter = express.Router();

// register user 
userRouter.post('/register',
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

userRouter.post('/login' , loginUser)
userRouter.post('/logout' , isAuthenticated ,logoutUser)
userRouter.post('/refresh-token' ,refreshAccessToken)

userRouter.post('/change-password' , isAuthenticated , changeCurrentUserPassword)

userRouter.get('/current-user' , isAuthenticated , getCurrentUser)

userRouter.patch('/update-account' , isAuthenticated , updateAccountDetails)

userRouter.patch('/update-avatar' , isAuthenticated , upload.single('avatar') , updateUserAvatar)

userRouter.patch('/update-cover-image' , isAuthenticated , upload.single('coverImage') , updateUserCoverImage)

userRouter.get('/c/:userName' , isAuthenticated , getUserChennelProfile)
export default userRouter