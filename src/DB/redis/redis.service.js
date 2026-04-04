import { json } from "express";
import { redisClient } from "./redis.db.js";

export const revoke_key = ({userId,jti})=>{
    return `revoke_token  ::${userId}::${jti}`
}

export const get_key = ({userId})=>{
    return `revoke_token::${userId}`
}

export const otp_key = ({email,subject = emailEnum.confirmEmail})=>{
    return `otp::${email}`
}

export const max_otp_key = ({email})=>{
    return `otp_key::${email}::max_try`
}

export const block_otp_key = ({email})=>{
    return `otp_key::${email}::block`
}


export const setValue = async ({key,value,ttl}= {}) => {
    try {
        const data = typeof value === "string" ? value : JSON.stringify(value);
        return ttl 
            ? await redisClient.set(key, data, { EX: ttl }) 
            : await redisClient.set(key, data);
    } catch (error) {
        console.log("error to set data in redis", error);
    }
}

export const update = async ({key,value , ttl}={}) =>{
    try {
        if(!await redisClient.exists(key)) return 0
    } catch (error) {
        console.log(error , "fail to update operation");
        
    }
}
export const get = async (key ) => {
    try {
        try {
            return JSON.parse(await redisClient.get(key))
    } catch (error) {
        return await redisClient.get(key)
    }
    } catch (error) {
        console.log("error to get data from redis", error);
    }
}

export const exists = async (key) => {
    try {
        return await redisClient.exists(key)
    } catch (error) {
    console.log("error to check data exists in redis", error);
    }
}

export const expire = async (key,ttl) => {
    try {
        return await redisClient.exists(key)
    } catch (error) {
    console.log(" data expire in redis", error);
    }
}

export const ttl = async (key) => {
    try{
        return await redisClient.ttl(key)
    }
    catch (error) {
    console.log("error to get ttl from redis", error);

    }

}


export const deletekey = async ( key ) => {
    try{
        if(!key.length) return 0
    }catch (error) {
console.log("error to delete data from redis", error);
}
}

export const keys = async (pattern) => {
    try {
    return await redisClient.keys(`${pattern} *`)
    } catch (error) {
    console.log("error to get keys from redis", error);

    }

}

export const incr = async (pattern) => {
    try {
    return await redisClient.incr(key)
    } catch (error) {
    console.log(error, "fail to incr operation")

    }

}

