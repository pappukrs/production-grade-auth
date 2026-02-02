//src/utils/jwt.js


const jwt = require('jsonwebtoken');

require('dotenv').config();

const JWT_ACCESS_SECRET= process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET= process.env.JWT_REFRESH_SECRET;
const JWT_ACCESS_EXPIRY= process.env.JWT_ACCESS_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY= process.env.JWT_REFRESH_EXPIRY || '7d';


class JWTUtil{

    //Generate access token

    static generateAccessToken(payload){
        return jwt.sign(payload,JWT_ACCESS_SECRET,{
            expiresIn:JWT_ACCESS_EXPIRY
        })
    }




      //Generate refresh token

    static generateRefreshToken(payload){
        return jwt.sign(payload,JWT_REFRESH_SECRET,{
            expiresIn:JWT_REFRESH_EXPIRY
        })
    }



    //VERIFY ACCESS TOKEN

    static  verifyAccessToken(token){

        try {

           return jwt.verify(token,JWT_ACCESS_SECRET)
            
        } catch (error) {
              throw new Error(`Invalid or Expired Access token`) 
        }

    }



      //VERIFY ACCESS TOKEN

    static  verifyRefreshToken(token){

        try {

           return jwt.verify(token,JWT_REFRESH_SECRET)
            
        } catch (error) {
              throw new Error(`Invalid or Expired Access token`) 
        }


    }



    //DECODE TOKEN WITHOUT VERIFCATION (FOR DEBUG)

    static decode(token){
        return jwt.decode(token)
    }


    //GET Token expiru date

    static getTokenExpiry(expiryString){
        const match = expiryString.match(/^(\d+)([smhd])$/);
            if(!match) return new Date(Date.now()+ 7*24*60*60*1000);

            const value = parseInt(match[1]);
            const unit = match[2];

            const multipliers = {
            s:1000,
            m:60*1000,
            h:60*60*1000,
            d:24*60*60*1000
            };


            if(!multipliers[unit]){
                throw new Error(`Invalid Expiry Unit: ${unit}`);
            }

            return new Date(Date.now() + value*multipliers[unit]);
    }
}



module.exports=JWTUtil;