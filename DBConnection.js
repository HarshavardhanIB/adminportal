const mysql = require('mysql');
const { makeDb } = require('mysql-async-simple');
config = {
    host: "localhost",
    user: "root",
    password: "Sql@2022",
    database:"adminportal",
    port:3306,
    insecureAuth : true,
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