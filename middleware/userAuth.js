import dotenv from "dotenv";
import JWT from "jsonwebtoken";
import User from "../models/User.js";
import { verifyPass } from "../generate/genPass.js";

dotenv.config()

const verifyUserToken = async (req,res,next) => {
    const token = req.headers["access_token"];

    if (!token) {
        res.json({
            code: 403,
            status: "NOT_AUTHENTICATE",
            errors: [
                "user tidak terauthentikasi"
            ]
        })
    }

    try { 
        const decoded = JWT.verify(token, process.env.SECRET);
        if (!decoded) {
            res.json({
                code: 401,
                status: "NEED_TOKEN",
                errors: [
                    "token dibutuhkan"
                ]
            })
        } else {
            const query = {_id: decoded.id}
            const user = await User.find(query)
            const verifyPassword = verifyPass(user[0].password,decoded.password)
            if (verifyPassword) {
                next();
            } else {
                res.json({
                    code: 401,
                    status: "TOKEN_INVALID",
                    errors: [
                        "token invalid"
                    ]
                })
            }
        }
    } catch (err) {
        res.json({
            code: 401,
            status: "TOKEN_INVALID",
            errors: [
                "token invalid"
            ]
        })
    }
}

export default verifyUserToken;
