const { string } = require("joi");
const mongoose = require ("mongoose");

const userSchema = mongoose.Schema({
    firstname:{
        type: String,
    },
    lastname: {
        type: String,
    },
    email: {
        type: String,
    },
    PhoneNumber: {
        type: String,
    },
    password: {
        type: String,
    },
    verificationToken: {
        type: String,
    },
    isVerified: {
            type: Boolean,
            default: false,
    }
},{
    timestamps: true
});


module.exports=mongoose.model("User", userSchema)