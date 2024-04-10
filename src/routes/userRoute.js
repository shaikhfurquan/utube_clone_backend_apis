import express from 'express';
import { changeCurrentUserPassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails } from '../controllers/userController.js';
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


export default userRouter