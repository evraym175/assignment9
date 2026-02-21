import { Router } from "express";
import * as US from "./user.service.js"
import * as UV from "./user.validation.js";
import { authentication } from "../../common/middleware/authentication.js";
import { authorization } from "../../common/middleware/authoriztion.js";
import { RoleEnum } from "../../common/enum/user.enum.js";
import { validation } from "../../common/middleware/validation.js";

const userRouter = Router()


userRouter.post("/signUp",validation(UV.signupSchema),US.signUp)
userRouter.post("/signup/gmail",US.signupWithGmail)
userRouter.post("/signIn",validation(UV.signInSchema),US.signIn)
userRouter.get("/profile",authentication,US.getProfile)








export default userRouter