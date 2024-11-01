import mongoose from "mongoose";

const Message = mongoose.model("message", {
    key: {
        type: Object
    },  
    room_key: {
        type: String,
        unique: true,
        required: true
    },
    users: {
        type: Array, 
        required: true
    },
    messages: {
        type: Array
    },
    created_at: { 
        type: Date, 
        required: true, 
        default: Date.now 
    },
    update_at: { 
        type: Date, 
        required: true, 
        default: Date.now 
    }
})

export default Message;
