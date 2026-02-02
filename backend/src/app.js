// src/app/js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit')



const authRoute = require('./routes/authRoutes');



// console.log(process.env);

const PORT = process.env.PORT;

const app = express();




//Rate limiting

const limiter = rateLimit({
    windowMs: 15*60*1000,  //15 minutes
    max:100, //Limit each ip to 100 requests per windows,
    message:"Too many Requests from this IP,please try again later"
})



//middleware

app.use(helmet());  //security header


//rate limilting

app.use(limiter);

app.use(
    cors({

        origin:process.env.CLIENT_URL,
        credentials:true //allow cookies

    })
        
    
)


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());



app.use('/api/auth',authRoute)




app.get('/health',(req,res)=>{
    res.status(200).json({
        status:'OK',
        message:"Server is running"
    })
})


app.use((err,req,res,next)=>{
    console.log(err.stack);

    res.status(500).json({
        success:false,
        message:"Something went wrong"
    })
})
app.listen(PORT,async()=>{
    try {
        console.log(`Server successfully started at ${PORT}`)
    } catch (error) {

        console.log(`Error in staring the server at ${PORT}`)
    }
})


