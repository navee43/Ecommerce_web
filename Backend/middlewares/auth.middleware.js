import jsonwebtoken  from 'jsonwebtoken'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'

 const verifyJWT = asyncHandler(async(req,res ,next)=>{
    

    try{

        const Token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer" , "")
        if(!Token){
            throw new ApiError(400 , "unauthorised req")
        }
        const decodedToken = jwt.verify(Token , process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken._id).
        select("-password -refreshToken")
        if(!user){
          throw new ApiError(401 , "invalid access token ")
      
        }
        req.user = user;
        next()
          }
          catch(err){
             throw new ApiError(401  , err?.message || "invalid access token ")
             
          }
})

const authorizeAdmin = (req, res ,next)=>{
    if(req.user && req.user.isAdmin){
        next()
    }else{
        res.status(401).send("not authorized as admin")
    }
}

export {verifyJWT , authorizeAdmin}