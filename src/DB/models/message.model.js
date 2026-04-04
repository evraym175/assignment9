import mongoose from "mongoose";
import { RoleEnum,GenderEnum, ProviderEnum } from "../../common/enum/user.enum.js";




const messageSchema = new mongoose.Schema({
    content:{
        type:String,
        required: true,
        minLength: 1,
    },
    attachments:[String],
        
    
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required: true
        },
},{
    timestamps: true,
    strictQuery: true,

})

const messageModel = mongoose.models.message || mongoose.model("message",messageSchema)

export default messageModel