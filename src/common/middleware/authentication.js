import { SECRET_KEY } from "../../../config/config.service.js"
import userModel from "../../DB/models/user.model.js"
import { VerifyToken } from "../utils/token.service.js"
import * as db_service from "../../DB/db.service.js"



export const authentication = async (req, res, next) => {
    const { authorization } = req.headers

    if (!authorization) {
        throw new Error("token not found");

}

    const [prefix, token] = authorization.split(" ")
    if (prefix !== "bearer") {
        throw new Error("inValid token prefix");
    
}

    const decoded = VerifyToken({ token, secret_key: SECRET_KEY })

if (!decoded || !decoded?.id) {
    throw new Error("inValid token");

}

const user = await db_service.findOne({ model: userModel, filter: { _id: decoded.id } })
if (!user) {
    throw new Error("user not exist", { cause: 400 });

}
req.user = user

next()
}