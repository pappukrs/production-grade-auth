
//src/models/User.js


const pool = require('../config/database');
const bcrypt = require('bcryptjs');


class User {

    //Create User

    static async create({email,password,firstName,lastName}){
        const hashedPassword = await bcrypt.hash(password ,12);


        const query = `
        INSERT INTO users (email,password_hash, first_name,last_name) 
        VALUES ($1,$2,$3,$4)
        RETURNING id, email, first_name, last_name, role ,created_at
        `;


        const values = [email,hashedPassword,firstName,lastName];

        const result = await pool.query(query,values);

        return result.rows[0]
    }


    //find by email

    static async findByEmail(email){
        const query = `SELECT * FROM users WHERE email=$1`;

        const result = await pool.query(query,[email]);
        return result.rows[0]
    }


    //find by id

    static async findById(id){

        const query = `SELECT id,email, first_name , last_name, role ,is_active, created_at
        FROM users WHERE id=$1`;
        const result = await pool.query(query,[id]);
        return result.rows[0]

    }


    //verify password

    static async verifyPassword(plainPassword , hashedPassword){
        return await bcrypt.compare(plainPassword,hashedPassword)
    }




    //update user

    static async updateUser(id, updates){


        const fields = [];
        const values = [];

        let paramIndex = 1;

        Object.keys(updates).forEach((key)=>{
            

            if(updates[key]!==undefined){
                fields.push(`${key} = $${paramIndex}`);
                values.push(updates[key]);
                paramIndex++;
            }
        });


        if(fields.length==0)  return null;

        const query = `
        UPDATE users
        SET ${fields.join(',')} , updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramIndex}
        RETURNING id , email, first_name , last_name, role
        `

        values.push(id);

        const result = await pool.query(query, values)
        return result.rows[0]



    }


    //delete users
    static async delete(id){
        const query = `DELETE FROM users WHERE id=$1`;
        await pool.query(query,[id]);
    } 
}


module.exports=User;
