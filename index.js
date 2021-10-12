const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const MONGODB_URL = "mongodb+srv://enshu:W6KkwVALBknt0CFN@enshu.l3808.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const mongoose = require("mongoose");
const { StringDecoder } = require('string_decoder');
mongoose.connect(MONGODB_URL);




const Users = mongoose.model("Post", { name: String });
//const Users = mongoose.model("Post", { name: String , id: String});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


const onlineUsers = new Map();


io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on("nickname", (name) => {
    //if (!name) name = "unknown" 

    
  
    
    const u = { name}; // 保存するデータ 
  
  

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
        io.emit('NoOpinions', buildEmitData(u));
      });

      socket.on('HaveOpinions' , () => {
        io.emit('HaveOpinions' , buildEmitData(u));
      });

      //socket.on('HaveOpinions2', () => {
        //io.emit('HaveOpinions2', buildEmitData(u));
      //});
      
    });



  

    function buildEmitData(u) {
      return { id: u.id, name: u.name };
     
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
app.listen(port);




//server.listen(3000, () => {
  //console.log('listening on *:3000');
//});

