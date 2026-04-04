import joi from "joi"
import { GenderEnum } from "../../common/enum/user.enum.js"
import { general_rules } from "../../common/utils/generalRules.js"


export const signupSchema = {

    body : joi.object({
        userName:joi.string().min(5).max(40).required(),
        email: general_rules.email.required(),
        password: general_rules.password.required(),
        cpassword: general_rules.cpassword.required(),
        gender: joi.string().valid(...Object.values(GenderEnum)).required(),
        phone: joi.string().required()
}).required(),

    file: general_rules.file.required()
}

export const rsetPasswordSchema = {

    body : joi.object({
        code: joi.string().length(6).required(),
        cpassword: general_rules.cpassword.required(),
        
}).required(),

    file: general_rules.file.required()
}

export const resendOtpSchema = {
    body: joi.object({
        email: general_rules.email.required()
    }).required()
}

export const confirmEmailSchema = {
    body: joi.object({
        email: general_rules.email.required(),
        code: joi.string().length(6).required(),
    }).required()
}

//     files:joi.array().max(2).items(
//         joi.object({
//         fieldname :joi.string().required(),
//         originalname :joi.string().required(),
//         encoding :joi.string().required(),
//         mimetype :joi.string().required(),
//         destination :joi.string().required(),
//         filename : joi.string().required(),
//         path:joi.string().required(),
//         size: joi.number().required()  
//         })
//     ).required()
// }

export const signInSchema = {
    body: joi.object({
        email: general_rules.email.required(),
        password: general_rules.password.required(),
        }).required()

}

export const shareProfileSchema = {
    body: joi.object({
        id: general_rules.id.required()
        }).required()

}

export const updateProfileSchema = {
    body: joi.object({
        firstName:joi.string().min(5).max(40),
        lastName:joi.string().min(5).max(40),
        gender: joi.string().valid(...Object.values(GenderEnum)),
        phone: joi.string(),
    }).required()
}
export const updatePasswordSchema = {
    body: joi.object({
        
        newPassword: general_rules.password.required(),
        cpassword:joi.string().valid(joi.ref("newPassword")),
        oldPassword: general_rules.password.required(),

    }).required()
}