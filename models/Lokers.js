import mongoose from "mongoose";

const Lokers = mongoose.model('loker', {
    company_id: {
        type: String,
        required: true
    },
    companyName: {
        type: String, 
        required: true
    },
    comp_prof: {
        type: String
    },
    position: {
        type: String,
        default: ""
    },
    type: {
        type: String,
        default: ""
    },
    work_time: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        default: "open"
    },
    industry_type: {
        type: String,
        required: true
    },
    addres: {
        type: Object,
        required: true
    },
    fileField: {
        type: Object,
        default: ""
    },
    sellary: {
        type: Object,
        default: ""
    },
    link_desc: {
        type: String,
        default: ""
    },
    desc_job: {
        type: Array,
        default: []
    },
    applyeds: {
        type: Array,
        default: []
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

export default Lokers;
