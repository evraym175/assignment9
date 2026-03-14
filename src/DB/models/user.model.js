import mongoose from "mongoose";
import { RoleEnum,GenderEnum, ProviderEnum } from "../../common/enum/user.enum.js";




const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required: true,
        minLength: 3,
        maxLength: 20,
        trim: true
    },
    lastName:{
        type:String,
        required: true,
        minLength: 3,
        maxLength: 6,
        trim: true
    },
    email:{
        type:String,
        required: true,
        unique:true,
        trim: true,
    },
    password:{
        type:String,
        required: function(){
            return this.provider == ProviderEnum.google ? false : true
        },
        trim : true
        
    },
    age:Number,
    gender:{
        type:String,
        enum:Object.values(GenderEnum),
        default: GenderEnum.male
    },
    phone:{type:String},
    profilePicture:{
        secure_url : String , 
        public_id: String 
        ,coverPictures:[{
            secure_url : {type : String , required:true},
            public_id: {type : String , required:true}
        }],
    },
    changeCredential:Date,
    confirmed:Boolean,
    provider:{
        type: String,
        enum: Object.values(ProviderEnum),
        default: ProviderEnum.system
    },
        
    role:{
        type: String,
        enum: Object.values(RoleEnum),
        default: RoleEnum.admin


    }
},{
    timestamps: true,
    strictQuery: true, 
    toJSON: {virtuals:true},
    toObject: {virtuals:true}


})

userSchema.virtual("userName")
    .get(function(){
        return this.firstName + " " + this.lastName
    })
    .set(function (v) {
        const [firstName,lastName]= v.split(" ")
        this.set({firstName ,lastName})
    })

const userModel = mongoose.models.user || mongoose.model("user",userSchema)

export default userModel