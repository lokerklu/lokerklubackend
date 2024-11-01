import mongoose from "mongoose";

const Admin = mongoose.model("admin", {
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    auth_token: {
        type: String,
        default: ""
    }
})

export default Admin;
