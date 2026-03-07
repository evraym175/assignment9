import { ProviderEnum } from "../../common/enum/user.enum.js";
import { successResponse } from "../../common/utils/response.success.js";
import { decrypt, encrypt } from "../../common/utils/security/encrypt.security.js";
import { Compare, Hash } from "../../common/utils/security/hash.security.js";
import { GenerateToken, VerifyToken } from "../../common/utils/token.service.js";
import * as db_service from "../DB/db.service.js";
import userModel from "../../DB/models/user.model.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import {OAuth2Client} from "google-auth-library"
import { PREFIX, REFRESH_SECRET_KEY, SALT_ROUNDS, SECRET_KEY } from "../../../config/config.service.js";
import cloudinary from "../../common/utils/cloudinary.js";
import { compare } from "bcrypt";
// express > version 5   
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

    console.log(req.file);
    
//     //if(userName.split(" ") length<2){}

//     if (password !== cpassword) {
//     throw new Error("Invalid Password", { cause: 400 });
// }

    // if(!req.file) {
    //     throw new Error("File is Required")
    // }

    if(
        await db_service.findOne({model:userModel,filter: {email} })) {
        //return res.status(409).json({message:`Email Already Exist`})
        throw new Error("Email Already Exist") 
    }


    const {secure_url,public_id} = await cloudinary.uploader.upload(req.file.path,{
        folder:"Saraha_app",
        //public_id: "evraym"
        // use_filename: true,
        // unique_filename: false,
        resource_type:"image"
    }
    )

            // let array_path = []
            // for ( const file of req.files.attachments){
            //     array_path.push(file.path)
            // }

    const user = await db_service.create({model : userModel, data : {
        userName,
        email,
        password:   await Hash({plainText:password , salt_rounds: SALT_ROUNDS}),
        gender ,
        phone ,
        profilePicture : {secure_url ,public_id},
        //coverPictures : array_path
    }})
   //res.status(201).json({message : `Done..`,user})
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


    if(! Compare({plainText: password, cipherText : user.password})) {
        //res.status(400).json({message:`Uncorrect Password`})
        throw new Error("Uncorrect Password",{cause : 400})
    }
    
    // create token
    const access_token = GenerateToken({
        payload:{ id :user._id,email:user.email},
        secret_key:SECRET_KEY,
        options:{
            expiresIn:60 * 30,
            //notBefore :60*60,
            //audience:"http//als",
            //noTimestamp:true
            //jwtid:uuidv4()
        }
    })
            // refresh token
    const refresh_token = GenerateToken({
        payload:{ id :user._id,email:user.email},
        secret_key:REFRESH_SECRET_KEY,
        options:{
            expiresIn: "1y",
        }

    })
        successResponse({res,message:"success Sign In" , data: {access_token,refresh_token}})


    //res.status(201).json({message : `Done..`,user})
    
}


export const getProfile = async (req, res, next) => {
    // const {id} = req.params

    // const {authorization} = req.headers
    // const decoded = VerifyToken({token:authorization,secret_key:"batman"})

    


    //res.status(201).json({message : `Done..`,user})
    // console.log(req.user);
    
    successResponse({res, data : req.user })

}

export const shareProfile = async (req, res, next) => {

    const {id} = req.params

    const user = await db_service.findOne({
        model:userModel,
        id,
        select:"-password"
    })

    if(!user) {
        throw new Error("user Not Exist");
        
    }
    user.phone= decrypt(user.phone)
    
    successResponse({res, data : user })

}


export const updateProfile = async (req, res, next) => {

    let {firstName,lastName,gender,phone} = req.body
    if(phone){
        phone = encrypt(phone)
    }
    const user = await db_service.findOneAndUpdate({
        model:userModel,
        filter : {_id: req.user._id},
        update:{firstName,lastName,gender,phone}
    })

    if(!user) {
        throw new Error("user Not Exist");
        
    }
    
    successResponse({res, data : user })

}

export const updatePassword = async (req, res, next) => {

    let {oldPassword , newPassword} = req.body
    
    if(!compare({plainText:oldPassword , cipherText:req.user.password})){
        throw new Error("inValid old password");
        
    }

    const hash = Hash({ plainText : newPassword})

    req.user.password = hash
    await req.user.save()
    successResponse({res, })

}




export const refresh_token = async (req, res, next) => {

    const { authorization} = req.headers


        if (!authorization) {
            throw new Error("token not found");
    
    }
    
        const [prefix, token] = authorization.split(" ")
        if (prefix !== PREFIX) {
            throw new Error("inValid token prefix");
        
    }
    
        const decoded = VerifyToken({ token, secret_key: REFRESH_SECRET_KEY })
    
    if (!decoded || !decoded?.id) {
        throw new Error("inValid token");
    
    }
    
    const user = await db_service.findOne({ model: userModel, filter: { _id: decoded.id } })
    if (!user) {
        throw new Error("user not exist", { cause: 400 });
    
    }

        const access_token = GenerateToken({
        payload:{ id :user._id,email:user.email},
        secret_key:SECRET_KEY,
        options:{
            expiresIn: 60 * 5 ,
        }

    })

    successResponse({res, data : access_token })

}

