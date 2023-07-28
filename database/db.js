// require mongoose
const mongoose = require("mongoose");

mongoose.set('strictQuery', false,);

// connecting to db
const connectDb = async ()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI_DEV)
        console.log("connected to database");


    } catch (error) {
        console.log(`error: ${error.message}`);
    }
}

module.exports= connectDb;