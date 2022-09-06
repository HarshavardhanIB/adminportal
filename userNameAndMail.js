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
module.exports={
    emialIdcheck,checkUsrname,checkRole,getUserName
}