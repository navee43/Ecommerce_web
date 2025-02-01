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
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());
app.get('/api/v1/home' , (req, res)=>{
    res.send("hello india")
})
app.listen(port , ()=>{
    console.log(`server is successfully running on port ${port}`)
})
