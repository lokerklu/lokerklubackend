import mongoose from "mongoose";

const Company = mongoose.model('company', {
    key: {
        type: Object,
        required: true
    },
    owner: {
        type: Object,
        default: ""
    },
    companyName: {
        type: String,
        required: true
    },
    nomor: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    companyType: {
        type: String,
        required: true
    },
    addres: {
        type: Object,
        required: true
    },
    password: {
        type: String,
        default: ""
    },
    activied: {
        type: Boolean,
        default: false
    },
    company_desc: {
        type: String,
        default: ""
    },
    company_images: {
        type: Array,
        default: []
    },
    company_reviews: {
        type: Array,
        default: []
    },
    lokersCount: {
        type: Number,
        default: 0
    },
    auth_token: {
        type: String,
        default: ""
    },
    created_at: {
        type: Date, 
        required: true, 
        default: Date.now 
    },
    updated_at: {
        type: Date, 
        required: true, 
        default: Date.now 
    }
})

export default Company;
