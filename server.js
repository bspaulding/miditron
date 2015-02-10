var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var midi = require("midi");

var input = new midi.input();
var midiPortNames = [];
for (var i = 0; i < input.getPortCount(); i += 1) {
  midiPortNames[i] = input.getPortName(i);
}

app.use(express.static(__dirname + '/public'));
app.use('/js', express.static(__dirname + '/node_modules'));

app.get('/ports.json', function(req, res) {
  res.send(JSON.stringify(midiPortNames));
});

var midiPortOpened = false;
io.on('connection', function(socket) {
  socket.on('connectToPort', function(port) {
    var portNum = parseInt(port, 10);
    console.log('client wants to connect to port ' + portNum + ': ' + midiPortNames[portNum]);
    if (midiPortOpened) {
      input.closePort();
    }
    input.openPort(portNum);
    midiPortOpened = true;
    socket.emit('connectedToPort', portNum);
    input.on('message', function(deltaTime, message) {
      socket.emit('midiMessage', { deltaTime: deltaTime, message: message });
    });
  });
});

http.listen(3000, function() {
  console.log('listening on port 3000');
});
