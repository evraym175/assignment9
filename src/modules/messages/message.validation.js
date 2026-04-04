import joi from "joi";
import { general_rules } from "../../common/utils/generalRules.js";

export const signInSchema = {
    body: joi.object({
        content: joi.string().required(),
        userId: general_rules.id.required(),
        }).required(),

        files:joi.array().max(3).items(general_rules.file).required()
}   
export const getMessageSchema = {
    params: joi.object({
        messageId: general_rules.id.required(),
        }).required(),
}   