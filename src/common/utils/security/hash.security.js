import { hashSync,compareSync } from "bcrypt"

export const Hash = async({plainText, salt_rounds =  process.env.SALT_ROUNDS} = {}) => {
    return hashSync(plainText, Number(salt_rounds))

}
export const Compare = async({plainText, cipherText} = {}) => {
    return compareSync(plainText, cipherText)

}