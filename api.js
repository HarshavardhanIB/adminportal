require('dotenv').config();
const express = require('express');
var formidable = require('formidable');
var multer = require('multer');
var nodemailer = require('nodemailer');
var Static = require('node-static');
var validator = require('mini-validator');
var fs = require('fs');
const path = require('path');
var nstatic = require('node-static');
var emailValidator = require('email-validator');
const app = express();
app.use(express.json());
// const accessTokenSecret = 'ideabytes';
app.use('/images', express.static(__dirname + '/profilepic'));
var passwordHashFile = require('./passwordHashing');
const { Connection } = require('./DBConnection');
const { url } = require('inspector');
const PortId = process.env.BASE_URL;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const apiModules = require('./apiModules');
const allQuerys = require('./allQuerys');
const messages = require('./messages');
const userMailCheck = require('./userNameAndMail');
const constants = require('./constants');
const email = require('./email');
const date = require('date-and-time');
const excel = require('./CreateExce');
const { table } = require('console');
var cron = require('node-cron');
// const expiresIn="10m";
// const algorithm="HS512";
app.use(bodyParser.urlencoded({ extended: true }));
var accessTokenSecret = process.env.SECRETTOKEN;
var userid;
var roleId;
var con;
var connect;
app.use(async function (req, res, next) {
    // console.log("request");
    console.log(req);
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
    console.log(req.path);
    if (req.path == '/') {
        res.set('Content-Type', 'text/html');
        res.send(Buffer.from('<h2>Please contact admin </h2>'));
    }
    else if (req.path == '/api/auth/login' || req.path == '/api/auth/registration') {
        console.log("if block enter");
        con = await Connection();
        connect = con.connection;
        next();
    }
    else {

        try {
            console.log("use try block enter");
            var authorizationKey = req.headers['authorization'];
            if (authorizationKey.length == 0) {
                let responseData =
                {
                    "statusCode": 500,
                    // "message": "Invalid roleId and path"
                    "message": message.tokenUnauthorized
                };
                const jsonContent = JSON.stringify(responseData);
                res.status(500).end(jsonContent);
                return res;
            }
            var token = authorizationKey.split(" ")[1];
            var decoded = jwt.verify(token, accessTokenSecret, { algorithm: constants.algorithm });
            userid = decoded.userid;
            roleId = decoded.roleid;
            reqPath = req.path;
            adminOrUser = reqPath.split("/")[2];
            console.log("**********************");
            console.log(adminOrUser);
            if (adminOrUser == "admin" && roleId == 1) {
                con = await Connection();
                connect = con.connection;
                next();
            }
            else if (adminOrUser == "user" && roleId == 2) {
                con = await Connection();
                connect = con.connection;
                next();
            }
            else {
                let responseData =
                {
                    "statusCode": 401,
                    // "message": "Invalid roleId and path"
                    "message": messages.invalidRolePath
                };
                const jsonContent = JSON.stringify(responseData);
                res.status(401).end(jsonContent);
                return res;
            }

        }
        catch (err) {
            let message = "";
            if (err.name == "TokenExpiredError") {
                //    message="Token expired please login again";
                message = messages.TokenExpiredError;
            }
            else if (err.name == "JsonWebTokenError") {
                message = err.message;//please contact admin
            }
            else {
                message = err.message;
            }
            console.log(err);
            console.log(err.message);
            console.log(err.name);
            responseData =
            {
                "statusCode": 401,
                "message": message,
            };
            const jsonContent = JSON.stringify(responseData);
            res.status(401).end(jsonContent);
            return res;
        }
    }
    // reqPath=req.path;
    // adminOrUser=reqPath.split("/")[1];
    // var authorizationKey = req.headers['authorization'];
    // var token=authorizationKey.split(" ")[1];
    // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
    // userid=decoded.userid;
    // roleId=decoded.roleid;
    // if(adminOrUser==admin&&roleId==1)
    // {
    //     next();
    // }
    // else if(adminOrUser==user&&roleId==2)
    // {
    //     next();
    // }
    // else
    // {

    // }



    // con=await Connection();
    // connect=con.connection;
})
app.post(apiModules.registration, async (req, res) => {
    // Pass to next layer of middlewarenext();
    console.log("register");
    try {
        // const saltRounds = 10;
        let data = req.body;
        console.log(req.params);
        console.log(req.body);
        let userName = data.userName;
        let emailId = data.emailid;
        let password = data.password;
        let roleid = data.roleId;
        // var connection=dbConnection.connection;
        var con = await Connection();
        console.log(con);
        console.log(con.db);
        let emailIdcheckStatus = validator.isEmail(emailId);
        if (emailIdcheckStatus == false) {
            let responseData =
            {
                "statusCode": 202,
                // "message":"Enter valid email id"
                "message": messages.validEmial
            }
            let jsonContent = JSON.stringify(responseData);
            res.end(jsonContent);
            return res;
        }
        let userNameValidation = validator.isAlphaNumber(userName);
        console.log(userNameValidation);
        let userNamelength = validator.isMaxLength(userName, 2, min_length = 20);
        console.log(userNamelength);
        console.log(userName.length);
        if (userNameValidation == false) {
            let responseData =
            {
                "statusCode": 202,
                // "message":"User Name accepts only alphanumaric"
                "message": messages.UNalphaNumaric
            }
            let jsonContent = JSON.stringify(responseData);
            res.end(jsonContent);
            return res;
        }
        if (userName.length <= 2 || userName.length > 20) {
            let responseData =
            {
                "statusCode": 202,
                // "message":"Enter user name range in between 3 to 20 chnaracter only"
                "message": messages.UNRange
            }
            let jsonContent = JSON.stringify(responseData);
            res.end(jsonContent);
            return res;
        }
        let Usernamestatus = await userMailCheck.checkUsrname(userName, con.db, con.connection);
        console.log("the username status ");
        console.log(Usernamestatus);
        if (Usernamestatus == true) {
            let responseData =
            {
                "statusCode": 202,
                // "message":"User name already exists please user another username"
                "message": messages.UNexists
            }
            let jsonContent = JSON.stringify(responseData);
            res.end(jsonContent);
            return res;
        }
        let checkEmailStatus = await userMailCheck.emialIdcheck(emailId, con.db, con.connection);
        console.log("check mail status" + checkEmailStatus);
        if (checkEmailStatus == true) {
            let responseData =
            {
                "statusCode": 202,
                // "message":"Email id already exists please user another emailid"
                "message": messages.EIexists
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
        let checkRole = await userMailCheck.checkRole(roleid, con.db, con.connection);
        console.log("check mail status" + checkRole);
        if (checkRole == true) {
            let responseData =
            {
                "statusCode": 202,
                // "message":"In valid role id "
                "message": messages.invalidRole
            }
            let jsonContent = JSON.stringify(responseData);
            res.end(jsonContent);
            return res;
        }
        let active = "0";
        let now = new Date();
        let currentDateAndTime = date.format(now, 'DD-MM-YYYY HH:MM:SS');
        console.log("tttttt" + currentDateAndTime);
        // var passwordHash = bcrypt.hashSync(password, 10);
        const passwordHash = passwordHashFile.pass(password);
        console.log("*********" + passwordHash);

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
        // let query="insert into users(role_id,user_name,email_id,password,active,created_date_and_time,update_date_and_time)values(?,?,?,?,?,?,?)";
        let query = allQuerys.insertUsers;
        // "+" ('"+roleid+"','"+userName+"','"+emailId+"','"+passwordHash+"','"+active+"','"+currentDateAndTime+"','"+currentDateAndTime+"')";
        console.log("%%%%%%%" + query);
        // var connect=con.connection;
        let key = ' ';
        const charactersLength = constants.characters.length;
        for (let i = 0; i < 19; i++) {
            key += constants.characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        console.log(key);
        connect.query(query, [roleid, userName, emailId, passwordHash, active, currentDateAndTime, currentDateAndTime, key], function (err) {
            let responseData = "";
            if (err) {
                console.error(err);
                responseData =
                {
                    "statusCode": 500,
                    "error": err.stack,
                    // "result":"error while inserting the data " 
                    "message": messages.errorOnInsertData
                }
                let jsonContent = JSON.stringify(responseData);
                return res.end(jsonContent);
                // return res; 
            }
            else {
                htmlContent = `<div>
                <h1>Email Confirmation</h1>
                <h2>Hello ${userName}</h2>
                <p>Thank you for register in ADMIN PORTAL. Please confirm your email by clicking on the following link</p>
                <a href=http://localhost:8977/api/${key}> Click here</a>
                </div>`;
                email.send365Email(process.env.EMAIL_ID, emailId, constants.registrationSubject,htmlContent, constants.registrationText);
                let responseData = {
                    "statusCode": 200,
                    // "message":"User regisetred successfully"
                    "message": messages.UserRegisterSuccess
                };

                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
                return res;
            }
        })
    }
    catch (err) {
        console.log(err.stack);
        responseData = {
            "statusCode": 404,
            "result": err.stack,
        };
        const jsonContent = JSON.stringify(responseData);
        res.end(jsonContent);
        return res;
    }

})
app.get('/userNameAndMailIdsinDB', (req, res) => {
    try {
        var connection = dbConnection.connection;
        let query = "select user_name,email_id from user_details";
        connection.query(query, function (err, result) {
            let responseData = "";
            if (err) {
                responseData = {
                    "statusCode": 500,
                    "error": err.stack,
                    // "message":"Error while getting the data from the data base"
                    "message": messages.errorwhilegetingData
                }
            }
            else {
                responseData = {
                    "statusCode": 200,
                    "result": result
                }
            }
            const jsonContent = JSON.stringify(responseData);
            res.end(jsonContent);
        });
    }
    catch (err) {
        console.log(err.stack);
        responseData = {
            "statusCode": 404,
            "result": err.stack,
        };
        const jsonContent = JSON.stringify(responseData);
        res.end(jsonContent);
    }
})
app.post(apiModules.login, async (req, res) => {
    try {
        let data = req.body;
        let userName = data.userName;
        let emailId = data.userName;
        let userEnteredPassword = data.password;
        // var connection=dbConnection.connection;
        // let emailIdcheckStatus=emailValidator.validate(emailId);
        // if(emailIdcheckStatus==false)
        // {
        //     let responseData=
        //           {
        //               "statusCode" :202,
        //              "message":"Enter valid email id"
        //          }                 
        //             let jsonContent = JSON.stringify(responseData);
        //             res.end(jsonContent);
        //             return res;
        // }
        var con = await Connection();
        var connect = con.connection;
        // let query="select password from user_details where `user_name`='"+userName+"'||`email_id`='"+emailId+"'";
        // let query="select password,user_name,id,role_id from users where `user_name`=?||`email_id`=?";
        let query = allQuerys.getLoginDetails;
        connect.query(query, [userName, emailId], async (err, queryResult) => {
            let responseData = "";
            if (err) {
                responseData = {
                    "statusCode": 500,
                    "error": err.stack,
                    // "message":"error while executing the query"
                    "message": messages.errorOnInsertData
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
            }
            else {
                let passwordinDB = queryResult[0].password;
                let userName = queryResult[0].user_name;
                let userId = queryResult[0].id;
                let roleId = queryResult[0].role_id;
                console.log("the role id " + roleId);
                let queryForRole = "select name from roles where `id`='" + roleId + "'";
                let queryforUserdetails = "select first_name,last_name,profile_pic from user_details where user_id=?"
                let roleName = connect.query(queryForRole, async (err, queryResultforRole) => {
                    return await queryResultforRole[0].name;
                });
                // let details=connect.query(queryforUserdetails,[userId])
                // console.log(details);
                // if(details==undefined||details._resultSet==null||details==[])
                // {
                //     let firstName="";
                //     let lastName="";
                //     let profilePic="";
                // }
                // else
                // {
                // let firstName=details[0].first_name;
                // let lastName=details[0].last_name;
                // let profilePic=details[0].profile_pic;
                // }
                // if(firstName==undefined)
                // {
                //     let firstName="";
                //     let lastName="";
                //     let profilePic="";
                // }
                // const accessToken = jwt.sign({ "userId": userId,  "role": roleName }, accessTokenSecret);
                // console.log("the access token is "+accessToken );
                console.log("the ")
                console.log(userEnteredPassword);
                console.log(passwordinDB);
                let result = "";
                const isValidPass = await passwordHashFile.comparePassword(userEnteredPassword, passwordinDB);
                if (!isValidPass) {
                    // result="Invalid password enter valid user name and password";
                    responseData = {
                        "statusCode": 201,
                        //  "result":result,
                        "message": messages.invalidUSandPsw
                    };
                    let jsonContent = JSON.stringify(responseData);
                    res.end(jsonContent);
                }
                else {
                    let query2 = "select active from users where id=?";
                    const result = await con.db.query(con.connection, query2, [userId]);
                    let activeStatus = result[0].active;
                    if (activeStatus == 0) {
                        let responseData =
                        {
                            "statusCode": 201,
                            "message": messages.checkMail
                        };
                        let jsonContent = JSON.stringify(responseData);
                        res.end(jsonContent);
                        return res;
                    }
                    let firstName = "";
                    let lastName = "";
                    let profilePic = "";
                    console.log("valid");
                    result = "login successfully";
                    let details = await userMailCheck.getNameAndprofile(userId, con.db, con.connection);
                    // let details=connect.query(queryforUserdetails,[userId]);
                    console.log("the details" + details);
                    firstName = details.first_name;
                    lastName = details.last_name;
                    profilePic = details.profile_pic;
                    var accessToken = jwt.sign({ userid: userId, roleid: roleId }, accessTokenSecret, { expiresIn: constants.expiresIn, algorithm: constants.algorithm });
                    if (roleId == 1) {
                        let adminrole = 1;
                        let userrole = 2;
                        // var connect=con.connection;
                        // let query="select count(*) as count from users where role_id=?";
                        let query = allQuerys.usersCount;
                        // let adminCountresult=connect.query(query,[adminrole]);
                        // let userCountresult=connect.query(query,[userrole]);
                        connect.query(query, [adminrole], async function (err, result) {
                            let adminCount = await result[0].count;
                            console.log(await result[0])
                            connect.query(query, [userrole], async function (err, userCountresult) {
                                let userCount = userCountresult[0].count;
                                console.log(await result[0]);
                                let totalCount = adminCount + userCount;
                                let count = { "users": userCount, "admins": adminCount, "total": totalCount };
                                let data = { "userName": userName, "userId": userId, "roleId": roleId, "accessToken": accessToken, "firstName": firstName, "lastName": lastName, "profilePic": profilePic, "count": count };

                                let responseData =
                                {
                                    "statusCode": 200,
                                    // "message":"Login successfully",
                                    "message": messages.loginSuccess,
                                    // "accessToken":accessToken,
                                    "data": data
                                };
                                //    var accessToken = jwt.sign({userid:userId,roleid:roleId}, accessTokenSecret,{expiresIn: '24h',algorithm: algorithm});
                                //     // console.log("************"+accessToken);
                                const jsonContent = JSON.stringify(responseData);
                                // res.json({responseData,data});
                                res.end(jsonContent);

                            })

                        })
                    }
                    else {
                        let data = { "userName": userName, "userId": userId, "roleId": roleId, "accessToken": accessToken, "firstName": firstName, "lastName": lastName, "profilePic": profilePic };
                        let responseData =
                        {
                            "statusCode": 200,
                            // "message":"Login successful",
                            "message": messages.loginSuccess,
                            // "accessToken":accessToken,
                            "data": data
                        };
                        //    var accessToken = jwt.sign({userid:userId,roleid:roleId}, accessTokenSecret,{expiresIn: '24h',algorithm: algorithm});
                        //     // console.log("************"+accessToken);
                        const jsonContent = JSON.stringify(responseData);
                        // res.json({responseData,data});
                        res.end(jsonContent);
                    }
                }

            }
            // const jsonContent = JSON.stringify(responseData);

            // res.end(jsonContent);

        })


    }
    catch (err) {
        console.log(err.stack);
        responseData = {
            "statusCode": 404,
            "message": err.stack,
        };
        const jsonContent = JSON.stringify(responseData);
        res.end(jsonContent);
    }

})
app.post(apiModules.checkJwt, async (req, res) => {
    let data = req.body;
    let token = data.accessToken;
    var decoded = jwt.verify(token, accessTokenSecret, { algorithm: algorithm });
    console.log(decoded);
    console.log("user id :" + decoded.userid);
    console.log("role id :" + decoded.roleid);
    responseData = {
        "user_id": decoded.userid,
        "role_id": decoded.roleid
    };
    const jsonContent = JSON.stringify(responseData);
    res.end(jsonContent);
})
app.post(apiModules.adminProject, async (req, res) => {
    try {
        var con = await Connection();
        var connect = con.connection;
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // console.log(token);
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
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        // var userid=decoded.userid;
        // var roleId=decoded.roleid;
        console.log("the userid in access token " + userid);
        let data = req.body;
        let project_name = data.project_name;
        let project_version = data.project_version;
        let now = new Date();
        let currentDateAndTime = date.format(now, 'DD-MM-YYYY HH:MM:SS');
        // let query="insert into projects(project_name,project_version,created_by,created_on,updated_on)values(?,?,?,?,?)"; 
        let query = allQuerys.insertProject;
        connect.query(query, [project_name, project_version, userid, currentDateAndTime, currentDateAndTime], async (err, result) => {
            console.log(query);
            if (err) {
                responseData =
                {
                    "statusCode": 500,
                    "error": err.stack,
                    // "message":"error while executing the query"
                    "message": messages.QueryError
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
            }
            else {

                let responseData =
                {
                    "statusCode": 200,
                    // "message":"Project inserted successfully"
                    "message": messages.insertProjects
                };
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
            }

        })
    }
    catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            //    message="Token expired please login again";
            message = messages.TokenExpiredError;
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);


    }
})
app.put(apiModules.adminProject, async (req, res) => {
    try {
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // console.log(token);
        let now = new Date();
        let currentDateAndTime = date.format(now, 'DD-MM-YYYY HH:MM:SS');
        var con = await Connection();
        var connect = con.connection;
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
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        // var userid=decoded.userid;
        // var roleId=decoded.roleid;
        console.log("the userid in access token " + userid);
        let data = req.body;
        let firstproject_name = data.project_name;
        let project_version = data.project_version;
        var id = req.query.id;
        let profilePic = "";
        // let query="update projects set project_name=?,project_version=?,updated_on=? where id=?"; 
        let query = allQuerys.updtaeProject;
        connect.query(query, [firstproject_name, project_version, currentDateAndTime, id], async (err, result) => {
            if (err) {
                responseData =
                {
                    "statusCode": 500,
                    "error": err.stack,
                    // "message":"error while executing the query"
                    "message": messages.QueryError
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);

            }
            else {

                responseData =
                {
                    "statusCode": 200,
                    // "message":"Project details updated successfully"
                    "message": messages.deleteProject
                };
                const jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
            }

        })
    }
    catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            message = "Token expired please login again";
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);


    }
})
app.delete(apiModules.adminProject, async (req, res) => {
    try {
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // console.log(token);
        var con = await Connection();
        var connect = con.connection;
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
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        // // var userId=req.query.UserId;
        // var userId=decoded.userid;
        // var roleId=decoded.roleid;
        let id = req.query.id;
        // console.log("the userid in access token "+userId);
        // let query="delete from projects where id= ?";
        let query = allQuerys.deleteProject;
        connect.query(query, [id], async (err, queryResults) => {
            if (err) {
                responseData =
                {
                    "statusCode": 500,
                    "error": err.stack,
                    // "message":"Error while executing the query"
                    "message": messages.QueryError
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
            }
            else {
                responseData =
                {
                    "statusCode": 200,
                    //  "message":"Project deleted successfully"

                };
                const jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
            }
        })
    }
    catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            message = "Token expired please login again";
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);

    }




})
app.get(apiModules.adminProject, async (req, res) => {
    try {
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // console.log(token);
        console.log(req.headers);
        // console.log("the ******************"+token);
        var con = await Connection();
        var connect = con.connection;
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        // console.log(decoded);
        // console.log(decoded.roleid+decoded.userid);
        // var roleId=decoded.roleid;
        // var userid=decoded.userid;
        console.log("the userid in access token " + userid);
        // let queryForAll="SELECT projects.*,users.user_name as createdUserName FROM projects inner join users";
        let queryForAll = allQuerys.getProjectsForAllDetails;
        // let queryForparticularUsrer="select id,project_name,project_version from projects where created_by =?";
        let queryForparticularUsrer = allQuerys.getProjectsForparticularUsrer;
        if (roleId == 1) {
            connect.query(queryForAll, (err, result) => {
                if (err) {
                    responseData =
                    {
                        "statusCode": 500,
                        "error": err.stack,
                        "message": "Error while executing the query"
                    }
                    let jsonContent = JSON.stringify(responseData);
                    res.end(jsonContent)

                }
                else {
                    let responseData = "";
                    if (result.length == 0) {
                        responseData =
                        {
                            "statusCode": 200,
                            "message": "No projects found"
                        }
                    }
                    else {
                        responseData =
                        {
                            "statusCode": 200,
                            "message": "Listing of projects successfully",
                            "data": result
                        }
                    }
                    let jsonContent = JSON.stringify(responseData);
                    res.end(jsonContent);
                }

            }
            )
        }
        else {
            connect.query(queryForparticularUsrer, [userid], function (err, result) {
                if (err) {
                    responseData =
                    {
                        "statusCode": 500,
                        "error": err.stack,
                        "message": "error while executing the query"
                    }
                    let jsonContent = JSON.stringify(responseData);
                    res.end(jsonContent)

                }
                else {
                    let responseData = "";
                    if (result.length == 0) {
                        responseData =
                        {
                            "statusCode": 200,
                            "message": "No projects found"
                        }
                    }
                    else {
                        responseData =
                        {
                            "statusCode": 200,
                            "message": "Listing of projects successfully",
                            "data": result
                        }
                    }
                    let jsonContent = JSON.stringify(responseData);
                    res.end(jsonContent);
                }
            })
        }
    }
    catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            message = "Token expired please login again";
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);

    }
})
app.post(apiModules.userProject, async (req, res) => {
    try {
        var con = await Connection();
        var connect = con.connection;
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // console.log(token);
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
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        // var userid=decoded.userid;
        // var roleId=decoded.roleid;
        console.log("the userid in access token " + userid);
        let data = req.body;
        let project_name = data.project_name;
        let project_version = data.project_version;
        let now = new Date();
        let currentDateAndTime = date.format(now, 'DD-MM-YYYY HH:MM:SS');
        // let query="insert into projects(project_name,project_version,created_by,created_on,updated_on)values(?,?,?,?,?)"; 
        let query = allQuerys.insertProject;
        connect.query(query, [project_name, project_version, userid, currentDateAndTime, currentDateAndTime], async (err, result) => {
            console.log(query);
            if (err) {
                responseData =
                {
                    "statusCode": 500,
                    "error": err.stack,
                    // "message":"error while executing the query"
                    "message": messages.QueryError
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
            }
            else {

                let responseData =
                {
                    "statusCode": 200,
                    // "message":"Project inserted successfully"
                    "message": messages.insertProjects
                };
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
            }

        })
    }
    catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            //    message="Token expired please login again";
            message = messages.TokenExpiredError;
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);


    }
})
app.put(apiModules.userProject, async (req, res) => {
    try {
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // console.log(token);
        let now = new Date();
        let currentDateAndTime = date.format(now, 'DD-MM-YYYY HH:MM:SS');
        var con = await Connection();
        var connect = con.connection;
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
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        // var userid=decoded.userid;
        // var roleId=decoded.roleid;
        console.log("the userid in access token " + userid);
        let data = req.body;
        let firstproject_name = data.project_name;
        let project_version = data.project_version;
        var id = req.query.id;
        let profilePic = "";
        // let query="update projects set project_name=?,project_version=?,updated_on=? where id=?"; 
        let query = allQuerys.updtaeProject;
        connect.query(query, [firstproject_name, project_version, currentDateAndTime, id], async (err, result) => {
            if (err) {
                responseData =
                {
                    "statusCode": 500,
                    "error": err.stack,
                    // "message":"error while executing the query"
                    "message": messages.QueryError
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);

            }
            else {

                responseData =
                {
                    "statusCode": 200,
                    // "message":"Project details updated successfully"
                    "message": messages.deleteProject
                };
                const jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
            }

        })
    }
    catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            message = "Token expired please login again";
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);


    }
})
app.delete(apiModules.userProject, async (req, res) => {
    try {
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // console.log(token);
        var con = await Connection();
        var connect = con.connection;
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
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        // // var userId=req.query.UserId;
        // var userId=decoded.userid;
        // var roleId=decoded.roleid;
        let id = req.query.id;
        // console.log("the userid in access token "+userId);
        // let query="delete from projects where id= ?";
        let query = allQuerys.deleteProject;
        connect.query(query, [id], async (err, queryResults) => {
            if (err) {
                responseData =
                {
                    "statusCode": 500,
                    "error": err.stack,
                    // "message":"Error while executing the query"
                    "message": messages.QueryError
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
            }
            else {
                responseData =
                {
                    "statusCode": 200,
                    //  "message":"Project deleted successfully"

                };
                const jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
            }
        })
    }
    catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            message = "Token expired please login again";
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);

    }




})
app.get(apiModules.userProject, async (req, res) => {
    try {
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // console.log(token);
        console.log(req.headers);
        console.log("the ******************" + token);
        var con = await Connection();
        var connect = con.connection;
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        // console.log(decoded);
        // console.log(decoded.roleid+decoded.userid);
        // var roleId=decoded.roleid;
        // var userid=decoded.userid;
        console.log("the userid in access token " + userid);
        // let queryForAll="SELECT projects.*,users.user_name as createdUserName FROM projects inner join users";
        let queryForAll = allQuerys.getProjectsForAllDetails;
        // let queryForparticularUsrer="select id,project_name,project_version from projects where created_by =?";
        let queryForparticularUsrer = allQuerys.getProjectsForparticularUsrer;
        if (roleId == 1) {
            connect.query(queryForAll, (err, result) => {
                if (err) {
                    responseData =
                    {
                        "statusCode": 500,
                        "error": err.stack,
                        "message": "Error while executing the query"
                    }
                    let jsonContent = JSON.stringify(responseData);
                    res.end(jsonContent)

                }
                else {
                    let responseData = "";
                    if (result.length == 0) {
                        responseData =
                        {
                            "statusCode": 200,
                            "message": "No projects found"
                        }
                    }
                    else {
                        responseData =
                        {
                            "statusCode": 200,
                            "message": "Listing of projects successfully",
                            "data": result
                        }
                    }
                    let jsonContent = JSON.stringify(responseData);
                    res.end(jsonContent);
                }

            }
            )
        }
        else {
            connect.query(queryForparticularUsrer, [userid], function (err, result) {
                if (err) {
                    responseData =
                    {
                        "statusCode": 500,
                        "error": err.stack,
                        "message": "error while executing the query"
                    }
                    let jsonContent = JSON.stringify(responseData);
                    res.end(jsonContent)

                }
                else {
                    let responseData = "";
                    if (result.length == 0) {
                        responseData =
                        {
                            "statusCode": 200,
                            "message": "No projects found"
                        }
                    }
                    else {
                        responseData =
                        {
                            "statusCode": 200,
                            "message": "Listing of projects successfully",
                            "data": result
                        }
                    }
                    let jsonContent = JSON.stringify(responseData);
                    res.end(jsonContent);
                }
            })
        }
    }
    catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            message = "Token expired please login again";
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);

    }
})
app.post(apiModules.userDetailsServiceforAdmin, async (req, res) => {
    try {
        console.log("++++++++++++++++++++++++++++++*****enter****++++++++++++++++++++++++++++++++++++++++++");
        var con = await Connection();
        var connect = con.connection;
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // console.log(token);
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        // var userid=decoded.userid;
        // var roleId=decoded.roleid;
        console.log("the userid in access token " + userid);
        let data = req.body;
        let firstName = data.firstName;
        let lastName = data.lastName;
        let checkFname = validator.isAlpha(firstName);
        let checkLname = validator.isAlpha(lastName);
        console.log(checkFname);
        console.log(checkLname);
        let fnLength = validator.isMaxLength(firstName, 50, min_length = 2);
        let lnLength = validator.isMaxLength(lastName, 50, min_length = 2);
        // if(checkFname==false||checkLname==false||fnLength==false||lnLength==false)
        //     {
        //      let responseData=
        //         {
        //          "statusCode" :202,
        //         "message":"Enter valid First Name and Last Name "
        //         }                 
        //         let jsonContent = JSON.stringify(responseData);
        //         res.end(jsonContent);
        //      return res;
        //     }
        if (checkFname == false || checkLname == false) {
            let responseData =
            {
                "statusCode": 202,
                "message": "First Name and last Name accepts only alphabets "
            }
            let jsonContent = JSON.stringify(responseData);
            res.end(jsonContent);
            return res;
        }
        if (firstName.length < 2 || firstName.length >= 50 || lastName.length < 2 || lastName.length >= 50) {
            let responseData =
            {
                "statusCode": 202,
                "message": "Enter first name and last name range in between 3 to 50 chnaracter only "
            }
            let jsonContent = JSON.stringify(responseData);
            res.end(jsonContent);
            return res;
        }
        let profile_pic = "";
        let now = new Date();
        let currentDateAndTime = date.format(now, 'DD-MM-YYYY HH:MM:SS');
        let details = await userMailCheck.checkUserDetails(userid, con.db, con.connection);
        console.log(details + "!!!!!!!!!!!!!!!!!!!");
        if (details == 0) {
            // let query="insert into user_details(user_id,first_name,last_name,created_on,updated_on)values(?,?,?,?,?)"; 
            let query = allQuerys.insertUserDetails;
            connect.query(query, [userid, firstName, lastName, currentDateAndTime, currentDateAndTime], async (err, result) => {
                console.log(query);
                if (err) {
                    responseData =
                    {
                        "statusCode": 500,
                        "error": err.stack,
                        "message": "error while executing the query"
                    }
                    let jsonContent = JSON.stringify(responseData);
                    res.end(jsonContent);
                }
                else {

                    let responseData =
                    {
                        "statusCode": 200,
                        "message": "User details inserted successfully"
                    };
                    let jsonContent = JSON.stringify(responseData);
                    res.end(jsonContent);
                }

            })
        }
        else {
            // let query="update user_details set first_name=?,last_name=?,updated_on=? where user_id=?"; 
            let query = allQuerys.updtaeUserDetails;
            connect.query(query, [firstName, lastName, currentDateAndTime, userid], async (err, result) => {
                if (err) {
                    responseData =
                    {
                        "statusCode": 500,
                        "error": err.stack,
                        "message": "error while executing the query"
                    }
                    let jsonContent = JSON.stringify(responseData);
                    res.end(jsonContent);

                }
                else {

                    responseData =
                    {
                        "statusCode": 200,
                        "message": "User details updated successfully"
                    };
                    const jsonContent = JSON.stringify(responseData);
                    res.end(jsonContent);
                }

            })

        }
    }
    catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            message = "Token expired please login again";
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);

    }
})
app.put(apiModules.userDetailsServiceforAdmin, async (req, res) => {
    try {
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // console.log(token);
        let now = new Date();
        let currentDateAndTime = date.format(now, 'DD-MM-YYYY HH:MM:SS');
        var con = await Connection();
        var connect = con.connection;
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        // var userid=decoded.userid;
        // var roleId=decoded.roleid;
        console.log("the userid in access token " + userid);
        let data = req.body;
        let firstName = data.firstName;
        let lastName = data.lastName;
        let checkFname = validator.isAlpha(firstName);
        let checkLname = validator.isAlpha(lastName);
        let fnLength = validator.isMaxLength(firstName, 50, min_length = 2);
        let lnLength = validator.isMaxLength(lastName, 50, min_length = 2);
        // if(checkFname==false||checkLname==false||fnLength==false||lnLength==false)
        //     {
        //      let responseData=
        //         {
        //          "statusCode" :202,
        //         "message":"Enter valid First Name and Last Name "
        //         }                 
        //         let jsonContent = JSON.stringify(responseData);
        //         res.end(jsonContent);
        //      return res;
        //     }
        if (checkFname == false || checkLname == false) {
            let responseData =
            {
                "statusCode": 202,
                "message": "First Name and last Name accepts only alphabets "
            }
            let jsonContent = JSON.stringify(responseData);
            res.end(jsonContent);
            return res;
        }
        if (firstName.length < 2 || firstName.length >= 50 || lastName.length < 2 || lastName.length >= 50) {
            let responseData =
            {
                "statusCode": 202,
                "message": "Enter first name and last name range in between 3 to 50 chnaracter only "
            }
            let jsonContent = JSON.stringify(responseData);
            res.end(jsonContent);
            return res;
        }
        let id = req.query.id;
        let profilePic = "";
        // let query="update user_details set first_name=?,last_name=?,updated_on=? where id=?"; 
        let query = allQuerys.updtaeUserDetails;
        connect.query(query, [firstName, lastName, currentDateAndTime, id], async (err, result) => {
            if (err) {
                responseData =
                {
                    "statusCode": 500,
                    "error": err.stack,
                    "message": "error while executing the query"
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);

            }
            else {

                responseData =
                {
                    "statusCode": 200,
                    "message": "User details updated successfully"
                };
                const jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
            }

        })
    }
    catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            message = "Token expired please login again";
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);


    }
})
app.delete(apiModules.userDetailsServiceforAdmin, async (req, res) => {
    try {
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // console.log(token);
        var con = await Connection();
        var connect = con.connection;
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        // var userId=req.query.UserId;
        // var userId=decoded.userid;
        // var roleId=decoded.roleid;
        let id = req.query.id;
        // console.log("the userid in access token "+userId);
        // let query="delete from user_details where id= ?";
        let query = allQuerys.deleteUserDetails;
        connect.query(query, [id], async (err, queryResults) => {
            if (err) {
                responseData =
                {
                    "statusCode": 500,
                    "error": err.stack,
                    "message": "Error while executing the query"
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
            }
            else {
                responseData =
                {
                    "statusCode": 404,
                    "message": "User details deleted successfully",
                };
                const jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
            }
        })
    }
    catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            message = "Token expired please login again";
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        else {
            message = err.message;
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);

    }

})
app.get(apiModules.userDetailsServiceforAdmin, async (req, res) => {
    try {
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // console.log(token);
        console.log(req.headers);
        // console.log("the ******************"+token);
        var con = await Connection();
        var connect = con.connection;
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
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        //     console.log(decoded);
        //     console.log(decoded.roleid+decoded.userid);
        //     var roleId=decoded.roleid;
        //     var userid=decoded.userid;
        console.log("the userid in access token " + userid);
        // let queryForAll="select id,user_id,first_name,last_name,profile_pic from user_details where user_id=?";
        let queryForAll = allQuerys.getUserDetails;
        connect.query(queryForAll, [userid], (err, result) => {
            if (err) {
                responseData =
                {
                    "statusCode": 500,
                    "error": err.stack,
                    "message": "Error while executing the query"
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent)

            }
            else {
                let responseData = "";
                if (result.length == 0) {
                    responseData =
                    {
                        "statusCode": 200,
                        "message": "No user details found"
                    }
                }
                else {
                    responseData =
                    {
                        "statusCode": 200,
                        "message": "Listing of user details succesfully",
                        "data": result
                    }
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
            }

        }
        )

    }
    catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            message = "Token expired please login again";
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        else {
            message = err.message;
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);

    }
})
app.post(apiModules.userDetailsServiceforUser, async (req, res) => {
    try {
        console.log("++++++++++++++++++++++++++++++*****enter****++++++++++++++++++++++++++++++++++++++++++");
        var con = await Connection();
        var connect = con.connection;
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // console.log(token);
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        // var userid=decoded.userid;
        // var roleId=decoded.roleid;
        console.log("the userid in access token " + userid);
        let data = req.body;
        let firstName = data.firstName;
        let lastName = data.lastName;
        let checkFname = validator.isAlpha(firstName);
        let checkLname = validator.isAlpha(lastName);
        console.log(checkFname);
        console.log(checkLname);
        let fnLength = validator.isMaxLength(firstName, 50, min_length = 2);
        let lnLength = validator.isMaxLength(lastName, 50, min_length = 2);
        // if(checkFname==false||checkLname==false||fnLength==false||lnLength==false)
        //     {
        //      let responseData=
        //         {
        //          "statusCode" :202,
        //         "message":"Enter valid First Name and Last Name "
        //         }                 
        //         let jsonContent = JSON.stringify(responseData);
        //         res.end(jsonContent);
        //      return res;
        //     }
        if (checkFname == false || checkLname == false) {
            let responseData =
            {
                "statusCode": 202,
                "message": "First Name and last Name accepts only alphabets "
            }
            let jsonContent = JSON.stringify(responseData);
            res.end(jsonContent);
            return res;
        }
        if (firstName.length < 2 || firstName.length >= 50 || lastName.length < 2 || lastName.length >= 50) {
            let responseData =
            {
                "statusCode": 202,
                "message": "Enter first name and last name range in between 3 to 50 chnaracter only "
            }
            let jsonContent = JSON.stringify(responseData);
            res.end(jsonContent);
            return res;
        }
        let profile_pic = "";
        let now = new Date();
        let currentDateAndTime = date.format(now, 'DD-MM-YYYY HH:MM:SS');
        let details = await userMailCheck.checkUserDetails(userid, con.db, con.connection);
        console.log(details + "!!!!!!!!!!!!!!!!!!!");
        if (details == 0) {
            // let query="insert into user_details(user_id,first_name,last_name,created_on,updated_on)values(?,?,?,?,?)"; 
            let query = allQuerys.insertUserDetails;
            connect.query(query, [userid, firstName, lastName, currentDateAndTime, currentDateAndTime], async (err, result) => {
                console.log(query);
                if (err) {
                    responseData =
                    {
                        "statusCode": 500,
                        "error": err.stack,
                        "message": "error while executing the query"
                    }
                    let jsonContent = JSON.stringify(responseData);
                    res.end(jsonContent);
                }
                else {

                    let responseData =
                    {
                        "statusCode": 200,
                        "message": "User details inserted successfully"
                    };
                    let jsonContent = JSON.stringify(responseData);
                    res.end(jsonContent);
                }

            })
        }
        else {
            // let query="update user_details set first_name=?,last_name=?,updated_on=? where user_id=?"; 
            let query = allQuerys.updtaeUserDetails;
            connect.query(query, [firstName, lastName, currentDateAndTime, userid], async (err, result) => {
                if (err) {
                    responseData =
                    {
                        "statusCode": 500,
                        "error": err.stack,
                        "message": "error while executing the query"
                    }
                    let jsonContent = JSON.stringify(responseData);
                    res.end(jsonContent);

                }
                else {

                    responseData =
                    {
                        "statusCode": 200,
                        "message": "User details updated successfully"
                    };
                    const jsonContent = JSON.stringify(responseData);
                    res.end(jsonContent);
                }

            })

        }
    }
    catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            message = "Token expired please login again";
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);

    }
})
app.put(apiModules.userDetailsServiceforUser, async (req, res) => {
    try {
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // console.log(token);
        let now = new Date();
        let currentDateAndTime = date.format(now, 'DD-MM-YYYY HH:MM:SS');
        var con = await Connection();
        var connect = con.connection;
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        // var userid=decoded.userid;
        // var roleId=decoded.roleid;
        console.log("the userid in access token " + userid);
        let data = req.body;
        let firstName = data.firstName;
        let lastName = data.lastName;
        let checkFname = validator.isAlpha(firstName);
        let checkLname = validator.isAlpha(lastName);
        let fnLength = validator.isMaxLength(firstName, 50, min_length = 2);
        let lnLength = validator.isMaxLength(lastName, 50, min_length = 2);
        // if(checkFname==false||checkLname==false||fnLength==false||lnLength==false)
        //     {
        //      let responseData=
        //         {
        //          "statusCode" :202,
        //         "message":"Enter valid First Name and Last Name "
        //         }                 
        //         let jsonContent = JSON.stringify(responseData);
        //         res.end(jsonContent);
        //      return res;
        //     }
        if (checkFname == false || checkLname == false) {
            let responseData =
            {
                "statusCode": 202,
                "message": "First Name and last Name accepts only alphabets "
            }
            let jsonContent = JSON.stringify(responseData);
            res.end(jsonContent);
            return res;
        }
        if (firstName.length < 2 || firstName.length >= 50 || lastName.length < 2 || lastName.length >= 50) {
            let responseData =
            {
                "statusCode": 202,
                "message": "Enter first name and last name range in between 3 to 50 chnaracter only "
            }
            let jsonContent = JSON.stringify(responseData);
            res.end(jsonContent);
            return res;
        }
        let id = req.query.id;
        let profilePic = "";
        // let query="update user_details set first_name=?,last_name=?,updated_on=? where id=?"; 
        let query = allQuerys.updtaeUserDetails;
        connect.query(query, [firstName, lastName, currentDateAndTime, id], async (err, result) => {
            if (err) {
                responseData =
                {
                    "statusCode": 500,
                    "error": err.stack,
                    "message": "error while executing the query"
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);

            }
            else {

                responseData =
                {
                    "statusCode": 200,
                    "message": "User details updated successfully"
                };
                const jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
            }

        })
    }
    catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            message = "Token expired please login again";
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);


    }
})
app.delete(apiModules.userDetailsServiceforUser, async (req, res) => {
    try {
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // console.log(token);
        var con = await Connection();
        var connect = con.connection;
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        // var userId=req.query.UserId;
        // var userId=decoded.userid;
        // var roleId=decoded.roleid;
        let id = req.query.id;
        // console.log("the userid in access token "+userId);
        // let query="delete from user_details where id= ?";
        let query = allQuerys.deleteUserDetails;
        connect.query(query, [id], async (err, queryResults) => {
            if (err) {
                responseData =
                {
                    "statusCode": 500,
                    "error": err.stack,
                    "message": "Error while executing the query"
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
            }
            else {
                responseData =
                {
                    "statusCode": 404,
                    "message": "User details deleted successfully",
                };
                const jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
            }
        })
    }
    catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            message = "Token expired please login again";
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        else {
            message = err.message;
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);

    }

})
app.get(apiModules.userDetailsServiceforUser, async (req, res) => {
    try {
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // console.log(token);
        console.log(req.headers);
        // console.log("the ******************"+token);
        var con = await Connection();
        var connect = con.connection;
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
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        //     console.log(decoded);
        //     console.log(decoded.roleid+decoded.userid);
        //     var roleId=decoded.roleid;
        //     var userid=decoded.userid;
        console.log("the userid in access token " + userid);
        // let queryForAll="select id,user_id,first_name,last_name,profile_pic from user_details where user_id=?";
        let queryForAll = allQuerys.getUserDetails;
        connect.query(queryForAll, [userid], (err, result) => {
            if (err) {
                responseData =
                {
                    "statusCode": 500,
                    "error": err.stack,
                    "message": "Error while executing the query"
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent)

            }
            else {
                let responseData = "";
                if (result.length == 0) {
                    responseData =
                    {
                        "statusCode": 200,
                        "message": "No user details found"
                    }
                }
                else {
                    responseData =
                    {
                        "statusCode": 200,
                        "message": "Listing of user details succesfully",
                        "data": result
                    }
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
            }

        }
        )

    }
    catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            message = "Token expired please login again";
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        else {
            message = err.message;
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);

    }
})
app.post(apiModules.uploadProfirePicAdmin, async (req, res) => {
    try {
        console.log(req.ip);
        const ipAdd = req.socket.localAddress;
        let form = new formidable.IncomingForm();
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        // var userid=decoded.userid;
        // var roleId=decoded.roleid;
        var con = await Connection();
        var connect = con.connection;
        let db = con.db;
        let userName = await userMailCheck.getUserName(userid, con.db, con.connection);
        // let userNameQuery="select user_name from users where id=?";
        // const result=await db.query(connect,userNameQuery,[userid]);
        // console.log(result);
        // let userName=await result[0].user_name;
        console.log("the user name " + userName);
        var dir = './profilepic';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        //  var filepath=__dirname+"D:\NodeTasks\NodeProject\profilepicUploads";
        const dirPath = path.join(__dirname, '/profilepic');
        console.log("direction ");
        console.log(dirPath);
        form.parse(req, async function (err, fields, files) {
            var oldpath = await files.filetoupload.filepath;
            var newpath = dir;
            // console.log(files);
            console.log("---------------------------");
            console.log(files.filetoupload.mimetype);
            if (files.filetoupload.mimetype == 'image/png' || files.filetoupload.mimetype == 'image/jpg' || files.filetoupload.mimetype == 'image/jpeg') {
                //   let responseData=
                //          {
                //             "statusCode":201,
                //             "message":"Upload only jpg,jpeg,png format pictures only"
                //          };
                //          const jsonContent = JSON.stringify(responseData);
                //          res.status(201).end(jsonContent);
                //          return res;

                fs.readFile(files.filetoupload.filepath, function (err, data) {
                    if (err) throw err;
                    console.log('File read!');
                    fs.writeFile(newpath + "/" + userid + ".png", data, function (err) {
                        if (err) throw err;
                        let profilepicPath = "/images/" + userid + ".png";
                        //  let profilepicPath=req.ip+port+"/images/"+userName+".png";
                        console.log(profilepicPath);
                        let queryForProfilepic = "update user_details set profile_pic=? where user_id=?";
                        connect.query(queryForProfilepic, [profilepicPath, userid]);
                        console.log(profilepicPath);
                        responseData =
                        {
                            "statusCode": 200,
                            "message": "profile pic uploaded successfully"

                        };
                        const jsonContent = JSON.stringify(responseData);
                        res.status(200).end(jsonContent);

                    });
                })


            }
            else {
                let responseData =
                {
                    "statusCode": 201,
                    "message": "Upload only jpg,jpeg,png format pictures only"
                };
                const jsonContent = JSON.stringify(responseData);
                res.status(201).end(jsonContent);
                // fs.readFile(files.filetoupload.filepath, function (err, data) 
                // {
                //     if (err) throw err;
                //     console.log('File read!');
                //     fs.writeFile( newpath+"/"+userName+".png",data, function(err)
                //     {
                //          if (err) throw err;
                //          let profilepicPath=PortId+"/images/"+userName+".png";
                //         //  let profilepicPath=req.ip+port+"/images/"+userName+".png";
                //          console.log(profilepicPath);
                //          let queryForProfilepic="update user_details set profile_pic=? where user_id=?";
                //          connect.query(queryForProfilepic,[profilepicPath,userid]);
                //          console.log(profilepicPath);
                //          responseData=
                //          {
                //             "statusCode":200,
                //             "message":"profile pic uploaded successfully"

                //          };
                //             const jsonContent = JSON.stringify(responseData);
                //             res.status(200).end(jsonContent);

                //          });
                //     })
            }
        })
    }
    catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            message = "Token expired please login again";
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);
    }
})
app.post(apiModules.uploadProfirePicUser, async (req, res) => {
    try {
        console.log(req.ip);
        const ipAdd = req.socket.localAddress;
        let form = new formidable.IncomingForm();
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        // var userid=decoded.userid;
        // var roleId=decoded.roleid;
        var con = await Connection();
        var connect = con.connection;
        let db = con.db;
        let userName = await userMailCheck.getUserName(userid, con.db, con.connection);
        // let userNameQuery="select user_name from users where id=?";
        // const result=await db.query(connect,userNameQuery,[userid]);
        // console.log(result);
        // let userName=await result[0].user_name;
        console.log("the user name " + userName);
        var dir = './profilepic';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        //  var filepath=__dirname+"D:\NodeTasks\NodeProject\profilepicUploads";
        const dirPath = path.join(__dirname, '/profilepic');
        console.log("direction ");
        console.log(dirPath);
        form.parse(req, async function (err, fields, files) {
            var oldpath = await files.filetoupload.filepath;
            var newpath = dir;
            // console.log(files);
            console.log("---------------------------");
            console.log(files.filetoupload.mimetype);
            if (files.filetoupload.mimetype == 'image/png' || files.filetoupload.mimetype == 'image/jpg' || files.filetoupload.mimetype == 'image/jpeg') {
                //   let responseData=
                //          {
                //             "statusCode":201,
                //             "message":"Upload only jpg,jpeg,png format pictures only"
                //          };
                //          const jsonContent = JSON.stringify(responseData);
                //          res.status(201).end(jsonContent);
                //          return res;

                fs.readFile(files.filetoupload.filepath, function (err, data) {
                    if (err) throw err;
                    console.log('File read!');
                    fs.writeFile(process.env.PATH_FOR_UPLOADpath + "/" + userid + ".png", data, function (err) {
                        if (err) throw err;
                        let profilepicPath = "/images/" + userid + ".png";
                        //  let profilepicPath=req.ip+port+"/images/"+userName+".png";
                        console.log(profilepicPath);
                        let queryForProfilepic = "update user_details set profile_pic=? where user_id=?";
                        connect.query(queryForProfilepic, [profilepicPath, userid]);
                        console.log(profilepicPath);
                        responseData =
                        {
                            "statusCode": 200,
                            "message": "profile pic uploaded successfully"

                        };
                        const jsonContent = JSON.stringify(responseData);
                        res.status(200).end(jsonContent);

                    });
                })


            }
            else {
                let responseData =
                {
                    "statusCode": 201,
                    "message": "Upload only jpg,jpeg,png format pictures only"
                };
                const jsonContent = JSON.stringify(responseData);
                res.status(201).end(jsonContent);
                // fs.readFile(files.filetoupload.filepath, function (err, data) 
                // {
                //     if (err) throw err;
                //     console.log('File read!');
                //     fs.writeFile( newpath+"/"+userName+".png",data, function(err)
                //     {
                //          if (err) throw err;
                //          let profilepicPath=PortId+"/images/"+userName+".png";
                //         //  let profilepicPath=req.ip+port+"/images/"+userName+".png";
                //          console.log(profilepicPath);
                //          let queryForProfilepic="update user_details set profile_pic=? where user_id=?";
                //          connect.query(queryForProfilepic,[profilepicPath,userid]);
                //          console.log(profilepicPath);
                //          responseData=
                //          {
                //             "statusCode":200,
                //             "message":"profile pic uploaded successfully"

                //          };
                //             const jsonContent = JSON.stringify(responseData);
                //             res.status(200).end(jsonContent);

                //          });
                //     })
            }
        })
    }
    catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            message = "Token expired please login again";
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);
    }
})
app.post(apiModules.userProfileAdmin, async (req, res) => {
    try {
        console.log(req.body);
        var con = await Connection();
        var connect = con.connection;
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        // var userid=decoded.userid;
        // var roleId=decoded.roleid;
        console.log("the userid in access token " + userid);
        // let data=req.body;
        // let firstName=data.firstName;
        // let lastName=data.lastName;
        // console.log(firstName);
        let form = new formidable.IncomingForm();
        var dir = './profilepic';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        form.parse(req, async function (err, fields, files) {
            console.log(fields);
            var firstName = fields.firstName
            var lastName = fields.lastName;
            let checkFname = validator.isAlpha(firstName);
            let checkLname = validator.isAlpha(lastName);
            let fnLength = validator.isMaxLength(firstName, 50, min_length = 2);
            let lnLength = validator.isMaxLength(lastName, 50, min_length = 2);
            if (checkFname == false || checkLname == false) {
                let responseData =
                {
                    "statusCode": 202,
                    "message": "First Name and last Name accepts only alphabets "
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
                return res;
            }
            if (firstName.length < 2 || firstName.length >= 50 || lastName.length < 2 || lastName.length >= 50) {
                let responseData =
                {
                    "statusCode": 202,
                    "message": "Enter first name and last name range in between 3 to 50 chnaracter only "
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
                return res;
            }
            if (files.filetoupload.mimetype == 'image/png' || files.filetoupload.mimetype == 'image/jpg' || files.filetoupload.mimetype == 'image/jpeg') {
                // let responseData=
                //     {
                //     "statusCode":201,
                //     "message":"Upload only jpg,jpeg,png format pictures only"
                //     };
                //     const jsonContent = JSON.stringify(responseData);
                //      res.status(201).end(jsonContent);
                //     return res;


                console.log("the &&&&&&&&&&&&&&&&" + firstName);
                var oldpath = await files.filetoupload.filepath;
                var newpath = dir;
                fs.readFile(files.filetoupload.filepath, async function (err, data) {
                    if (err) {
                        responseData =
                        {
                            "statusCode": 500,
                            "error": err.stack,
                            "message": "Error while uploading the file"
                        }
                        let jsonContent = JSON.stringify(responseData);
                        res.end(jsonContent);
                        return res;
                    }
                    else {
                        console.log('File read!');
                        fs.writeFile(newpath + "/" + firstName + lastName + ".png", data, async function (err) {
                            if (err) {
                                responseData =
                                {
                                    "statusCode": 500,
                                    "error": err.stack,
                                    "message": "Error while uploading the file"
                                }
                                let jsonContent = JSON.stringify(responseData);
                                res.end(jsonContent);
                                return res;
                            }
                            else {
                                let profilepicPath = "/images/" + firstName + lastName + ".png";
                                //  let profilepicPath=req.ip+port+"/images/"+userName+".png";
                                console.log(profilepicPath);
                                let now = new Date();
                                let currentDateAndTime = date.format(now, 'DD-MM-YYYY HH:MM:SS');
                                // let queryforinsertorupdate="select * from user details where user_id=?";
                                // let resultsforinsertorupdate=connect.query(queryforinsertorupdate,[userid]);
                                let details = await userMailCheck.checkUserDetails(userid, con.db, con.connection);
                                // console.log(resultsforinsertorupdate)
                                if (details == 0) {
                                    //  let query="insert into user_details(user_id,first_name,last_name,profile_pic,created_on,updated_on)values(?,?,?,?,?,?)"; 
                                    let query = allQuerys.insertUserDetailsWithProfilePic;
                                    connect.query(query, [userid, firstName, lastName, profilepicPath, currentDateAndTime, currentDateAndTime], async (err, result) => {
                                        console.log(query);
                                        if (err) {
                                            responseData =
                                            {
                                                "statusCode": 500,
                                                "error": err.stack,
                                                "message": "error while executing the query"
                                            }
                                            let jsonContent = JSON.stringify(responseData);
                                            res.end(jsonContent);
                                        }
                                        else {

                                            let responseData =
                                            {
                                                "statusCode": 200,
                                                "message": "User details inserted successfully"
                                            };
                                            let jsonContent = JSON.stringify(responseData);
                                            res.end(jsonContent);
                                        }

                                    })
                                }
                                else {
                                    // let query="update user_details set first_name=?,last_name=?,profile_pic=?,updated_on=? where user_id=?"; 
                                    let query = allQuerys.updtaeUserDetailswithProfilePic;
                                    connect.query(query, [firstName, lastName, profilepicPath, currentDateAndTime, userid], async (err, result) => {
                                        console.log(query);
                                        if (err) {
                                            responseData =
                                            {
                                                "statusCode": 500,
                                                "error": err.stack,
                                                "message": "error while executing the query"
                                            }
                                            let jsonContent = JSON.stringify(responseData);
                                            res.end(jsonContent);
                                        }
                                        else {

                                            let responseData =
                                            {
                                                "statusCode": 200,
                                                "message": "User details updated successfully"
                                            };
                                            let jsonContent = JSON.stringify(responseData);
                                            res.end(jsonContent);
                                        }

                                    })
                                }

                            }

                        });
                    }
                })
            }
            else {
                let responseData =
                {
                    "statusCode": 201,
                    "message": "Upload only jpg,jpeg,png format pictures only"
                };
                const jsonContent = JSON.stringify(responseData);
                res.status(201).end(jsonContent);
                return res;
            }
        })
    }
    catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            message = "Token expired please login again";
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        else {
            message = err.message;
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);

    }
})
app.put(apiModules.userProfileAdmin, async (req, res) => {
    try {
        console.log(req.body);
        var con = await Connection();
        var connect = con.connection;
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        // var userid=decoded.userid;
        // var roleId=decoded.roleid;
        // console.log("the userid in access token "+userid);
        // let data=req.body;
        // let firstName=data.firstName;
        // let lastName=data.lastName;
        // console.log(firstName);
        let form = new formidable.IncomingForm();
        var dir = './profilepic';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        form.parse(req, async function (err, fields, files) {
            console.log(fields);
            var firstName = fields.firstName
            var lastName = fields.lastName;
            let checkFname = validator.isAlpha(firstName);
            let checkLname = validator.isAlpha(lastName);
            let fnLength = validator.isMaxLength(firstName, 50, min_length = 2);
            let lnLength = validator.isMaxLength(lastName, 50, min_length = 2);
            // if(checkFname==false||checkLname==false||fnLength==false||lnLength==false)
            //     {
            //      let responseData=
            //         {
            //          "statusCode" :202,
            //         "message":"Enter valid First Name and Last Name "
            //         }                 
            //         let jsonContent = JSON.stringify(responseData);
            //         res.end(jsonContent);
            //      return res;
            //     }
            if (checkFname == false || checkLname == false) {
                let responseData =
                {
                    "statusCode": 202,
                    // "message":"First Name and last Name accepts only alphabets "
                    "message": messages.FNandLNalphabets
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
                return res;
            }
            if (firstName.length < 2 || firstName.length >= 50 || lastName.length < 2 || lastName.length >= 50) {
                let responseData =
                {
                    "statusCode": 202,
                    // "message":"Enter first name and last name range in between 3 to 50 chnaracter only "
                    "message": messages.FNandLNrange
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
                return res;
            }
            if (files.filetoupload.mimetype == 'image/png' || files.filetoupload.mimetype == 'image/jpg' || files.filetoupload.mimetype == 'image/jpeg') {
                // let responseData=
                //     {
                //     "statusCode":201,
                //     "message":"Upload only jpg,jpeg,png format pictures only"
                //     };
                //     const jsonContent = JSON.stringify(responseData);
                //      res.status(201).end(jsonContent);
                //     return res;                    
                var id = fields.id;
                console.log("the &&&&&&&&&&&&&&&&" + firstName);
                var oldpath = await files.filetoupload.filepath;
                var newpath = dir;
                fs.readFile(files.filetoupload.filepath, function (err, data) {
                    if (err) {
                        responseData =
                        {
                            "statusCode": 500,
                            "error": err.stack,
                            "message": "Error while uploading the file"
                        }
                        let jsonContent = JSON.stringify(responseData);
                        res.end(jsonContent);
                        return res;
                    }
                    else {
                        console.log('File read!');
                        fs.writeFile(newpath + "/" + firstName + lastName + ".png", data, function (err) {
                            if (err) {
                                responseData =
                                {
                                    "statusCode": 500,
                                    "error": err.stack,
                                    "message": "Error while uploading the file"
                                }
                                let jsonContent = JSON.stringify(responseData);
                                res.end(jsonContent);
                                return res;
                            }
                            else {
                                let profilepicPath = "/images/" + firstName + lastName + ".png";
                                //  let profilepicPath=req.ip+port+"/images/"+userName+".png";
                                console.log(profilepicPath);
                                let now = new Date();
                                let currentDateAndTime = date.format(now, 'DD-MM-YYYY HH:MM:SS');
                                // let query="update user_details set first_name=?,last_name=?,profile_pic=?,updated_on=? where id=?"; 
                                let query = allQuerys.updtaeUserDetailswithProfilePic;
                                connect.query(query, [firstName, lastName, profilepicPath, currentDateAndTime, id], async (err, result) => {
                                    console.log(query);
                                    if (err) {
                                        responseData =
                                        {
                                            "statusCode": 500,
                                            "error": err.stack,
                                            "message": "error while executing the query"
                                        }
                                        let jsonContent = JSON.stringify(responseData);
                                        res.end(jsonContent);
                                    }
                                    else {

                                        let responseData =
                                        {
                                            "statusCode": 200,
                                            "message": "User details updated successfully"
                                        };
                                        let jsonContent = JSON.stringify(responseData);
                                        res.end(jsonContent);
                                    }

                                })

                            }

                        });
                    }
                })
            }
            else {
                let responseData =
                {
                    "statusCode": 201,
                    "message": "Upload only jpg,jpeg,png format pictures only"
                };
                const jsonContent = JSON.stringify(responseData);
                res.status(201).end(jsonContent);
                return res;
            }
        })
    }
    catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            message = "Token expired please login again";
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        else {
            message = err.message;
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);


    }
})
app.delete(apiModules.userProfileAdmin, async (req, res) => {
    try {
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // console.log(token);
        var con = await Connection();
        var connect = con.connection;
        let id = req.query.id;
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        // var userId=req.query.UserId;
        // var userId=decoded.userid;
        // var roleId=decoded.roleid;
        console.log("the userid in access token " + userid);
        // let query="delete from user_details where id= ?";
        let query = allQuerys.deleteUserDetails;
        connect.query(query, [id], async (err, queryResults) => {
            if (err) {
                responseData =
                {
                    "statusCode": 500,
                    "error": err.stack,
                    // "message":"Error while executing the query"
                    "message": messages.QueryError
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
            }
            else {
                responseData =
                {
                    "statusCode": 200,
                    //  "message":"User details deleted successfully",
                    "message": messages.deleteUserdetailsSuccess
                };
                const jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
            }
        })
    }
    catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            message = "Token expired please login again";
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        else {
            message = err.message;
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);

    }

})
app.get(apiModules.userProfileAdmin, async (req, res) => {
    try {
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // console.log(token);
        // console.log(req.headers);
        // console.log("the ******************"+token);
        var con = await Connection();
        var connect = con.connection;
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        // console.log(decoded);
        // console.log(decoded.roleid+decoded.userid);
        // var roleId=decoded.roleid;
        // var userid=decoded.userid;
        console.log("the userid in access token " + userid);
        // let queryForAll="select id,user_id,first_name,last_name,profile_pic from user_details where user_id=?";
        let queryForAll = allQuerys.getUserDetails;
        connect.query(queryForAll, [userid], (err, result) => {
            if (err) {
                responseData =
                {
                    "statusCode": 500,
                    "error": err.stack,
                    // "message":"Error while executing the query"
                    "message": messages.QueryError
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent)

            }
            else {
                let responseData = "";
                if (result.length == 0) {
                    responseData =
                    {
                        "statusCode": 200,
                        // "message":"No user details found"
                        "message": messages.noUsers
                    }
                }
                else {
                    responseData =
                    {
                        "statusCode": 200,
                        //  "message":"Listing of user details succesfully",
                        "message": messages.ListOfUserSuccess,
                        "data": result
                    }
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
            }

        }
        )

    }
    catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            message = "Token expired please login again";
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        else {
            message = err.message;
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);

    }
})
app.post(apiModules.userProfileUser, async (req, res) => {
    try {
        console.log(req.body);
        var con = await Connection();
        var connect = con.connection;
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        // var userid=decoded.userid;
        // var roleId=decoded.roleid;
        console.log("the userid in access token " + userid);
        // let data=req.body;
        // let firstName=data.firstName;
        // let lastName=data.lastName;
        // console.log(firstName);
        let form = new formidable.IncomingForm();
        var dir = './profilepic';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        form.parse(req, async function (err, fields, files) {
            console.log(fields);
            var firstName = fields.firstName
            var lastName = fields.lastName;
            let checkFname = validator.isAlpha(firstName);
            let checkLname = validator.isAlpha(lastName);
            let fnLength = validator.isMaxLength(firstName, 50, min_length = 2);
            let lnLength = validator.isMaxLength(lastName, 50, min_length = 2);
            if (checkFname == false || checkLname == false) {
                let responseData =
                {
                    "statusCode": 202,
                    "message": "First Name and last Name accepts only alphabets "
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
                return res;
            }
            if (firstName.length < 2 || firstName.length >= 50 || lastName.length < 2 || lastName.length >= 50) {
                let responseData =
                {
                    "statusCode": 202,
                    "message": "Enter first name and last name range in between 3 to 50 chnaracter only "
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
                return res;
            }
            if (files.filetoupload.mimetype == 'image/png' || files.filetoupload.mimetype == 'image/jpg' || files.filetoupload.mimetype == 'image/jpeg') {
                // let responseData=
                //     {
                //     "statusCode":201,
                //     "message":"Upload only jpg,jpeg,png format pictures only"
                //     };
                //     const jsonContent = JSON.stringify(responseData);
                //      res.status(201).end(jsonContent);
                //     return res;


                console.log("the &&&&&&&&&&&&&&&&" + firstName);
                var oldpath = await files.filetoupload.filepath;
                var newpath = dir;
                fs.readFile(files.filetoupload.filepath, async function (err, data) {
                    if (err) {
                        responseData =
                        {
                            "statusCode": 500,
                            "error": err.stack,
                            "message": "Error while uploading the file"
                        }
                        let jsonContent = JSON.stringify(responseData);
                        res.end(jsonContent);
                        return res;
                    }
                    else {
                        console.log('File read!');
                        fs.writeFile(process.env.PATH_FOR_UPLOAD + "/" + userid + ".png", data, async function (err) {
                            if (err) {
                                responseData =
                                {
                                    "statusCode": 500,
                                    "error": err.stack,
                                    "message": "Error while uploading the file"
                                }
                                let jsonContent = JSON.stringify(responseData);
                                res.end(jsonContent);
                                return res;
                            }
                            else {
                                let profilepicPath = "/images/" + userid + ".png";
                                //  let profilepicPath=req.ip+port+"/images/"+userName+".png";
                                console.log(profilepicPath);
                                let now = new Date();
                                let currentDateAndTime = date.format(now, 'DD-MM-YYYY HH:MM:SS');
                                // let queryforinsertorupdate="select * from user details where user_id=?";
                                // let resultsforinsertorupdate=connect.query(queryforinsertorupdate,[userid]);
                                let details = await userMailCheck.checkUserDetails(userid, con.db, con.connection);
                                // console.log(resultsforinsertorupdate)
                                if (details == 0) {
                                    //  let query="insert into user_details(user_id,first_name,last_name,profile_pic,created_on,updated_on)values(?,?,?,?,?,?)"; 
                                    let query = allQuerys.insertUserDetailsWithProfilePic;
                                    connect.query(query, [userid, firstName, lastName, profilepicPath, currentDateAndTime, currentDateAndTime], async (err, result) => {
                                        console.log(query);
                                        if (err) {
                                            responseData =
                                            {
                                                "statusCode": 500,
                                                "error": err.stack,
                                                "message": "error while executing the query"
                                            }
                                            let jsonContent = JSON.stringify(responseData);
                                            res.end(jsonContent);
                                        }
                                        else {

                                            let responseData =
                                            {
                                                "statusCode": 200,
                                                "message": "User details inserted successfully"
                                            };
                                            let jsonContent = JSON.stringify(responseData);
                                            res.end(jsonContent);
                                        }

                                    })
                                }
                                else {
                                    // let query="update user_details set first_name=?,last_name=?,profile_pic=?,updated_on=? where user_id=?"; 
                                    let query = allQuerys.updtaeUserDetailswithProfilePic;
                                    connect.query(query, [firstName, lastName, profilepicPath, currentDateAndTime, userid], async (err, result) => {
                                        console.log(query);
                                        if (err) {
                                            responseData =
                                            {
                                                "statusCode": 500,
                                                "error": err.stack,
                                                "message": "error while executing the query"
                                            }
                                            let jsonContent = JSON.stringify(responseData);
                                            res.end(jsonContent);
                                        }
                                        else {

                                            let responseData =
                                            {
                                                "statusCode": 200,
                                                "message": "User details updated successfully"
                                            };
                                            let jsonContent = JSON.stringify(responseData);
                                            res.end(jsonContent);
                                        }

                                    })
                                }

                            }

                        });
                    }
                })
            }
            else {
                let responseData =
                {
                    "statusCode": 201,
                    "message": "Upload only jpg,jpeg,png format pictures only"
                };
                const jsonContent = JSON.stringify(responseData);
                res.status(201).end(jsonContent);
                return res;
            }
        })
    }
    catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            message = "Token expired please login again";
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        else {
            message = err.message;
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);

    }
})
app.put(apiModules.userProfileUser, async (req, res) => {
    try {
        console.log(req.body);
        var con = await Connection();
        var connect = con.connection;
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        // var userid=decoded.userid;
        // var roleId=decoded.roleid;
        // console.log("the userid in access token "+userid);
        // let data=req.body;
        // let firstName=data.firstName;
        // let lastName=data.lastName;
        // console.log(firstName);
        let form = new formidable.IncomingForm();
        var dir = './profilepic';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        form.parse(req, async function (err, fields, files) {
            console.log(fields);
            var firstName = fields.firstName
            var lastName = fields.lastName;
            let checkFname = validator.isAlpha(firstName);
            let checkLname = validator.isAlpha(lastName);
            let fnLength = validator.isMaxLength(firstName, 50, min_length = 2);
            let lnLength = validator.isMaxLength(lastName, 50, min_length = 2);
            // if(checkFname==false||checkLname==false||fnLength==false||lnLength==false)
            //     {
            //      let responseData=
            //         {
            //          "statusCode" :202,
            //         "message":"Enter valid First Name and Last Name "
            //         }                 
            //         let jsonContent = JSON.stringify(responseData);
            //         res.end(jsonContent);
            //      return res;
            //     }
            if (checkFname == false || checkLname == false) {
                let responseData =
                {
                    "statusCode": 202,
                    // "message":"First Name and last Name accepts only alphabets "
                    "message": messages.FNandLNalphabets
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
                return res;
            }
            if (firstName.length < 2 || firstName.length >= 50 || lastName.length < 2 || lastName.length >= 50) {
                let responseData =
                {
                    "statusCode": 202,
                    // "message":"Enter first name and last name range in between 3 to 50 chnaracter only "
                    "message": messages.FNandLNrange
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
                return res;
            }
            if (files.filetoupload.mimetype == 'image/png' || files.filetoupload.mimetype == 'image/jpg' || files.filetoupload.mimetype == 'image/jpeg') {
                // let responseData=
                //     {
                //     "statusCode":201,
                //     "message":"Upload only jpg,jpeg,png format pictures only"
                //     };
                //     const jsonContent = JSON.stringify(responseData);
                //      res.status(201).end(jsonContent);
                //     return res;                    
                var id = fields.id;
                console.log("the &&&&&&&&&&&&&&&&" + firstName);
                var oldpath = await files.filetoupload.filepath;
                var newpath = dir;
                fs.readFile(files.filetoupload.filepath, function (err, data) {
                    if (err) {
                        responseData =
                        {
                            "statusCode": 500,
                            "error": err.stack,
                            "message": "Error while uploading the file"
                        }
                        let jsonContent = JSON.stringify(responseData);
                        res.end(jsonContent);
                        return res;
                    }
                    else {
                        console.log('File read!');
                        fs.writeFile(process.env.PATH_FOR_UPLOAD + "/" + userid + ".png", data, function (err) {
                            if (err) {
                                responseData =
                                {
                                    "statusCode": 500,
                                    "error": err.stack,
                                    "message": "Error while uploading the file"
                                }
                                let jsonContent = JSON.stringify(responseData);
                                res.end(jsonContent);
                                return res;
                            }
                            else {
                                let profilepicPath = "/images/" + userid + ".png";
                                //  let profilepicPath=req.ip+port+"/images/"+userName+".png";
                                console.log(profilepicPath);
                                let now = new Date();
                                let currentDateAndTime = date.format(now, 'DD-MM-YYYY HH:MM:SS');
                                // let query="update user_details set first_name=?,last_name=?,profile_pic=?,updated_on=? where id=?"; 
                                let query = allQuerys.updtaeUserDetailswithProfilePic;
                                connect.query(query, [firstName, lastName, profilepicPath, currentDateAndTime, id], async (err, result) => {
                                    console.log(query);
                                    if (err) {
                                        responseData =
                                        {
                                            "statusCode": 500,
                                            "error": err.stack,
                                            "message": "error while executing the query"
                                        }
                                        let jsonContent = JSON.stringify(responseData);
                                        res.end(jsonContent);
                                    }
                                    else {

                                        let responseData =
                                        {
                                            "statusCode": 200,
                                            "message": "User details updated successfully"
                                        };
                                        let jsonContent = JSON.stringify(responseData);
                                        res.end(jsonContent);
                                    }

                                })

                            }

                        });
                    }
                })
            }
            else {
                let responseData =
                {
                    "statusCode": 201,
                    "message": "Upload only jpg,jpeg,png format pictures only"
                };
                const jsonContent = JSON.stringify(responseData);
                res.status(201).end(jsonContent);
                return res;
            }
        })
    }
    catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            message = "Token expired please login again";
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        else {
            message = err.message;
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);


    }
})
app.delete(apiModules.userProfileUser, async (req, res) => {
    try {
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // console.log(token);
        var con = await Connection();
        var connect = con.connection;
        let id = req.query.id;
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        // var userId=req.query.UserId;
        // var userId=decoded.userid;
        // var roleId=decoded.roleid;
        console.log("the userid in access token " + userid);
        // let query="delete from user_details where id= ?";
        let query = allQuerys.deleteUserDetails;
        connect.query(query, [id], async (err, queryResults) => {
            if (err) {
                responseData =
                {
                    "statusCode": 500,
                    "error": err.stack,
                    // "message":"Error while executing the query"
                    "message": messages.QueryError
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
            }
            else {
                responseData =
                {
                    "statusCode": 200,
                    //  "message":"User details deleted successfully",
                    "message": messages.deleteUserdetailsSuccess
                };
                const jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
            }
        })
    }
    catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            message = "Token expired please login again";
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        else {
            message = err.message;
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);

    }

})
app.get(apiModules.userProfileUser, async (req, res) => {
    try {
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // console.log(token);
        // console.log(req.headers);
        // console.log("the ******************"+token);
        var con = await Connection();
        var connect = con.connection;
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        // console.log(decoded);
        // console.log(decoded.roleid+decoded.userid);
        // var roleId=decoded.roleid;
        // var userid=decoded.userid;
        console.log("the userid in access token " + userid);
        // let queryForAll="select id,user_id,first_name,last_name,profile_pic from user_details where user_id=?";
        let queryForAll = allQuerys.getUserDetails;
        connect.query(queryForAll, [userid], (err, result) => {
            if (err) {
                responseData =
                {
                    "statusCode": 500,
                    "error": err.stack,
                    // "message":"Error while executing the query"
                    "message": messages.QueryError
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent)

            }
            else {
                let responseData = "";
                if (result.length == 0) {
                    responseData =
                    {
                        "statusCode": 200,
                        // "message":"No user details found"
                        "message": messages.noUsers
                    }
                }
                else {
                    responseData =
                    {
                        "statusCode": 200,
                        //  "message":"Listing of user details succesfully",
                        "message": messages.ListOfUserSuccess,
                        "data": result
                    }
                }
                let jsonContent = JSON.stringify(responseData);
                res.end(jsonContent);
            }

        }
        )

    }
    catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            message = "Token expired please login again";
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        else {
            message = err.message;
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);

    }
})
app.delete(apiModules.deleteUserDetailsAdmin, async (req, res) => {
    try {
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // console.log(token);
        var con = await Connection();
        var connect = con.connection;
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        // var userId=req.query.UserId;
        // var userId=decoded.userid;
        // var roleId=decoded.roleid;
        if (roleId == 2) {
            let id = req.query.id;
            console.log("the userid in access token " + userId);
            // let query="delete users,user_details,projects from users inner join user_details inner join projects where users.id=user_details.user_id and user_details.user_id=projects.created_by and users.id=?";
            // let query="delete from users where id=?";
            let query = allQuerys.deleteUser;
            // let query1="delete from user_details where user_id=?";
            let query1 = allQuerys.deleteUserDetails;
            // let query2="delete from projects where created_by=?";
            let query2 = allQuerys.deleteProjectsBasedonCreatedby;
            connect.query(query, [id]);
            connect.query(query1, [id]);
            connect.query(query2, [id]);
            responseData =
            {
                "statusCode": 200,
                //  "message":"All user details deleted successfully",
                "message": messages.deleteallUserdetailsSuccess
            };
            const jsonContent = JSON.stringify(responseData);
            res.status(200).end(jsonContent);

            // connect.query(query,[id],async(err,queryResults)=>
            // {
            //     if(err)
            //     {
            //         responseData=
            //     {
            //         "statusCode" :500,
            //         "error": err.stack,
            //         "message":"Error while executing the query"
            //     }
            //     let jsonContent = JSON.stringify(responseData);
            //     res.end(jsonContent);
            //     }
            //     else{
            //         responseData=
            //         {
            //             "statusCode":200,
            //              "message":"All user details deleted successfully",
            //         };
            //         const jsonContent = JSON.stringify(responseData);
            //         res.status(200).end(jsonContent);
            //     }
            // })
        }
        else {
            responseData =
            {
                "statusCode": 404,
                //  "message":"Check the role id",
                "message": messages.checkRoleId
            };
            const jsonContent = JSON.stringify(responseData);
            res.end(jsonContent);
        }
    }
    catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            message = "Token expired please login again";
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        else {
            message = err.message;
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);

    }
})
app.delete(apiModules.deleteUserDetailsUser, async (req, res) => {
    try {
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // console.log(token);
        var con = await Connection();
        var connect = con.connection;
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        // var userId=req.query.UserId;
        // var userId=decoded.userid;
        // var roleId=decoded.roleid;
        if (roleId == 2) {
            let id = req.query.id;
            console.log("the userid in access token " + userId);
            // let query="delete users,user_details,projects from users inner join user_details inner join projects where users.id=user_details.user_id and user_details.user_id=projects.created_by and users.id=?";
            // let query="delete from users where id=?";
            let query = allQuerys.deleteUser;
            // let query1="delete from user_details where user_id=?";
            let query1 = allQuerys.deleteUserDetails;
            // let query2="delete from projects where created_by=?";
            let query2 = allQuerys.deleteProjectsBasedonCreatedby;
            connect.query(query, [id]);
            connect.query(query1, [id]);
            connect.query(query2, [id]);
            responseData =
            {
                "statusCode": 200,
                //  "message":"All user details deleted successfully",
                "message": messages.deleteallUserdetailsSuccess
            };
            const jsonContent = JSON.stringify(responseData);
            res.status(200).end(jsonContent);

            // connect.query(query,[id],async(err,queryResults)=>
            // {
            //     if(err)
            //     {
            //         responseData=
            //     {
            //         "statusCode" :500,
            //         "error": err.stack,
            //         "message":"Error while executing the query"
            //     }
            //     let jsonContent = JSON.stringify(responseData);
            //     res.end(jsonContent);
            //     }
            //     else{
            //         responseData=
            //         {
            //             "statusCode":200,
            //              "message":"All user details deleted successfully",
            //         };
            //         const jsonContent = JSON.stringify(responseData);
            //         res.status(200).end(jsonContent);
            //     }
            // })
        }
        else {
            responseData =
            {
                "statusCode": 404,
                //  "message":"Check the role id",
                "message": messages.checkRoleId
            };
            const jsonContent = JSON.stringify(responseData);
            res.end(jsonContent);
        }
    }
    catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            message = "Token expired please login again";
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        else {
            message = err.message;
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);

    }
})
app.post(apiModules.deletedProjectDetailsAdmin, async (req, res) => {
    try {
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        let data = req.body;
        console.log(data);
        let id = data.id;
        var con = await Connection();
        var connect = con.connection;
        let query = "insert into deleted_projects(id,project_name,project_version,created_by,created_on,updated_on)select id,project_name,project_version,created_by,created_on,updated_on from projects where created_by=?"
        connect.query(query, [id]);
        let responseData =
        {
            "statusCode": 200,
            //  "message":"Deleted projects inserted successfully",
            "message": messages.deletedProjectInsert
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(200).end(jsonContent);
    } catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            message = "Token expired please login again";
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        else {
            message = err.message;
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);
    }


})
app.post(apiModules.deletedProjectDetailsUser, async (req, res) => {
    try {
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        let data = req.body;
        console.log(data);
        let id = data.id;
        var con = await Connection();
        var connect = con.connection;
        let query = "insert into deleted_projects(id,project_name,project_version,created_by,created_on,updated_on)select id,project_name,project_version,created_by,created_on,updated_on from projects where created_by=?"
        connect.query(query, [id]);
        let responseData =
        {
            "statusCode": 200,
            //  "message":"Deleted projects inserted successfully",
            "message": messages.deletedProjectInsert
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(200).end(jsonContent);
    } catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            message = "Token expired please login again";
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        else {
            message = err.message;
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);
    }


})
app.get(apiModules.userCount, async (req, res) => {
    try {
        // var authorizationKey = req.headers['authorization'];
        // var token=authorizationKey.split(" ")[1];
        // var decoded = jwt.verify(token,accessTokenSecret,{algorithm: algorithm});
        // var con = await Connection();
        let adminrole = 1;
        let userrole = 2;
        // var connect = con.connection;
        // db = con.db;
        // connection = con.connection;
        // let query="select count(*) as count from users where role_id=?";
        let query = allQuerys.usersCount;
        // let adminCountresult=connect.query(query,[adminrole]);
        // let userCountresult=connect.query(query,[userrole]);
        connect.query(query, [adminrole], async function (err, result) {
            let adminCount = await result[0].count;
            // console.log(await result[0])
            connect.query(query, [userrole], async function (err, userCountresult) {
                let userCount = userCountresult[0].count;
                console.log(await result[0]);
                let totalCount = adminCount + userCount;
                let data = { "users": userCount, "admins": adminCount, "total": totalCount };
                let responseData =
                {
                    "statusCode": 200,
                    // "message":"Get the count users successfully",
                    "message": messages.GetCountSuccess,
                    "data": data
                };
                const jsonContent = JSON.stringify(responseData);
                res.status(200).end(jsonContent);

            })

        })
        // let adminCount=adminCountresult[0];
        // let userCount=userCountresult[0];
        // console.log(adminCountresult[0]);
        // let totalCount=userrole+userCount;
        // console.log(adminCount);
        // let data={"users":userCount,"admins":adminCount,"total":totalCount};
        // let responseData=
        //     {
        //         "statusCode":200,
        //          "message":"Get the count users successfully",
        //          "data":data
        //     };
        //     const jsonContent = JSON.stringify(responseData);
        //     res.status(200).end(jsonContent);   
    }
    catch (err) {
        let message = "";
        if (err.name == "TokenExpiredError") {
            message = "Token expired please login again";
        }
        else if (err.name == "JsonWebTokenError") {
            message = err.message;//please contact admin
        }
        else {
            message = err.message;
        }
        console.log(err);
        console.log(err.message);
        console.log(err.name);
        responseData =
        {
            "statusCode": 401,
            "message": message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);
    }
})
app.post(apiModules.sendUserinfo, async (req, res) => {
    try {
        cron.schedule('0 0 0 1 0', async function () {
            let emailId = req.data.emailId;
            excel.excel(userid, con.db, con.connection);
            let query1 = "select * from users where id=?";
            let query2 = "select * from user_details where user_id=?";
            const result = await con.db.query(con.connection, query1, [userid]);
            const result2 = await con.db.query(con.connection, query2, [userid]);
            let htmlContent =
                "<style>table, th, td {  border:1px solid black; }  </style>" +
                "<table>" +
                "<tr>" +
                "<th> role_id </th>" +
                "<th>user name </th>" +
                "<th>email_id</th>" +
                "<th>created_date_and_time </th>" +
                "<th>first_name</th>" +
                "<th>last_name </th>" +
                "<th>profile_pic </th>" +
                "</tr>" +
                "<tr>" +
                "<td>" + result[0].role_id + "</td>" +
                "<td>" + result[0].user_name + "</td>" +
                "<td>" + result[0].email_id + "</td>" +
                "<td>" + result[0].created_date_and_time + "</td>" +
                "<td>" + result2[0].first_name + "</td>" +
                "<td>" + result2[0].last_name + "</td>" +
                "<td>" + result2[0].profile_pic + "</td>" +
                "</tr>" +
                "</table>";
            console.log(htmlContent);
            let attachments = [{
                filename: 'userdata.xlsx',
                path: './userdata.xlsx'
            }];
            email.send365Email(process.env.EMAIL_ID, emailId, "User data", htmlContent, "User Data", attachments);
            let responseData =
            {
                "statusCode": 200,
                "message": messages.emailSend
            };
            const jsonContent = JSON.stringify(responseData);
            res.status(401).end(jsonContent);
            return res;
        })
    } catch (error) {
        let responseData =
        {
            "statusCode": 401,
            "message": message,
        };
        const jsonContent = JSON.stringify(responseData);
        res.status(401).end(jsonContent);
        return res;
    }

})
app.get(apiModules.sendUserinfo, async (req, res) => {
    let query = "update users set active=1";
    const result = await con.db.query(con.connection, query);
})
//

const port = process.env.PORT;
app.listen(process.env.PORT, () => {
    console.log("===================================");
    console.log(`Server running on port${process.env.PORT}`);
});
