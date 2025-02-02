import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import bcrypt from 'bcrypt'




const generateAccessAndRefreshTokens =async(userId)=>{
  const user = await User.findById(userId)
  const accessToken = user.generateAccessToken()
  const refreshToken = user.generateRefreshToken()

  user.refreshToken=refreshToken;
  await user.save({validateBeforeSave:false})
  return {accessToken , refreshToken}
}

const registerUser = asyncHandler(async(req,res)=>{
   const {username , email , password} = req.body
   console.log(req.body)
   if([username , email,password].some((field)=>field?.trim()==="")){
    throw new ApiError(400 , "all fields are required")

   }

   const existedUser = await User.findOne(
    {
        $or:[
            {username},{email}
        ]
    }
   )
   if(existedUser){
    throw new ApiError(400 ,"by this name or email user already exists")
   }
   const user= await User.create({
     username:username.toLowerCase(), email , password
   })

    const createdUser = await User.findById(user._id).select(
       "-password -refreshToken"
    )


   if(!createdUser){
    throw new ApiError(404, "something went wrong while creating the user may be its mongodb")
   }

   return res.status(200).json(
    new ApiResponse(200 , createdUser , "user is created successfully")
   )
})



const LoginUser = asyncHandler(async(req,res)=>{
  const {email,username , password}= req.body;
  if(!username && !email)
  {throw new ApiError(400, "username or email is required")}

  const user = await User.findOne({
    $or:[{username}, {email}]
  })
  if(!user){
    throw new ApiError(400 , "user does not exist ")

  }
  const isPasswordCorrect = await user.isPasswordCorrect(password)
  if(!isPasswordCorrect){
    throw new ApiError(400 , "password is incorrect , try again ")
  }
  const {accessToken ,refreshToken} = await generateAccessAndRefreshTokens(user._id)

  const LoggedIn = await User.findById(user._id).select("-password -refreshToken")

  const options ={
    httpOnly:true,
    secure:true
  }
  return res.status(200).cookie("accessToken" , accessToken , options).cookie("refreshToken" , refreshToken , options)
          .json(new ApiResponse( 200,
            {
               user: LoggedIn , accessToken ,
               refreshToken
            },
            "user logged in successully"))
})


const LogoutCurrentUser = asyncHandler(async(req,res)=>{

  const user = await User.findByIdAndUpdate(req.user._id ,
    {
      $unset: {
        refreshToken:1
      },
     
    }, {
      new:true
    })
    const options = {
      httpOnly:true,
      secure:true
    }

    return res.status(200).clearCookie("accessToken" ,options).clearCookie("refreshToken" ,options).json(new ApiResponse(200,{},"user logout succesfully"))

})

const getAllUsers = asyncHandler(async(req,res)=>{  
  const users = await User.find().select("-password")
 

  return res.status(200).json(new ApiResponse(200 , users,"all users data"))


})

const getCurrentUser = asyncHandler(async(req,res)=>{
  const user = await User.findById(req.user._id).select("-password")
 if(!user){
  throw new ApiError(401 , "user not found ")
 }
  
  return res.status(200).json(new ApiResponse(200 , user," current user data"))


})

const UpdateCurrentUserProfile = asyncHandler(async(req,res)=>{
  const {username , email, oldPassword , newPassword}= req.body;
  const user = await User.findById(req.user?.id)
  console.log(user);


  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
  console.log(isPasswordCorrect);
  
  if(!isPasswordCorrect){
    throw new ApiError(400 ,"old password is wrong ! ")
  }
const hashedPassword = await bcrypt.hash(req.body.newPassword , 10)

const updatedUser =await User.findByIdAndUpdate(user?._id,
  {
    $set:{
      username:req.body?.username || user.username,
      email:req.body?.email || user.email,
      password:hashedPassword|| user.password    }
  }
)

  
  return res.status(200).json(new ApiResponse(200 , user,"user data updated successfully"))


})



const deleteUser = asyncHandler(async(req,res)=>{
 
  const {id} = req.params;
  console.log(id);

  const user = await User.findById(id)
  console.log(user);

  if(user){
    if(user.isAdmin){
      throw new ApiError(400 , "you can't delete admin")

    }
    const deleted_user = await User.deleteOne({_id:id});
    console.log(deleted_user)
  }
else{
  throw new ApiError(404 , "user not found please check user id")
}
  
  
  if(user.isAdmin){
    throw new ApiError(400 , "you cannot delete admin ")
  }{
    console.log("user is not an admin")
  }






  return res.status(200).json(new ApiResponse(200 , {} ,`user deleted successfully with the id :${req.params.id}`))
})


const getuserbyid = asyncHandler(async(req,res)=>{
  // const {id} = req.params.id;
  const user = await User.findById(req.params.id).select("-password")
  // console.log(user)
  if(!user){
    throw new ApiError(404 ,"user not found ")

  }
  return res.status(200).json(new ApiResponse(200 , user,"fetched user data succesfully"))

})

const updateUserById =asyncHandler(async(req,res)=>{
  
  // console.log(user);
  const user = await User.findById(req.params.id)

  const updated_user = await User.findByIdAndUpdate(req.params?.id , 
    {
      $set:{
        username:req.body.username || user.username
        ,email:req.body.email||user.email,
        isAdmin:Boolean(req.body.isAdmin) || user.isAdmin

      }
    }
  )
  return res.status(200).json(new ApiResponse(200 , updated_user , "user data updated successfully"))


})

export {registerUser , LoginUser ,LogoutCurrentUser ,getAllUsers ,getCurrentUser ,UpdateCurrentUserProfile,deleteUser ,getuserbyid ,updateUserById}