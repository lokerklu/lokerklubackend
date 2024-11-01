import mongoose from "mongoose";

const User = mongoose.model("user", {
    key: {
        type: Object,
        required: true
    },
    fullname: {
        type: String,
        required: true
    },
    study: {
        type: String, 
        default: ""
    },
    email: {
        type: String,
        required: true
    },
    addres: {
        type: Object, 
        default: ""
    },
    cv: {
        type: Object,
        default: "" 
    },
    plus: {
        type: Array,
        default: []
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

export default User;
