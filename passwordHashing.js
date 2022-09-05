const bcrypt = require('bcrypt');
function pass(password)
{
    const passwordHash = bcrypt.hashSync(password, 10);
    return passwordHash;
}
// const comparePassword = async (password, hash) => {
//     try {
//         return await bcrypt.compare(password, hash);
//     } catch (error) {
//         console.log(error);
//     }
//     return false;
// }
async function comparePassword(password,hash)
{
    try {
         return await bcrypt.compare(password, hash);
     } catch (error) {
        console.log(error);
    }
    return false;
}
// async function checkPassword(formPassword,dbPassword)
// {   
//     let result="";
//     // let hashformPassword=pass(formPassword);
//     const hashformPassword = bcrypt.hashSync(formPassword, 10);
//     // console.log(hashformPassword);
//     // console.log(dbPassword);
//     // // const validPassword = bcrypt.compare(hashformPassword, dbPassword );
//     // bcrypt.compare(formPassword, dbPassword,function(err,isMatch)
//     // {
        
//     //     if (isMatch) {
//     //         result ="valid password";
//     //         console.log("valid user");              
//     //     } 
//     //     else
//     //     {
//     //         result ="in valid password";
//     //         console.log("invalid");
//     //     }
//     //     console.log("responce"+ result);
//     //     // return promiseresult;     
//     //     return result;  
//     // }
//     // )
//     let valid=await bcrypt.compareSync(formPassword,dbPassword);
//     if(valid)
//     {
//         return "valid password";
//     }
//     else
//     {
//         return "invalid password"
//     }
//     console.log("the final result in hash is "+ validOrNot);
//     return valid;    
// }
// checkPassword.then
// (
//     function(result){return result}
// );


module.exports={
    pass,comparePassword
}
