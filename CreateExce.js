const XLSX = require('xlsx');
const ExcelJS = require('exceljs');
const { Connection } = require('./DBConnection');
var fs = require('fs');
const date = require('date-and-time');
const allQuerys = require('./allQuerys');
async function excel(id, db, connection) {
    let query = "select * from users where id=?";
    let query2 = "select * from user_details where user_id=?";
    // var con=await Connection();
    // var connect=con.connection;
    const result = await db.query(connection, query, [id]);
    var result2 = await db.query(connection, query2, [id]);
    let excel_file = "./" + id + ".xlsx";
    if (!fs.existsSync(excel_file)) {
        var writeStream = fs.createWriteStream(excel_file);
        // var header="role_Id"+"\t"+" User_Name"+"\t"+"email_id"+"Created_On"+"\t"+" First_Name"+"\t"+"Last_Name"+"Profile_pic"+"\n";
        // writeStream.write(header);     
    }
    const file = XLSX.readFile(excel_file);

    let userData = [{
        role_Id: result[0].role_id,
        User_Name: result[0].user_name,
        email_id: result[0].email_id,
        Created_On: result[0].created_date_and_time,
        First_Name: result2[0].first_name,
        Last_Name: result2[0].last_name,
        Profile_pic: result2[0].profile_pic
    }];
    const ws = XLSX.utils.json_to_sheet(userData);
    XLSX.utils.book_append_sheet(file, ws);
    XLSX.writeFile(file, excel_file);
}
async function excelUsingEJ(id, db, connection) {
    console.log("excelUsingEJ entered");
    let now = new Date();
    let today = now.getDate();
    let previosmonth = now.getMonth() - 1;
    let year = now.getFullYear();
    let time = date.format(now, 'HH:MM:SS')
    let previousMonth = today + "-" + previosmonth + "-" + year + " " + time;
    let currentDateAndTime = date.format(now, 'DD-MM-YYYY HH:MM:SS');
    let query = allQuerys.MontlyUserdata;
    let result = await db.query(connection, query, [currentDateAndTime, previousMonth]);
    console.log(result);
    // const workbook = new ExcelJS.Workbook();
    // const sheet = workbook.addWorksheet('sheet');
    var workbook = XLSX.utils.book_new();
    var ws = workbook.Sheets["Sheet1"];
    var worksheet = XLSX.utils.aoa_to_sheet(ws,result);
    XLSX.writeFile(workbook, "./userdata.xlsb");
}
module.exports = {
    excel,excelUsingEJ
}