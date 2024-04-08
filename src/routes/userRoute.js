import express from 'express';
import { loginUser, logoutUser, registerUser } from '../controllers/userController.js';
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

export default userRouter