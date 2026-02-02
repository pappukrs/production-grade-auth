//src/controllers/authController.js


const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const JWTUtil = require('../utils/jwt');

class AuthController{

    //register


    static async register(req,res){


        try {


            const {email,password,firstName,lastName } = req.body;

            const existingUser = await User.findByEmail(email);

            if(existingUser){

                return res.status(400).json({
                    success:false,
                    message:'User with this email already exists'
                })
            }



            const user = await User.create({email,password,firstName,lastName });


            const accessToken= JWTUtil.generateAccessToken({
                userId : user.id,
                email: user.email,
                role:user.role
            })



            const refreshToken= JWTUtil.generateRefreshToken({
                userId: user.id
            })


            const refreshExpiry = JWTUtil.getTokenExpiry(process.env.JWT_REFRESH_EXPIRY);
            await RefreshToken.create(user.id, refreshToken, refreshExpiry);


            //set refresh token in http only cookie

            res.cookie('refreshToken',refreshToken,{
                httpOnly:true,
                secure: process.env.NODE_ENV=='production',  //HTTPS ONLY IN PROD
                sameSite: 'strict',
                maxAge: 7*24*60*60*1000  //7 days
            })

            return res.status(201).json({
                success:true,
                message:'User registered successfully',
                data:{
                    user:{
                        id:user.id,
                        email:user.email,
                        firstName:user.first_name,
                        lastName:user.last_name,
                        role:user.role
                    },

                    accessToken
                }



            })


            
        } catch (error) {


            console.log(`Register Error:,${error.message}`);

            return res.status(500).json({
                success:false,
                message:'Server Error during registrations'
            })
            
        }

    }



    //login



    static async login(req,res){


        try {


            const {email,password} = req.body;


            const user = await User.findByEmail(email);

            if(!user){
               return res.status(401).json({
                    success:false,
                    message:"Invalid email or password"
                })
            };
         

            const isPasswordValid = await User.verifyPassword(password,user.password_hash);

            if(!isPasswordValid){
                return res.status(401).json({
                    success:false,
                    message:'Invalid [Password'
                })
            };



            //check if user is active

            if(!user.is_active){

               return res.status(403).json({
                    success:false,
                    message:'Account is deactivated'
                })

            };


            //Generate token


            const accessToken = JWTUtil.generateAccessToken({
                userId:user.id,
                email:user.email,
                role:user.role
            })


            const refreshToken = JWTUtil.generateRefreshToken({
                userId:user.id
            })


            const refreshExpiry = JWTUtil.getTokenExpiry(process.env.JWT_REFRESH_EXPIRY)


            //saev refreshtoken to db

            await RefreshToken.create(user.id, refreshToken,refreshExpiry)




            //set refresh token in the http only

            res.cookie('refreshToken',refreshToken,{
                httpOnly:true,
                secure:process.env.NODE_ENV=='production',
                sameSite:'strict',
                maxAge: 7*24*60*60*1000
            })



            return res.status(200).json({
                success:true,
                message:"Login Successful",
                data:{
                    user:{
                        id:user.id,
                        email:user.email,
                        firstName:user.first_name,
                        lastName:user.lastName,
                        role:user.role
                    },
                    accessToken
                }

            })


            
        } catch (error) {

            console.error("Login error:",error);
            return res.status(500).json({
                success:false,
                message:'Server error during login'
            })
            
        }


    }



    //Refresh Token


    static async refresh(req,res){

        try {

            const refreshToken = req.cookies.refreshToken;

            if(!refreshToken){
               return  res.status(401).json({
                    success:false,
                    message:"No refresh token provided"
                })
            }

            //verify refresh token

           const decoded =  JWTUtil.verifyRefreshToken(refreshToken);


           //check refreshtoken in db and its revocation not happend


           const tokenRecord = await  RefreshToken.findByToken(refreshToken);



           if(!tokenRecord){

            return res.status(401).json({
                success:false,
                message:'Invalid Refresh Token'
            })
           }


           if(RefreshToken.isExpired(tokenRecord.expires_at)){
            return res.status(401).json({
                success:false,
                message:"Refresh Token Expired"
            })

           }



           //Genearte new token


           const newAccessToken = JWTUtil.generateAccessToken({
            userId:decoded.userId,
            email:tokenRecord.email,
            role:tokenRecord.role

           })

           const newRefreshToken = JWTUtil.generateRefreshToken({
             userId:decoded.userId
           })

           const refreshExpiry = JWTUtil.getTokenExpiry(process.env.JWT_REFRESH_EXPIRY);


           //Revoke old refresh token and save new one rotation

           await RefreshToken.revoke(refreshToken,newRefreshToken);


           await RefreshToken.create(decoded.userId, newRefreshToken, refreshExpiry);



           res.cookie('refreshToken',newRefreshToken,{
            httpOnly:true,
            secure:process.env.NODE_ENV=='production',
            sameSite:'strict',
            maxAge:7*24*60*60*1000
           })


           return res.status(200).json({
            success:true,
            message:'Token refreshed successfully',
            data:{
                accessToken:newAccessToken
            }
           })






            
        } catch (error) {

            console.error(`Refresh token error:${error.message}`)

            return res.status(500).json({
                success:false,
                message:"Iuuse in generating refresh token"
            })
            
        }

    }



    static async Logout(req,res){

        try {


            const refreshToken = await req.cookies.refreshToken;


            if(refreshToken){

                //revoke refresh token
                await RefreshToken.revoke(refreshToken)
            }


            //clear cookie
            res.clearCookie('refreshToken',{
                httpOnly:true,
                secure:process.env.NODE_ENV=="production",
                sameSite:'strict'
            })


            return res.status(200).json({
                success:true,
                message:'Logged Out Successfully'
            })
            
        } catch (error) {

            console.error("Logout Error:",error);
            return res.status(500).json({
                success:false,
                message:"Server error during logout"
            })
            
        }

    }




    //Get current user


    static async getMe(req,res){
        try {
            
            const user = await User.findById(req.user.id);


            if(!user){
                return res.status(404).json({
                    success:false,
                    message:"User Not found"
                })
            }


            return res.status(200).json({

                success:true,
                data:{
                    user:{
                        id:user.id,
                        email:user.email,
                        firstName:user.first_name,
                        lastName:user.last_name,
                        role:user.role
                    }
                }
            })
        } catch (error) {
            console.error("Get me error:",error)
            return res.status(500).json({
                success:false,
                message:'Server Error'
            })
            
        }
    }
}


module.exports = AuthController;
