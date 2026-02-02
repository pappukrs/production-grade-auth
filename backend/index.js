const express = require('express');
require('dotenv').config();

// console.log(process.env);

const PORT = process.env.PORT;

const app = express();


app.get('/',()=>{
    try {

        console.log("Welcome to prod-grade-auth")
        
    } catch (error) {
        throw new Error(error.message)
    }
})


app.listen(PORT,async()=>{
    try {
        console.log(`Server successfully started at ${PORT}`)
    } catch (error) {

        console.log(`Error in staring the server at ${PORT}`)
    }
})


