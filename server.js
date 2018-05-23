var express = require('express');
var socket = require('socket.io');

var app = express();

server = app.listen(3125);

io = socket(server);



var records = [];
for (let i = 0; i < 4; ++i){
  records[i] = [];
  for(let j = 0; j < 4; ++j){
    records[i][j] = [];
  }
}

io.on('connection', socket => {


  socket.on("sendMessage", message => {
    console.log(message);

    //archive
    var record = { sender: message.user, message: message.message};
    records[message.friend][message.user].push(record);
    records[message.user][message.friend].push(record);

    //send back to user
    var new_message = { userID: message.user, friendID: message.friend, record: record };
    io.emit("receiveMessage", new_message);

    //forward to friend
    var new_message2 = { userID: message.friend, friendID: message.user, record: record };
    io.emit("receiveMessage", new_message2);
  });

  socket.on("requestHistory", identity => {
    data = { userID: identity.user, friendID: identity.friend, history: records[identity.user][identity.friend] }
    io.emit("receiveHistory", data);
  })

});