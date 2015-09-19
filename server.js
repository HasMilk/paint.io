var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Canvas = require('canvas');

var uid = 0, users = [];

var canvas = new Canvas(500,500);
var ctx = canvas.getContext('2d');
ctx.lineJoin = "round";
ctx.lineCap = "round";

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {

    console.log('new user: ' + uid);
    socket.emit('uid', uid++);
    socket.emit('canvas', canvas.toBuffer());

    socket.on('message', function(e){ io.emit('message', save(e)); });
    socket.on('chat', function(e){ io.emit('chat', e); });

    socket.on('disconnect', function(){
    console.log('user disconnected');
    });
});

var save = function(e) {
    var u = e;
    var user = users[u.uid];
    if (user == undefined)
        user = u;

    if (!u.press) {
        ctx.beginPath();
        ctx.strokeStyle = user.color;
        ctx.lineWidth = user.size;
        ctx.moveTo(user.x, user.y);
        ctx.lineTo(u.x, u.y);
        ctx.stroke();
    }
    users[u.uid] = u;
    return e;
};

http.listen(3000, function(){
console.log('server listening on *:3000');
});