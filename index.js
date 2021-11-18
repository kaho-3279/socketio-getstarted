const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

//const MONGODB_URL = "mongodb+srv://enshu:W6KkwVALBknt0CFN@enshu.l3808.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const MONGODB_URL = "mongodb+srv://np-button:2kj2U2IuXOkyf1m6@cluster0.yq1d5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const mongoose = require("mongoose");
mongoose.connect(MONGODB_URL, { useNewUrlParser: true });
const { StringDecoder } = require('string_decoder');
//mongoose.connect(MONGODB_URL);




//const Users = mongoose.model("Post", { name: String });
const userSchema = mongoose.Schema(
  {
    name: String,
    now1: Date,
    now2: Date
    //date: { type: Date, default: Date.now},
  },
 // { timestamps: true }
);
const Users = mongoose.model("Post", userSchema);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


const onlineUsers = new Map();


io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on("nickname", (name) => {
    //if (!name) name = "unknown" 

    
    const u = { name};
    //const u = { name, now};

   /* Users.remove({ name: 'おかもと' }, function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("delete success.");
      }
   });*/


  
  

    Users.findOneAndUpdate({ name: name },{}, { upsert: true, new: true }, (err, u) => {
      onlineUsers.set(u.id, u);
      console.log(onlineUsers);
      io.emit("loggedInUsers", Array.from(onlineUsers.values()).map(buildEmitData));
      socket.emit("namelist", u);

      socket.on('disconnect', () => {
        onlineUsers.delete(u.id);
        console.log('user disconnected');
        console.log(onlineUsers);
  
       
        io.emit("loggedInUsers", Array.from(onlineUsers.values()).map(buildEmitData));
      
      });


      socket.on('NoOpinions' , () => {

        //Users.create(u);
        var now1 = new Date();
        console.log(name, 'btnclicked', now1);


        //  Users.updateOne({ 'name': name }, {'$set':{'now1': now1}},function(err) {
         // if(err) {
           // console.log(err);
          //} else {
            //console.log("update success.");
         // }
       //});


        var savedata1 = new Users({
         
          'name': name,
          'now1' : now1
            
        }).save(function(err,result){
          if (err) throw err;

        
        });


        //onlineUsers.set(u.id, now);
        //console.log(onlineUsers);


        io.emit('NoOpinions', buildEmitData(u));
      });


      socket.on('ShowName' , () => {

       // Users.create(u);

       var now2 = new Date();
        console.log(name, 'btn2clicked', now2);

        var savedata2 = new Users({
          'name': name,
          'now2' : now2
        }).save(function(err,result){
          if (err) throw err;
        });

       /* Users.updateOne({ 'name': name }, {'$set':{'now2': now2}},function(err) {
          if(err) {
            console.log(err);
          } else {
            console.log("update success.");
          }
       });*/

        io.emit('ShowName' , buildEmitData(u));

      });

     
      
      
    });
  

    function buildEmitData(u) {
      return { id: u.id, name: u.name };
     //return { id: u.id, name: u.name, now: u.Date };
     
    }



    Users.find({}).exec((err, users) => {
      if (users) {
        users.forEach(u => {
          const data = { id: u.id, name: u.name };
          socket.emit('namelist', buildEmitData(u))
        });
      }

    });



  });

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
server.listen(port);




//server.listen(3000, () => {
  //console.log('listening on *:3000');
//});

