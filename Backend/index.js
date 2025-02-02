import mongoose from "mongoose";
import cookieParser from 'cookie-parser'
import express from 'express'
import dotenv from 'dotenv';
import path from 'path';

import connectDB from "./config/Db.js";


dotenv.config({
    path:'./env'
})
const app = express()

const port = process.env.PORT || 5000;

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 5000 , ()=>{
        console.log(`server is running at port ${process.env.PORT ||5000}`);
        
    })
    app.on("error" ,(error)=>{
        console.log("error",error);
        
        throw error
    })

}).catch((error)=>{
    console.log("mongodb connection failed !!! " , error);
    
})

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());

//import route
import userRoutes from './routes/user.routes.js'

//route declaration 
app.use("/api/v1/users" , userRoutes)


// app.get('/api/v1/home' , (req, res)=>{
//     res.send("hello india")
// })
// app.listen(port , ()=>{
//     console.log(`server is successfully running on port ${port}`)
// })
