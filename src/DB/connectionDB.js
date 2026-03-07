import mongoose from "mongoose";
import { DB_URI } from "../../config/config.service.js";

const checkConnectionDB = async () => {
    await mongoose.connect(DB_URI, {serverSelectionTimeoutMS: 5000})
    .then(()=>{
        console.log(`DB Connected Successfully to ${DB_URI}...✅`);  
    })
    .catch((error)=>{
        console.log(error,` DB Failed TO connect..`);
        
    })



};

export default checkConnectionDB