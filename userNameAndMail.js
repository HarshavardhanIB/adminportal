async function emialIdcheck(mailId,db,connection)
{   
   try{
    // var connection=dbConnection.connection;
    // const db = makeDb();
    // await db.connect(connection);    
    let emailQuery="select user_name from users where email_id ='"+mailId+"'";
    const result=await db.query(connection,emailQuery);
    console.log(result);
    console.log("&&&&&&&&&&&&&&&&&&&&&&&&&");
    if(result.length!=0)
    {
        return true;
    }
    // let result=await connection.query(emailQuery,async(err,result)=>
    // {
    //     console.log("6666666666666666");
    //     console.log(await result.length);
    //     if(await result.length!=0)
    //     {
    //     return true;
    //     }
    //     console.log("entered");
    //     return false;
    // });
    // if(result.length!=0)
    // {
    //     return true;
    // }
    // await db.close(connection);
    return false; 
}
catch(err)
{
    console.log(err.stack);
}
// finally {
//         await db.close(connection);
//     } 
}
async function checkUsrname(userName,db,connection)
{   
    try{
    let userNameQuery="select user_name from users where user_name='"+userName+"'";
    const result=await db.query(connection,userNameQuery);
    console.log(result);
    console.log("&&&&&&&&&&&&&&&&&&&&&&&&&");
    if(result.length!=0)
    {
        return true;
    }
    // let result=await connection.query(userNameQuery,async(err,result)=>
    // {   
    //     console.log("11111111111111111");
    //     console.log(await result.length);
    //     if(await result.length!=0)
    //     {
    //         console.log("the retuen value is ")
    //     return true;
    //     }
    //     console.log("entered");
    //     return true;
    // });
    // console.log("the resukt ");
    // console.log(result);
    // if(result.length!=0)
    // {
    //     return  true;
    // }
    return false;  
}
catch(err)
{
    console.log(err.stack);
}
// finally {
//     await db.close(connection);
// } 
}
async function checkmail(mailId)
{
    var email = mailId;
    console.log(email);
    var emailFilter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    console.log(emailFilter);
    console.log("email _______________");
    console.log(!emailFilter.test(email.value));
    if (!emailFilter.test(email.value)) 
    {
    return false;
    }
    else 
    {
        return true;
    }
}
async function checkRole(roleId,db,connection)
{   
    try{
    let roleQuery="select id from roles where id =?";
    const result=await db.query(connection,roleQuery,[roleId]);
    console.log(result);
        if(result.length==0)
    {
        return true;
    }

    return false;  
}
catch(err)
{
    console.log(err.stack);
}
 
}
async function getUserName(userId,db,connection)
{
try{
    let userNameQuery="select user_name from users where id=?";
    const result=await db.query(connection,userNameQuery,[userId]);
    console.log(result);
    return await result[0].user_name;
    }
catch(err)
{
    console.log(err.stack);
}
}
async function getNameAndprofile(userId,db,connection)
{   
    let data="";
    let queryforUserdetails ="select first_name,last_name,profile_pic from user_details where user_id=?"
    const result=await db.query(connection,queryforUserdetails,[userId]);
    console.log(result);
    if(await result.length==0)
    {
        data={"first_name":" ","last_name":" ","profile_pic":" "};
    }
    else{
        console.log("entered");
        data={"first_name":result[0].first_name,"last_name":result[0].last_name_name,"profile_pic":result[0].profilr_pic};
    }
    console.log(data);
    return await data;
}
async function checkUserDetails(userId,db,connection)
{   
    let data="";
    let queryforUserdetails ="select * from user_details where user_id=?"
    const result=await db.query(connection,queryforUserdetails,[userId]);
    console.log("2345"+result);
    console.log(result.length)
    return await result.length;
}
module.exports={
    emialIdcheck,checkUsrname,checkRole,getUserName,getNameAndprofile,checkUserDetails,checkmail
}