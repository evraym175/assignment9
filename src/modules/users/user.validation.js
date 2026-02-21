import joi from "joi"
import { GenderEnum } from "../../common/enum/user.enum.js"


export const signupSchema = {

    body : joi.object({
        userName:joi.string().min(5).max(40).required(),
        email: joi.string().email().required(),
        password: joi.string().min(5).required(),
        cpassword: joi.string().valid(joi.ref("password")).required(),
        gender: joi.string().valid(...Object.values(GenderEnum)).required(),
        phone: joi.string().required()
}).required()

}

export const signInSchema = {
    body: joi.object({
        email: joi.string().required(),
        password: joi.string().min(5).required()
    }).required(),

    query : joi.object({
        x:joi.number().min(20).required()
    }).required(),

}