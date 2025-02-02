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
    now2: Date,
    now3: Date
    //date: { type: Date, default: Date.now},
  },
  // { timestamps: true }
);
const Users = mongoose.model("Post", userSchema);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/not30', (req, res) => {
  res.sendFile(__dirname + '/not30.html');
});

app.get('/teacher', (req, res) => {
  res.sendFile(__dirname + '/teacher.html');
});


const onlineUsers = new Map();
const hiddenUsers = new Set();


io.on('connection', (socket) => {
  console.log('a user connected');
 
  /*socket.on("teacherName", (name2) => {
    io.emit("teacherName", (name2));
  });*/

  socket.on("nickname", (name) => {
 
    const u = { name };
    
    


   /*Users.remove({ name: '' }, function(err) {
       if(err) {
         console.log(err);
       } else {
         console.log("delete success.");
       }
    });*/





    Users.findOneAndUpdate({ name: name }, {}, { upsert: true, new: true }, (err, u) => {
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


     /* socket.on('change',() =>{
        socket.emit('change', buildEmitData(u));
      });*/

      


      socket.on('NoOpinions', () => {

        hiddenUsers.add(u.id);
      

        console.log(hiddenUsers);

        const timeout = function () {

          hiddenUsers.delete(u.id);

          console.log(hiddenUsers);
        };

        setTimeout(timeout, 30000);


        var now1 = new Date();
        console.log(name, 'btnclicked', now1);



        var savedata1 = new Users({

          'name': name,
          'now1': now1

        }).save(function (err, result) {
          if (err) throw err;
       });





        io.emit('NoOpinions', buildEmitData(u));

      });

     /* socket.on('ShowName30', () => {
        hiddenUsers.delete(u.id);

        io.emit('ShowName30', buildEmitData(u));
      })*/

    

      socket.on('ShowName', () => {

        hiddenUsers.delete(u.id);
        console.log(hiddenUsers);

        var now2 = new Date();
        console.log(name, 'btn2clicked', now2);

        var savedata2 = new Users({
          'name': name,
          'now2': now2
        }).save(function (err, result) {
          if (err) throw err;
        });



        io.emit('ShowName', buildEmitData(u));

      });

      socket.on('RedisplayAll', () => {
        hiddenUsers.clear();
        console.log(hiddenUsers);

        var now3 = new Date();
        console.log(name, 'btn3clicked', now3);

        var savedata3 = new Users({
          'name': name,
          'now3': now3
        }).save(function (err, result) {
          if (err) throw err;
        });

        io.emit('RedisplayAll', Array.from(onlineUsers.values()).map(buildEmitData));
        //io.emit("loggedInUsers", Array.from(onlineUsers.values()).map(buildEmitData));
      });


    });

    

    function buildEmitData(u) {
      return { id: u.id, name: u.name, hidden: hiddenUsers.has(u.id) };



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




