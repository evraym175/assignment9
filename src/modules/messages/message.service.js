import userModel from "../../DB/models/user.model.js"
import * as db_service from "../../DB/db.service.js"
import { successResponse } from "../../common/utils/response.success.js"
import messageModel from "../../DB/models/user.model.js"

export const sendMessage = async (req,res,next) => {

const {content, userId} = req.body

const user = await db_service.findById({
    model:"user_model",
    id:userId
})

if(!user){
    throw new Error("User Not Found.")
}
let arr = []
if (req.files.length > 3){
    for (const  file of req.files) {
        arr.push(file.path)
    }
}

const message = await db_service.create({
    model:"messageModel",
    data:{
        content,
        userId,
        attachments:arr
    }
})

    successResponse(res,201,message,"Message Sent Successfully..")
}

export const getMessage = async (req,res,next) => {

    const {messageId} = req.params

    const message = await db_service.findOne({
        model:"messageModel",
        filter:{
            _id:messageId,
            userId: req.user._id
        }
    })

    if(!message){
        throw new Error("Message Not Found..")
    }

    successResponse(res,200,message,"Message Sent Successfully..")
}


export const getMessages = async (req,res,next) => {

    const messages = await db_service.find({
        model:"messageModel",
        filter:{
            userId: req.user._id
        }
    })
    successResponse(res,200,messages,"Message Sent Successfully..")
}