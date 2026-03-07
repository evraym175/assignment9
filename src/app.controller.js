
import express from "express";
import checkConnectionDB from "./DB/connectionDB.js";
import userRouter from "./modules/users/user.controller.js";
import cors from "cors"
import { PORT } from "../config/config.service.js";

const app = express();
const port = PORT

const bootstrap = () => {
    

    app.use(express.json())
    app.use(cors())

    checkConnectionDB()

    app.use("/uploads",express.static("uploads"))
    app.use("/users",userRouter)

    app.get("/",(req,res,next)=>{
        res.status(200).json({message:`Welcome ON Saraha APP ..`})
    })

    app.use("{/*demo}",(req,res,next)=>{
        throw new Error(`Url ${req.originalUrl} Not Found...`,{cause:404})
    })
    app.use((err, req, res, next) => {
        res.status(err.cause || 500).json({message : err.message , stack:err.stack,error:err})
})



    app.listen(port,()=>{
        console.log(`server is Running on port ${port}..⏳`);
    })

}

export default bootstrap