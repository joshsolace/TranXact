// requiring express and connectDb
require("dotenv").config()
const express = require ("express");
const connectDb = require("./database/db");
const userRoutes = require("./routes/userRoutes");
const path = require("path");


// invoking expess
const app= express();


// middleware
app.use(express.json());

// invoking connectDb
connectDb();


app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
  });
  
app.use("/api/v1/users", userRoutes);

404
app.use((req, res, next) => {
    const error = new Error("Not Found" + "😢😢😢😢😢😢😢");
    error.status = 404;
    next(error);
});

// Error handler
app.use((error, req, res, next) => {
    res.json({
        error: {
            message: error.message + "🔥🔥🔥🔥🔥🔥🔥🔥🔥"
        }
    });
});

module.exports=app
