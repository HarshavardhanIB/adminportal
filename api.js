const express = require('express');
var formidable=require('formidable');
var multer = require('multer');
var nStatic = require('node-static');
var fs=require('fs');
const app = express();
app.use(express.json());
// var mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const userMailCheck=require('./userNameAndMail');
const date = require('date-and-time');
const expiresIn="10m";
const algorithm="HS512";
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(function (req, res, next) {
    // console.log("request");
    // console.log(req);
    // console.log(req.body);
    // console.log(next);
    
    // Website you wish to allow to connect    
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow    
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of  middlewarenext();
    next();
})
// const dbConnection = require('./DBConnection');
var passwordHashFile=require('./passwordHashing');
const {Connection} = require('./DBConnection');
const accessTokenSecret = 'ideabytes';
// dotenv.config();
// var con = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "Sql@2022",
//     database:"adminportal",
//     port:3306,
//     insecureAuth : true,
//      });
app.post('/registration',async(req,res)=>
{   
    // Pass to next layer of middlewarenext();
    console.log("register");
    try
    {// const saltRounds = 10;
    let data=req.body;
    console.log(req.params);
    console.log(req.body);
    let userName=data.userName;
    let emailId=data.emailid;
    let password=data.password;
    let roleid=data.roleId;
    // var connection=dbConnection.connection;
    var con=await Connection();

    console.log(con);
    console.log(con.db);
    
    let Usernamestatus=await userMailCheck.checkUsrname(userName,con.db,con.connection);
    console.log("the username status ");
    console.log(Usernamestatus);
    if(Usernamestatus==true)
    {
        let responseData=
                {
                    "statusCode" :202,
                    "message":"User name already exists please user another username"
                }                 
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
                return res;
    }
    let checkEmailStatus=await userMailCheck.emialIdcheck(emailId,con.db,con.connection);
    console.log("check mail status"+checkEmailStatus);
    if(checkEmailStatus==true)
    {
        let responseData=
                {
                    "statusCode" :202,
                    "message":"Email id already exists please user another emailid"
                } 
                
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
                return res;
    }
    // let userNameQuery="select user_name from users where user_name='"+userName+"'";
    // let emailQuery="select user_name from users where email_id ='"+emailId+"'";
    // connection.query(userNameQuery,function(err,result){
    //     if(result.length!=0)
    //     {
    //         let responseData=
    //                     {
    //                         "statusCode" :200,
    //                         "message":"User name already exists please user another username"
    //                     }                 
    //                     let jsonContent = JSON.stringify(responseData);
    //                     // res.json(responseData);
    //                     return res.end(jsonContent);
    //                     // return res;
    //     }
    // });
    // connection.query(emailQuery,function(err,result){
    //     if(result.length!=0)
    //     {
    //         let responseData=
    //                     {
    //                         "statusCode" :200,
    //                         "message":"Email id already exists please user another emailid"
    //                     }                 
    //                     let jsonContent = JSON.stringify(responseData);
    //                     return res.end(jsonContent);
    //                     // res.end();
                        
    //     }
    // });
        //  var connection=dbConnection.connection;
     let checkRole=await userMailCheck.checkRole(roleid,con.db,con.connection);
    console.log("check mail status"+checkRole);
    if(checkRole==true)
    {
        let responseData=
                {
                    "statusCode" :202,
                    "message":"In valid role id "
                }                 
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
                return res;
    }
    let active ="1";
    const now= new Date();
    const currentDateAndTime = date.format(now,'DD-MM-YYYY:HH-MM-ss');
    console.log("tttttt"+currentDateAndTime);
      // var passwordHash = bcrypt.hashSync(password, 10);
    const passwordHash=passwordHashFile.pass(password);
    console.log("*********"+passwordHash);

    // let roleQuery="select id from roles where id ='"+roleid+"'";
    // connection.query(roleQuery,function(err,result)
    // {
    //     if(err)
    //     {
    //        let responseData=
    //         {
    //             "statusCode" :500,
    //             "error": err.stack,
    //             "result":"error while inserting the data " 
    //         }
    //     }
    //     else
    //     {
    //         if(result.length == 0){
    //             console.log("exits")
    //         let responseData=
    //          {
    //             "statusCode" :200,
    //             "message":"In valid role id " 
    //          }
    //          const jsonContent = JSON.stringify(responseData);
    //          return res.end(jsonContent);
    //         //  return res; 
    //           }else{
    //             console.log("valid");
    //           }
    //    }

    // }
    // )
    let query="insert into users(role_id,user_name,email_id,password,active,created_date_and_time,update_date_and_time)values(?,?,?,?,?,?,?)";
    // "+" ('"+roleid+"','"+userName+"','"+emailId+"','"+passwordHash+"','"+active+"','"+currentDateAndTime+"','"+currentDateAndTime+"')";
    console.log("%%%%%%%"+query);
    var connect=con.connection;
    connect.query(query,[roleid,userName,emailId,passwordHash,active,currentDateAndTime,currentDateAndTime],function(err)
    {
        let responseData="";
        if(err)
        {
        console.error(err);
        responseData=
            {
            "statusCode" :500,
            "error": err.stack,
            "result":"error while inserting the data " 
            }
            let jsonContent = JSON.stringify(responseData);
            return res.end(jsonContent); 
            // return res; 
        }
    else
    {
    let responseData={
        "statusCode":200,
        "message":"User registred successfully"
        };
         
        let jsonContent = JSON.stringify(responseData);
        res.end(jsonContent); 
        return res;   
    }     
    })
}
catch(err)
{
    console.log(err.stack);
        responseData={
        "statusCode":404,
        "result":err.stack,
        };
        const jsonContent = JSON.stringify(responseData);
        res.end(jsonContent);
        return res; 
}
    
})
app.get('/userNameAndMailIdsinDB',(req,res)=>
{
    try{
    var connection=dbConnection.connection;
    let query="select user_name,email_id from user_details";
    connection.query(query,function(err,result)
    {
        let responseData="";
        if(err)
            {
                responseData={
                    "statusCode":500,
                    "error":err.stack,
                    "result":"getting error while getting the data from the data base"
                }
            }    
        else
            {
                responseData={
                    "statusCode":200,
                    "result":result                    
                }
            }
        const jsonContent = JSON.stringify(responseData);
        res.end(jsonContent);
    });
}
catch(err)
{
    console.log(err.stack);
    responseData={
        "statusCode":404,
        "result":err.stack,
        };
        const jsonContent = JSON.stringify(responseData);
        res.end(jsonContent);
}
})
app.post('/userlogin',async(req,res)=>
{
    try
    {
        let data=req.body;
        let userName=data.userOrEmail;
        let emailId=data.userOrEmail;
        let userEnteredPassword=data.password;
        // var connection=dbConnection.connection;
        var con=await Connection();
        var connect=con.connection;
        // let query="select password from user_details where `user_name`='"+userName+"'||`email_id`='"+emailId+"'";
        let query="select password,user_name,id,role_id from users where `user_name`=?||`email_id`=?";
        
        connect.query(query,[userName,emailId],async(err,queryResult)=>
        {
         let responseData="";
         if(err)
            {
            responseData={
            "statusCode" :500,
            "error": err.stack,
            "message":"error while executing the query"
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
             }
            else
            {
                let passwordinDB =queryResult[0].password;
                let userName=queryResult[0].user_name;
                let userId=queryResult[0].id;
                let roleId=queryResult[0].role_id;
                console.log("the role id "+ roleId);
                let queryForRole="select name from roles where `id`='"+roleId+"'";
                let roleName=connect.query(queryForRole,async(err,queryResultforRole)=>
                {
                    return await queryResultforRole[0].name;
                });
                // const accessToken = jwt.sign({ "userId": userId,  "role": roleName }, accessTokenSecret);
                // console.log("the access token is "+accessToken );
                console.log("the ")
                console.log(userEnteredPassword);
                console.log(passwordinDB);
                let result="";
                const isValidPass =await passwordHashFile.comparePassword(userEnteredPassword,passwordinDB);
                if(!isValidPass)
                {
                    result="In valid password enter valid user name and password";
                    responseData={
                        "statusCode":200,
                         "result":result,
                       };
                       let jsonContent = JSON.stringify(responseData);
                       res.end(jsonContent);
                }
                else{

                    console.log("valid");
                    result="login successfully";
                    var accessToken = jwt.sign({userid:userId,roleid:roleId}, accessTokenSecret,{expiresIn: expiresIn,algorithm: algorithm});
                      let data={"userName":userName,"userId":userId,"roleId":roleId};
                    let responseData={
                        "statusCode":200,
                        "message":"Login successful",
                        "accessToken":accessToken,
                        "data":data
                       };
                    //    var accessToken = jwt.sign({userid:userId,roleid:roleId}, accessTokenSecret,{expiresIn: '24h',algorithm: algorithm});
                    //     // console.log("************"+accessToken);
                    const jsonContent = JSON.stringify(responseData);                  
                    // res.json({responseData,data});
                    res.end(jsonContent);
                }
                
            }
            // const jsonContent = JSON.stringify(responseData);
            
            // res.end(jsonContent);
                
        })
        
          
    }    
    catch(err)
    {
            console.log(err.stack);
            responseData={
          "statusCode":404,
           "message":err.stack,
         };
            const jsonContent = JSON.stringify(responseData);
             res.end(jsonContent);
    }

})
app.post('/checkorvalidateJwt',async(req,res)=>{
    let data=req.body;
    let token=data.accessToken;
    var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
    console.log(decoded);
    console.log("user id :"+decoded.userid);
    console.log("role id :" +decoded.roleid);
    responseData={
        "user_id":decoded.userid,
         "role_id":decoded.roleid
       };
          const jsonContent = JSON.stringify(responseData);
           res.end(jsonContent);
})
app.post('/project',async(req,res)=>
{
    try
    {
        var con=await Connection();
        var connect=con.connection;
        var authorizationKey = req.headers['authorization'];
        var token=authorizationKey.split(" ")[1];
        console.log(token);
    // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm},async(err, decoded)=>
    // {
    //     if(err)
    //     {
    //         responseData=
    //         {
    //             "statusCode" :500,
    //             "message":"invalid accesstoken"
    //         }
    //         let jsonContent = JSON.stringify(responseData);
    //         res.end(jsonContent);
    //     }

    //     else{
    //         return await decoded;
    //     }
    // })
    var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
    var userid=decoded.userid;
    var roleId=decoded.roleid;
    console.log("the userid in access token "+userid);
    let data=req.body;
    let project_name=data.project_name;
    let project_version=data.project_version;
    const now= new Date();
    const currentDateAndTime = date.format(now,'DD-MM-YYYY:HH-MM-ss');
    let query="insert into projects(project_name,project_version,created_by,created_on,updated_on)values(?,?,?,?,?)"; 
    connect.query(query,[project_name,project_version,userid,currentDateAndTime,currentDateAndTime],async(err,result)=>
    {
        console.log(query);
        if(err)
        {
            responseData=
            {
                "statusCode" :500,
                "error": err.stack,
                "message":"error while executing the query"
            }
            let jsonContent = JSON.stringify(responseData);
            res.end(jsonContent);
        }
        else
        {
            
             let responseData=
                {
                "statusCode":200,
                "message":"Project inserted successfully"
                };
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
        }

    })
}
catch(err)
{
    let message="";
    if(err.name=="TokenExpiredError")
    {
       message="Token expired please login again";
    }
    else if(err.name=="JsonWebTokenError")
    {
        message=err.message;//please contact admin
    }
    console.log(err);
    console.log(err.message);
    console.log(err.name);
    responseData=
        {
            "statusCode":401,
             "message":message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);
        

}
})
app.put('/project',async(req,res)=>
{
    try 
    {
        var authorizationKey = req.headers['authorization'];
        var token=authorizationKey.split(" ")[1];
        console.log(token);
        const now= new Date();
        const currentDateAndTime = date.format(now,'DD-MM-YYYY HH:MM:ss');
        var con=await Connection();
        var connect=con.connection;
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm},async(err, decoded)=>
        // {
        //     if(err)
        //     {
        //         responseData=
        //         {
        //             "statusCode" :500,
        //             "message":"Invalid accesstoken"
        //         }
        //         let jsonContent = JSON.stringify(responseData);
        //         res.end(jsonContent);
        //     }
    
        //     else{
        //         return await decoded;
        //     }
        // })
        var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
    var userid=decoded.userid;
    var roleId=decoded.roleid;
    console.log("the userid in access token "+userid);
    let data=req.body;
    let firstproject_name=data.project_name;
    let project_version=data.project_version;
    let profilePic="";
    let query="update projects set project_name=?,project_version=?,updated_on=? where created_by=?"; 
    connect.query(query,[firstproject_name,project_version,currentDateAndTime,userid],async(err,result)=>
    {
        if(err)
        {
            responseData=
            {
                "statusCode" :500,
                "error": err.stack,
                "message":"error while executing the query"
            }
            let jsonContent = JSON.stringify(responseData);
            res.end(jsonContent);

        }
        else{

            responseData=
            {
            "statusCode":200,
            "message":"Project details updated successfully"
            };
            const jsonContent = JSON.stringify(responseData);
                        res.end(jsonContent);
        }

    })
    } 
    catch (err) 
    {
        let message="";
    if(err.name=="TokenExpiredError")
    {
       message="Token expired please login again";
    }
    else if(err.name=="JsonWebTokenError")
    {
        message=err.message;//please contact admin
    }
    console.log(err);
    console.log(err.message);
    console.log(err.name);
    responseData=
        {
            "statusCode":401,
             "message":message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);
        

    }
})
app.delete('/project',async(req,res)=>
{
    try{
        var authorizationKey = req.headers['authorization'];
        var token=authorizationKey.split(" ")[1];
        console.log(token);
        var con=await Connection();
        var connect=con.connection;
        //  var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm},async(err, decoded)=>
        // {
        //     if(err)
        //     {
        //         responseData=
        //         {
        //             "statusCode" :500,
        //             "message":"Invalid accesstoken"
        //         }
        //         let jsonContent = JSON.stringify(responseData);
        //         res.end(jsonContent);
        //     }
    
        //     else{
        //         return await decoded;
        //     }
        // })
        var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        // var userId=req.query.UserId;
        var userId=decoded.userid;
        var roleId=decoded.roleid;
        console.log("the userid in access token "+userId);
        let query="delete from projects where created_by= ?";
        connect.query(query,[userId],async(err,queryResults)=>
        {
            if(err)
            {
                responseData=
            {
                "statusCode" :500,
                "error": err.stack,
                "message":"Error while executing the query"
            }
            let jsonContent = JSON.stringify(responseData);
            res.end(jsonContent);
            }
            else{
                responseData=
                {
                    "statusCode":404,
                     "message":"Project deleted successfully",
                };
                const jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
            }
        })
    }
    catch(err){
        let message="";
        if(err.name=="TokenExpiredError")
        {
           message="Token expired please login again";
        }
        else if(err.name=="JsonWebTokenError")
        {
            message=err.message;//please contact admin
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData=
            {
                "statusCode":401,
                 "message":message,
            };
            const jsonContent = JSON.stringify(responseData);
            res.status(401).end(jsonContent);
            
    }

    
    

})
app.get('/project',async(req,res)=>
{
    try{
        var authorizationKey = req.headers['authorization'];
        var token=authorizationKey.split(" ")[1];
        console.log(token);
        console.log(req.headers);
        console.log("the ******************"+token);
        var con=await Connection();
        var connect=con.connection;
        var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        console.log(decoded);
        console.log(decoded.roleid+decoded.userid);
        var roleId=decoded.roleid;
        var userid=decoded.userid;
        console.log("the userid in access token "+userid);
        let queryForAll="SELECT projects.*,users.user_name as createdUserName FROM projects inner join users";
        let queryForparticularUsrer="select id,project_name,project_version from projects where created_by =?";
        if(roleId==1)
        {
            connect.query(queryForAll,(err,result)=>
            {
               if(err)
               {
                responseData=
                {
                    "statusCode" :500,
                    "error": err.stack,
                    "message":"Error while executing the query"
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent)

               }
               else{
                    let responseData="";
                    if(result.length==0)
                    {
                        responseData=
                        {
                            "statusCode" :200,
                            "message":"No projects found"                    
                        }
                    }
                    else
                    {
                        responseData=
                         {
                             "statusCode" :200,
                             "message":"Listing of projects succesfully",
                            "data":result
                         }
                    }
                    let jsonContent = JSON.stringify(responseData);
                    res.end(jsonContent);
               }

            }
        )
        }
        else
        {
           connect.query(queryForparticularUsrer,[userid],function(err,result) 
           {
            if(err)
            {
             responseData=
             {
                 "statusCode" :500,
                 "error": err.stack,
                 "message":"error while executing the query"
             }
             let jsonContent = JSON.stringify(responseData);
             res.end(jsonContent)

            }
            else{
                 let responseData="";
                 if(result.length==0)
                 {
                     responseData=
                     {
                         "statusCode" :200,
                         "message":"No projects found"                    
                     }
                 }
                 else
                 {
                     responseData=
                      {
                          "statusCode" :200,
                          "message":"Listing of projects succesfully",
                         "data":result
                      }
                 }
                 let jsonContent = JSON.stringify(responseData);
                 res.end(jsonContent);
            }
           })
        }
    }
catch(err)
{
    let message="";
    if(err.name=="TokenExpiredError")
    {
       message="Token expired please login again";
    }
    else if(err.name=="JsonWebTokenError")
    {
        message=err.message;//please contact admin
    }
    console.log(err);
    console.log(err.message);
    console.log(err.name);
    responseData=
        {
            "statusCode":401,
             "message":message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);
        
}
})
app.post('/user_details_service',async(req,res)=>
{
    try
    {
        var con=await Connection();
        var connect=con.connection;
        var authorizationKey = req.headers['authorization'];
        var token=authorizationKey.split(" ")[1];
        console.log(token);
        var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        var userid=decoded.userid;
        var roleId=decoded.roleid;
        console.log("the userid in access token "+userid);
        let data=req.body;
        let firstName=data.firstName;
        let lastName=data.lastName;
        let profile_pic="";
        const now= new Date();
        const currentDateAndTime = date.format(now,'DD-MM-YYYY:HH-MM-ss');
        let query="insert into user_details(user_id,first_name,last_name,profile_pic,created_on,updated_on)values(?,?,?,?,?,?)"; 
        connect.query(query,[userid,firstName,lastName,profile_pic,currentDateAndTime,currentDateAndTime],async(err,result)=>
        {
         console.log(query);
            if(err)
            {
              responseData=
              {
                "statusCode" :500,
                "error": err.stack,
                "message":"error while executing the query"
               }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
            }
            else
            {
            
             let responseData=
                {
                "statusCode":200,
                "message":"User details inserted successfully"
                };
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
        }

    })
}
catch(err)
{
    let message="";
    if(err.name=="TokenExpiredError")
    {
       message="Token expired please login again";
    }
    else if(err.name=="JsonWebTokenError")
    {
        message=err.message;//please contact admin
    }
    console.log(err);
    console.log(err.message);
    console.log(err.name);
    responseData=
        {
            "statusCode":401,
             "message":message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);
        
}
})
app.put('/user_details_service',async(req,res)=>
{
    try 
    {
        var authorizationKey = req.headers['authorization'];
        var token=authorizationKey.split(" ")[1];
        console.log(token);
        const now= new Date();
        const currentDateAndTime = date.format(now,'DD-MM-YYYY HH:MM:ss');
        var con=await Connection();
        var connect=con.connection;
        var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
    var userid=decoded.userid;
    var roleId=decoded.roleid;
    console.log("the userid in access token "+userid);
    let data=req.body;
    let firstName=data.firstName;
    let lastName=data.lastName;
    let profilePic="";
    let query="update user_details set first_name=?,last_name=?,profile_pic=?,updated_on=? where created_by=?"; 
    connect.query(query,[firstName,lastName,profilePic,currentDateAndTime,userid],async(err,result)=>
    {
        if(err)
        {
            responseData=
            {
                "statusCode" :500,
                "error": err.stack,
                "message":"error while executing the query"
            }
            let jsonContent = JSON.stringify(responseData);
            res.end(jsonContent);

        }
        else{

            responseData=
            {
            "statusCode":200,
            "message":"User details updated successfully"
            };
            const jsonContent = JSON.stringify(responseData);
                        res.end(jsonContent);
        }

    })
    } 
    catch (err) 
    {
        let message="";
    if(err.name=="TokenExpiredError")
    {
       message="Token expired please login again";
    }
    else if(err.name=="JsonWebTokenError")
    {
        message=err.message;//please contact admin
    }
    console.log(err);
    console.log(err.message);
    console.log(err.name);
    responseData=
        {
            "statusCode":401,
             "message":message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);
        

    }
})
app.delete('/user_details_service',async(req,res)=>
{
    try{
        var authorizationKey = req.headers['authorization'];
        var token=authorizationKey.split(" ")[1];
        console.log(token);
        var con=await Connection();
        var connect=con.connection;
        var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        // var userId=req.query.UserId;
        var userId=decoded.userid;
        var roleId=decoded.roleid;
        console.log("the userid in access token "+userId);
        let query="delete from user_details where created_by= ?";
        connect.query(query,[userId],async(err,queryResults)=>
        {
            if(err)
            {
                responseData=
            {
                "statusCode" :500,
                "error": err.stack,
                "message":"Error while executing the query"
            }
            let jsonContent = JSON.stringify(responseData);
            res.end(jsonContent);
            }
            else{
                responseData=
                {
                    "statusCode":404,
                     "message":"User details deleted successfully",
                };
                const jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
            }
        })
    }
    catch(err){
        let message="";
        if(err.name=="TokenExpiredError")
        {
           message="Token expired please login again";
        }
        else if(err.name=="JsonWebTokenError")
        {
            message=err.message;//please contact admin
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData=
            {
                "statusCode":401,
                 "message":message,
            };
            const jsonContent = JSON.stringify(responseData);
            res.status(401).end(jsonContent);
            
    }

})

app.get('/user_details_service',async(req,res)=>
{
    try{
        var authorizationKey = req.headers['authorization'];
        var token=authorizationKey.split(" ")[1];
        console.log(token);
        console.log(req.headers);
        console.log("the ******************"+token);
        var con=await Connection();
        var connect=con.connection;
    // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm},async(err, decoded)=>
    //     {
    //         if(err)
    //         {
    //             responseData=
    //             {
    //                 "statusCode" :500,
    //                 "message":"Invalid accesstoken"
    //             }
    //             let jsonContent = JSON.stringify(responseData);
    //             res.end(jsonContent);
    //         }    
    //         else{
    //             return await decoded;
    //         }
    //     })
    var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        console.log(decoded);
        console.log(decoded.roleid+decoded.userid);
        var roleId=decoded.roleid;
        var userid=decoded.userid;
        console.log("the userid in access token "+userid);
        let queryForAll="select * from user_details where user_id=?";
         connect.query(queryForAll,[userid],(err,result)=>
            {
               if(err)
               {
                responseData=
                {
                    "statusCode" :500,
                    "error": err.stack,
                    "message":"Error while executing the query"
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent)

               }
               else{
                    let responseData="";
                    if(result.length==0)
                    {
                        responseData=
                        {
                            "statusCode" :200,
                            "message":"No user details found"                    
                        }
                    }
                    else
                    {
                        responseData=
                         {
                             "statusCode" :200,
                             "message":"Listing of user details succesfully",
                            "data":result
                         }
                    }
                    let jsonContent = JSON.stringify(responseData);
                    res.end(jsonContent);
               }

            }
        )
        
    }
catch(err)
{
    let message="";
    if(err.name=="TokenExpiredError")
    {
       message="Token expired please login again";
    }
    else if(err.name=="JsonWebTokenError")
    {
        message=err.message;//please contact admin
    }
    console.log(err);
    console.log(err.message);
    console.log(err.name);
    responseData=
        {
            "statusCode":401,
             "message":message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);
        
}
})
app.post('/uploadProfilepic',async(req,res)=>
{
    let form = new formidable.IncomingForm();
    var dir = './profilepicUploads';
    if (!fs.existsSync(dir)){
       fs.mkdirSync(dir);
     }  
    //  var fileServer = new nStatic.Server('./public');
    form.parse(req, async function (err, fields, files) {
        console.log(files.filetoupload.filepath);
        var oldpath =await files.filetoupload.filepath;
        console.log(files.filetoupload.filepath);
        var newpath = dir;
        fs.readFile(files.filetoupload.filepath, function (err, data) {
            if (err) throw err;
            console.log('File read!');
        fs.writeFile( newpath+"/user.png",data, function(err){
        if (err) throw err;
        var ee=newpath+"/user.png"
        var fileServer = new nStatic.Server('ee');
        
        // res.write('File uploaded and moved!');
        res.send(fileServer);
        res.end();
      });
    })
    })
})
const port = 8877;
app.listen(port, () => {
    console.log("===================================");
  console.log(`Server running on port${port}`);
});
