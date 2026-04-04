import { ProviderEnum } from "../../common/enum/user.enum.js";
import { successResponse } from "../../common/utils/response.success.js";
import { decrypt, encrypt } from "../../common/utils/security/encrypt.security.js";
import { Compare, Hash } from "../../common/utils/security/hash.security.js";
import { GenerateToken, VerifyToken } from "../../common/utils/token.service.js";
import * as db_service from "../../DB/db.service.js";
import userModel from "../../DB/models/user.model.js";
import revokeTokenModel from "../../DB/models/revokeToken.model.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import {OAuth2Client} from "google-auth-library"
import { PREFIX, REFRESH_SECRET_KEY, SALT_ROUNDS, SECRET_KEY } from "../../../config/config.service.js";
import cloudinary from "../../common/utils/cloudinary.js";
import { compare } from "bcrypt";
import { hash, randomUUID } from "node:crypto";
import { deletekey, get_key, incr, keys, max_otp_key, otp_key, revoke_key, setValue, ttl, get, block_otp_key } from "../../DB/redis/redis.service.js";
import { genertaeOtp, sendEmail } from "../../common/utils/email/send.email.js";
import { emailTemplate } from "../../common/utils/email/email.template.js";
import { eventEmitter } from "../../common/utils/email/email.events.js";
// const asyncHandler = (fn)=>{ 
//     return (req, res, next) => {
//         fn(req,res,next).catch((error)=>{
//             // res.status(404).json({msg:error.message})
//         })
//     }
// }


const sendEmailOtp = async ({ email , subject } = {}) => {
    const isBlocked = await ttl(block_otp_key({ email }))
    if (isBlocked > 0) {
        throw new Error(`you have requested many times, please try again later after ${isBlocked} seconds`);
    }

    const otpTTl = await ttl(otp_key({ email , subject })) 
    if (otpTTl > 0) {
        throw new Error(`you can request new otp after ${otpTTl - 60} seconds`)
    }

    const maxTry = await get(max_otp_key({ email }))
    if (maxTry >= 3) {
        await setValue({ key: block_otp_key({ email }), value: 1, ttl: 60 })
        throw new Error("you have exceeded the maximum number of tries, please try again later")
    }

    const otp = await genertaeOtp()
    
    eventEmitter.emit(emailEnum.confirmEmail, async () => {
        await sendEmail({
            to: email,
            subject: "welcome to Saraha App",
            html: emailTemplate(otp)
        })

        await setValue({ 
            key: otp_key({ email, subject }), 
            value: Hash({ plainText: `${otp}` }), 
            ttl: 60 * 2 
        })

        await incr({ key: max_otp_key({ email }) })
    })
}



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
    const otp = await genertaeOtp()
    eventEmitter.emit(emailEnum.confirmEmail, async () => {

        await sendEmail({
        to : email,
        subject : "welcome to Saraha App",
        html: emailTemplate(otp)
    })

    await setValue({ key: otp_key({email,subject:emailEnum.confirmEmail}) , value : Hash({plainText : `${otp}`}) , ttl: 60 * 2})


    await setValue({ key: max_otp_key({email}) , value : 1 , ttl: 30})

    })
    
    
    successResponse({res,status:201 ,message : "success signup", data:user})


}

export const confirmEmail = async (req,res,next) => {
    const { email , code} = req.body 
    const otpExist = await get(otp_key({email}))

    if(!otpExist){
        throw new Error("otp Expired");
        
    }
    if (!Compare({plainText: code ,cipher_text: otpExist})){
        throw new Error("invalid Otp");
        
    }

    const user = db_service.findOneAndUpdate({
        model:userModel,
        filter:{email , confirmed:{$exists:false},provider: ProviderEnum.system},
        update :{confirmed : true}

    })
    
    if(!user){
        throw new Error("user not exist");
        
    }
    await deletekey(otp_key({email ,subject:emailEnum.confirmEmail}))
    successResponse({res,message:"email confirmed successfuly "
    })
}

export const resendOtp = async (req,res,next) => {
    const { email } = req.body 


    const user = db_service.findOne({
        model:userModel,
        filter:{email , confirmed:{$exists:false},provider: ProviderEnum.system},
    })
    
    if(!user){
        throw new Error("user not exist or already confirmed");
        
    }



    await sendEmailOtp({email, subject:emailEnum.confirmEmail})
    successResponse({res,message:"email confirmed successfuly "
    })
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

    const user = await db_service.findOne({
        model:userModel,filter:{
            email ,
            provider: ProviderEnum.system,
            confirmed:{$exists: true}
        }
    })
    if(!user) {
        //return res.status(409).json({message:`User Not Exist`})
        throw new Error("User Not Exist",{cause:400})
    }


    if(! Compare({plainText: password, cipherText : user.password})) {
        //res.status(400).json({message:`Uncorrect Password`})
        throw new Error("Uncorrect Password",{cause : 400})
    }
    const jwtid = randomUUID()
    
    // create token
    const access_token = GenerateToken({
        payload:{ id :user._id,email:user.email},
        secret_key:SECRET_KEY,
        options:{
            expiresIn:60 * 30,
            //notBefore :60*60,
            //audience:"http//als",
            //noTimestamp:true
            jwtid
        }
    })
            // refresh token
    const refresh_token = GenerateToken({
        payload:{ id :user._id,email:user.email},
        secret_key:REFRESH_SECRET_KEY,
        options:{
            expiresIn: "1y",
            jwtid
        }

    })
        successResponse({res,message:"success Sign In" , data: {access_token,refresh_token}})


    //res.status(201).json({message : `Done..`,user})
    
}

export const forgetPassword = async (req, res, next) => {
    const {email} = req.body

    const user = await db_service.findOne({
        model:userModel,
        filter:{
            email ,
            provider: ProviderEnum.system,
            confirmed:{$exists: true}
        }
    })
    if(!user) {
        throw new Error("User Not Exist",{cause:400})
    }

    await sendEmailOtp({email, subject:emailEnum.forgetPassword})
    successResponse({res,message:"otp sent to your email successfuly "})
    
}

export const resetPassword = async (req, res, next) => {
    const {email , code , password} = req.body

    const otpValue = await get(otp_key({email, subject:emailEnum.forgetPassword}))
    if(!otpValue){
        throw new Error("otp Expired");
    }

    if (!Compare({plainText: code ,cipher_text: otpValue})){
        throw new Error("invalid Otp");
    }

    const user = await db_service.findOneAndUpdate({
        model:userModel,
        filter:{
            email ,
            provider: ProviderEnum.system,
            confirmed:{$exists: true}
        },
        update:{
            password:  Hash({plainText:password }),
            changeCredential: new Date()
        }
    })
    if(!user) {
        throw new Error("User Not Exist",{cause:400})
    }

    await deletekey(otp_key({email, subject:emailEnum.forgetPassword}))

    successResponse({res,message:"password changed successfuly "})
    
}



export const getProfile = async (req, res, next) => {
    // const {id} = req.params

    // const {authorization} = req.headers
    // const decoded = VerifyToken({token:authorization,secret_key:"evraym"})

    //res.status(201).json({message : `Done.`,user})
    // console.log(req.user);
    
    const key = `profile::${req.user._id}`

    const userExist = await get(key)
    if(userExist){
        console.log("from cache");
        
        return successResponse({res, data : userExist })
    }
        console.log("out cache");

    await setValue({ key, value: req.user , ttl : 60})

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
    await deletekey(`profile::${req.user._id}`)
    
    successResponse({res, data : user })

}

export const updatePassword = async (req, res, next) => {

    let {oldPassword , newPassword} = req.body
    
    if(!Compare({plainText:oldPassword , cipherText:req.user.password})){
        throw new Error("inValid old password");
        
    }

    const hash = Hash({ plainText : newPassword, salt_rounds: SALT_ROUNDS})

    req.user.password = hash
    req.user.changeCredential = new Date()

    await req.user.save()
    successResponse({res, message : "password updated successfuly" })

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
    const revokeToken = await db_service.findOne({ model : revokeTokenModel, filter: {tokenId: decoded.jti}})
    if (revokeToken) {
        throw new Error("Invalid Token revoked");
        
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


export const logout = async (req, res, next) => {

    const {flag} = req.query
    if (flag === "all"){
        req.user.changeCredential = new Date()
        await req.user.save()
        await deletekey(await keys(get_key({userId : req.user._id})))

        // await db_service.deleteMany({ model:revokeTokenModel, filter:{ userId:req.user._id}})


    } else{
        await setValue({
            key : revoke_key({ userId:req.user._id , jti:req.decoded.jti}),
            value :`${req.decoded.jti}`,
            ttl : req.decoded.exp - Math.floor(Date.now()/1000)
        })
        // await db_service.create({
        //     model : revokeTokenModel,
        //     data:{
        //         tokenId :req.decoded.jti,
        //         userId :req.user._id,
        //         expiredAt : new Date(req.decoded.exp * 1000)
        //     }
        // })
    }

    
    successResponse({res})

}