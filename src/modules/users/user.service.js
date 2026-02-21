import { ProviderEnum } from "../../common/enum/user.enum.js";
import { successResponse } from "../../common/utils/response.success.js";
import { decrypt, encrypt } from "../../common/utils/security/encrypt.security.js";
import { Compare, Hash } from "../../common/utils/security/hash.security.js";
import { GenerateToken, VerifyToken } from "../../common/utils/token.service.js";
import * as db_service from "../../DB/db.service.js";
import userModel from "../../DB/models/user.model.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import {OAuth2Client} from "google-auth-library"
import { SALT_ROUNDS, SECRET_KEY } from "../../../config/config.service.js";
// const asyncHandler = (fn)=>{ 
//     return (req, res, next) => {
//         fn(req,res,next).catch((error)=>{
//             // res.status(404).json({msg:error.message})
//         })
//     }
// }



// Sign Up
export const signUp = async (req, res, next) => {
    const { userName, email, password,cpassword, gender ,phone } = req.body 


    //if(userName.split(" ") length<2){}

    if (password !== cpassword) {
    throw new Error("Invalid Password", { cause: 400 });
}


    if(
        await db_service.findOne({model:userModel,filter: {email} })) {
        //return res.status(409).json({message:`Email Already Exist`})
        throw new Error("Email Already Exist") 
    }
    const user = await db_service.create({model : userModel, data : {
        userName,
        email,
        password:   await Hash({plainText:password , salt_rounds: SALT_ROUNDS}),
        gender ,
        phone:encrypt(phone) }})
   //res.status(201).json({message : `Done`,user})
    successResponse({res,status:201 , data:user})

}

// Sign Up with gmail 
export const signupWithGmail = async (req, res, next) => {
    const { idToken} = req.body
    console.log(idToken);


const client = new OAuth2Client();

    const ticket = await client.verifyIdToken({
        idToken,
        audience: "414890839770-oev6n8f7dnkqs6c17clc6kh0c395knjs.apps.googleusercontent.com",  
});
const payload = ticket.getPayload(); 
const { email , email_verified,name,picture} = payload

let user = await db_service.findOne({model:userModel,filter:{email}})

if(!user){
user = await db_service.create({
    model: userModel,
    data: {
        email,
        confirmed: email_verified,
        userName: name,
        profilePicture: picture,
        provider: ProviderEnum.google
    }
})


}

if (user.provider == ProviderEnum.system){
    throw new Error("please login with system only",{cause:400})
    
}

    const access_token = GenerateToken({
        payload:{ id :user._id,email:user.email},
        secret_key:SECRET_KEY,
        options:{
            expiresIn:"1day",
        }

    }) 

    successResponse({res,message:"success Sign In" , data: {access_token}})


}
// Sign In

export const signIn = async (req, res, next) => {
    const {email, password} = req.body

    const user = await db_service.findOne({model:userModel,filter:{email , provider: ProviderEnum.system}})
    if(!user) {
        //return res.status(409).json({message:`User Not Exist`})
        throw new Error("User Not Exist",{cause:400})
    }


    if(!await Compare({plainText: password, cipherText : user.password})) {
        //res.status(400).json({message:`Uncorrect Password`})
        throw new Error("Uncorrect Password",{cause : 400})
    }
    
    // create token
    const access_token = GenerateToken({
        payload:{ id :user._id,email:user.email},
        secret_key:SECRET_KEY,
        options:{
            //expiresIn:60,
            //notBefore :60*60,
            //audience:"http//als",
            //noTimestamp:true
            //jwtid:uuidv4()
        }

    })
        successResponse({res,message:"success Sign In" , data: {access_token}})


    //res.status(201).json({message : `Done`,user})
    successResponse({res,message:"success Sign In" , data: {access_token}})
}


export const getProfile = async (req, res, next) => {
    // const {id} = req.params

    // const {authorization} = req.headers
    // const decoded = VerifyToken({token:authorization,secret_key:"Khaled"})

    


    //res.status(201).json({message : `Done`,user})
    console.log(req.user);
    
    successResponse({res, data : req.user })

}