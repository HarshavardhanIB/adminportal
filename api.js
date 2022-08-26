const express = require('express');
const app = express();
app.use(express.json());
var mysql = require('mysql');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const date = require('date-and-time');
app.use(bodyParser.urlencoded({ extended: true })); 
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Sql@2022",
    database:"adminportal",
    port:3306,
    insecureAuth : true,
     });
app.post('/registration',(req,res)=>
{   
    // const saltRounds = 10;
    let data=req.body;
    console.log(req.body);
    let userName=data.userName;
    let emailId=data.emailid;
    let password=data.password;
    let role=data.role;
    //  console.log("passwords bcrypted  after " + bcryptpassword);
    // const salt = bcrypt.genSalt(6);
    // const hashed = bcrypt.hash(password, salt);
    const passwordHash = bcrypt.hashSync(password, 10);
    console.log("*********"+passwordHash); 
    let query="insert into user_details(user_name,email_id,password)values('"+userName+"','"+emailId+"','"+passwordHash+"')";
    console.log(query);

    con.query(query,function(err)
    {
    if(err)
    {
    console.error(err);
    res.send(err);
    }
    else{
    res.send("user created successfully");
    }
    })

})
app.post('/login',(req,res)=>
{
let


})
const port = 8899;
app.listen(port, () => {
    console.log("===================================");
  console.log(`Server running on port${port}`);
});