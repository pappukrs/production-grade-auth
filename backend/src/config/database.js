
//src/config/database.js

const {Pool} = require('pg');
require('dotenv').config();



console.log("Pool",Pool)



const pool = new Pool({

    host: process.env.DB_HOST,
    port: process.env.DB_PORT,

    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,

    max:20,    //maximum number of connections

    idleTimeoutMillis: 30000,
    connectionTimeoutMillis:2000

})


//TEST

pool.on('connect',()=>{
    
        console.log(`Connected to postgres db`)
   
});




(
    async()=>{
        try {

            const client = await pool.connect()
            console.log(`Postgres connected Successfully`)
            client.release()
            
        } catch (error) {

            console.error(`Postgres Connection failed:,${error.message}`)
            process.exit(1)
            
        }
    }
)()


pool.on('error',()=>{
   console.error(`Unexpected postgres error:`,error)
   process.exit(1)
});



module.exports = pool;