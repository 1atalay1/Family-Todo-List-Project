import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const PORT=3000;
const app=express();
var users=[];
var isRequestRemove=false;

var current_member_id; 

const db=new pg.Client({
    user:"postgres",
    host:"localhost",
    database:"todo",
    password:"osman123",
    port:5432,
  });
  
  db.connect();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

async function loadUsers(){
    var query= await db.query("SELECT * FROM member");
    users=query.rows;
}


async function getTotalUsers(){
    var query=await db.query("SELECT COUNT(id) FROM member");
    var totalMember=parseInt(query.rows[0].count);
    return totalMember;
}



app.listen(PORT,()=>{
    console.log("Port is running");
})


app.get("/", async (req,res)=>{
        await loadUsers();
        var size=await getTotalUsers();
        var deleteBtnExist= (size===0)? false:true;
        res.render("index.ejs",{user:users,deletebtn:deleteBtnExist});
});


app.get("/newUser",(req,res)=>{
        res.render("add.ejs");
});


app.post("/addUser",async(req,res)=>{
        const i_member_name=req.body.name;
        if(i_member_name.length>0){
            await db.query("INSERT INTO member (name) values($1)",[i_member_name]);
        }
        res.redirect("/");

});

app.get("/getUser",async(req,res)=>{
    var query=await db.query("SELECT * FROM member where id=$1",[current_member_id]);
    var data=query.rows;
    if(data.length>0){
        var member_name=data[0].name;
    var todayTodo=[];
    var weekTodo=[];
    var monthTodo=[];
    query=await db.query("SELECT id,title FROM list where member_id=$1 and duration='Today';",[current_member_id]);
    todayTodo=query.rows;
    query=await db.query("SELECT id,title FROM list where member_id=$1 and duration='Week';",[current_member_id]);
    weekTodo=query.rows;
    query=await db.query("SELECT id,title FROM list where member_id=$1 and duration='Month';",[current_member_id]);
    monthTodo=query.rows;
    res.render("list.ejs",{
     todayTodo:todayTodo,
     weekTodo:weekTodo,
     monthTodo:monthTodo,
     week:"Week",
     month:"Month",
     today:"Today",
     name:member_name});
    }
});
app.post("/getUser",async(req,res)=>{
        current_member_id=parseInt(req.body.id);
       var query=await db.query("SELECT * FROM member where id=$1",[current_member_id]
       );
       var data=query.rows;
       var member_name=data[0].name;
       var todayTodo=[];
       var weekTodo=[];
       var monthTodo=[];
       query=await db.query("SELECT id,title FROM list where member_id=$1 and duration='Today';",[current_member_id]);
       todayTodo=query.rows;
       query=await db.query("SELECT id,title FROM list where member_id=$1 and duration='Week';",[current_member_id]);
       weekTodo=query.rows;
       query=await db.query("SELECT id,title FROM list where member_id=$1 and duration='Month';",[current_member_id]);
       monthTodo=query.rows;
       res.render("list.ejs",{
        todayTodo:todayTodo,
        weekTodo:weekTodo,
        monthTodo:monthTodo,
        week:"Week",
        month:"Month",
        today:"Today",
        name:member_name});
});


app.post("/addTodayTodo",async (req,res)=>{
    const i_user_todo=req.body.item;
    if(i_user_todo.length>0){
        try{
            var query=await db.query("INSERT INTO list (member_id,title,duration) values($1,$2,$3)",[current_member_id,i_user_todo,'Today']);
        }
        catch(err){
                res.status(500).json({message:err.message});
        }
    }
    res.redirect("/getUser");
});

app.post("/addWeekTodo",async(req,res)=>{
        const i_user_todo=req.body.item;
        if(i_user_todo.length>0){
            try{
                var query=await db.query("INSERT INTO list (member_id,title,duration) values($1,$2,$3)",[current_member_id,i_user_todo,'Week']);
            }
            catch(err){
                res.status(400).json({message:err.message});
            }
        }
        res.redirect("/getUser");

});

app.post("/addMonthTodo",async(req,res)=>{
    const i_user_todo=req.body.item;
        if(i_user_todo.length>0){
            try{
                var query=await db.query("INSERT INTO list (member_id,title,duration) values($1,$2,$3)",[current_member_id,i_user_todo,'Month']);
            }
            catch(err){
                res.status(400).json({message:err.message});
            }
        }
        res.redirect("/getUser");

});


app.post("/delete",async(req,res)=>{
        const i_title_id=parseInt(req.body.todoID);
        try{
            await db.query("DELETE FROM list where id=$1",[i_title_id]);
        }
        catch(err){
            res.status(500).json({message:err.message});
        }
        res.redirect("/getUser");
});


app.post("/edit",async (req,res)=>{
       const i_new_title=(req.body.updatedItemTitle);
       const i_title_id=req.body.todoID;
       if(i_new_title.length>0){
        try{
            await db.query("UPDATE list SET title=$1 where id=$2",[i_new_title,i_title_id]);
        }
        catch(error){
            res.status(500).json({message:error.message});
        }
       }
       res.redirect("/getUser");
        

});


app.get("/removeUser",async(req,res)=>{
        var pageTitle="Delete Member";
        var MemberArray=[];
        var query=await db.query("SELECT name FROM member");
        MemberArray=query.rows;
        res.render("add.ejs",{title:pageTitle,members:MemberArray});
});


app.post("/deleteUser",async(req,res)=>{
        const i_name=(req.body.select_user);
        const query=await db.query("SELECT id FROM member WHERE name=$1",[i_name]);
        var result=query.rows;
        var userID_delete=parseInt(result[0].id);
        await db.query("DELETE FROM list where member_id=$1",[userID_delete]);
        await db.query("DELETE FROM member where id=$1",[userID_delete]);
        res.redirect("/");

});


