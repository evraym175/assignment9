import { Router } from "express";
import * as US from "./user.service.js"
import * as UV from "./user.validation.js";
import { authentication } from "../../common/middleware/authentication.js";
import { authorization } from "../../common/middleware/authoriztion.js";
import { RoleEnum } from "../../common/enum/user.enum.js";
import { validation } from "../../common/middleware/validation.js";
import { multer_local, multer_server } from "../../common/middleware/multer.js";
import { multer_enum } from "../../common/enum/multer.enum.js";

const userRouter = Router()




userRouter.post("/signUp",
    multer_server(multer_enum.image).single("attachment"),
    validation(UV.signupSchema),  
    US.signUp
)

userRouter.post("/signup/gmail",US.signupWithGmail)
userRouter.post("/signIn",validation(UV.signInSchema),US.signIn)
userRouter.get("/refresh-token",US.refresh_token)
userRouter.get("/profile",authentication,US.getProfile)
userRouter.patch("/update-profile",authentication,validation(UV.updateProfileSchema),US.updateProfile)
userRouter.get("/share-profile/:id",validation(UV.shareProfileSchema),US.shareProfile)
userRouter.patch("/update-password",authentication,validation(UV.updatePasswordSchema),US.updatePassword)
userRouter.post("/logout",authentication,US.logout)




export default userRouter


