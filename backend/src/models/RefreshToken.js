//src/models/RefreshToken.js

const pool = require('../config/database')

class RefreshToken{


   //create refresh token 
    static async create(userId, token, expiresAt){

        const  query = `INSERT INTO refresh_tokens (user_id, token , expires_at)
        VALUES ($1,$2,$3)
        RETURNING * 
        `;


        const values = [userId, token, expiresAt]

        const result =  await pool.query(query,values)

         return result.rows[0];


    }


    //findByToken

    static async findByToken(token){
        const query =`Select rt.* , u.email, u.role
        FROM refresh_tokens rt
        JOIN users u on rt.user_id = u.id
        where rt.token = $1 AND rt.revoked= false
        `;

        const values =[token];

        const result = await pool.query(query,values);

        return result.rows[0];
    }


    //revoke token

    static async revoke(token, replaceByToken=null){
        const query = `UPDATE refresh_tokens
        SET revoked = true , replaced_by_token = $2
        WHERE token = $1
                   `;

        const values = [token, replaceByToken]

        await pool.query(query,values);
    }


    //revoke all users tokens


    static async revokeAllUserTokens(userId){
        const query =`
        UPDATE refresh_tokens
        SET revoked= true
        WHERE user_id = $1 AND revoked = false
        `;
        const values = [userId]
        await pool.query(query,values)

    }




    //delete expired token (cleanup job)

    static async deleteExpired(){
        const query = `
        DELETE FROM refresh_tokens
        WHERE expires_at < CURRENT_TIMESTAMP OR revoked=true
        `

        await pool.query(query)
    }



    //check if token is expired

    static isExpired(expiresAt){
     return new Date()  > new Date(expiresAt)
    }



}


module.exports=RefreshToken;

