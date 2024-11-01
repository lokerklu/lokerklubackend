import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config()

const database = process.env.MONGODB_URI

mongoose.connect(database, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", () => console.log("database tidak connect contol"))
db.once("open", () => console.log("database connect"))

export default mongoose
