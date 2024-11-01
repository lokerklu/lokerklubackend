import cors from "cors";
import dotenv from "dotenv";
import "./utils/database.js";
import express from "express";
import bodyParser from "body-parser";
import router from "./routes/router.js"
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import rateLimitMiddleware from "./middleware/requestLimiter.js";

dotenv.config();

const port  = process.env.PORT || 8000;

const app = express();

app.use(cors({
    origin: ["https://lokerklu.info"], 
    method: ["GET","POST"] 
}))

app.use(rateLimitMiddleware)
app.use(cookieParser())
app.use(express.json()) 
app.use(express.static("public")) 
app.use(bodyParser.urlencoded({extended: true})) 
app.use(mongoSanitize())

app.use(router);

app.listen(port, () => {
    console.log(`server still runing on port ${port}`);
})
