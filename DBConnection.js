const mysql = require('mysql');
require('dotenv').config();
const { makeDb } = require('mysql-async-simple');
config = {
    host:process.env.DBDB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_DATABASE,
    port:process.env.DB_PORT,
    insecureAuth : process.env.DB_INSECUREAUTH
}
async function Connection(){
  const connection= mysql.createConnection(config);
  const db = makeDb();
  // await db.connect(connection); 
  return {db,connection};
}
// var connection =mysql.createConnection(config); 
// const db = makeDb();
// await db.connect(connection);  
module.exports ={
    //  connection : mysql.createConnection(config),
     Connection
} 