
//src/middleware/auth.js


const JWTUtil = require('../utils/jwt');
const User = require('../models/User')




const auth = async(req,res,next)=>{
    try {

        const authHeader= req.headers?.authorization;

        if(!authHeader || !authHeader.startsWith('Bearer')){
            return res.status(401).json({
                success: false,
                message:'No tokens provided. Authorization denied'
            })
        }



        const token = authHeader.substring(7)

        const decoded = JWTUtil.verifyAccessToken(token);


    // DEBUG ONCE
     console.log("decoded",decoded);


        const user = await User.findById(decoded.userId);

        if(!user || !user.is_active){
            return res.status(401).json({
                success: false,
                message:'User not found or inactive'
            })
        }



        req.user={
            id:user.id,
            email:user.email,
            role:user.role
        }

        next();
        
    } catch (error) {
        

        if(error.message === 'Invalid or expired access token'){
            return res.status(401).json({
                success:false,
                message:'Token expired or Invalid'
            });
        }


        return res.status(500).json({
            success:false,
            message:'Server Error during authentication'
        })
    }
}



//role based authorization

const authorization = async (...roles)=>{

    return (req,res,next)=>{

        if(!req.user){
            res.status(401).json({
                success:false,
                message:'unauthorized'
            })
        }

        if(!roles.includes(req.user.role)){
            return res.status(403).json({
                success:false,
                message:'Forbidden Insufficient permission'
            })
        }

    }




}




module.exports = {auth,authorization}
