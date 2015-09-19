(function() {

    window.requestAnimFrame = (function(){
        return window.requestAnimationFrame
            || window.webkitRequestAnimationFrame
            || window.mozRequestAnimationFrame
            || function( callback ){
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    var socket = io('http://54.153.150.115:3000/');
    var connected = false;
    var users = [];

    socket.on('uid', function(e){
        uid = e;
        name = 'User ' + uid;
        connected = true;
        $('#messages').append($('<li>').text("CONNECTED TO SERVER"));
    });
    socket.on('canvas', function(e){
        var blob = new Blob([e], {type: 'image/png'});
        var url = URL.createObjectURL(blob);
        var img = new Image;

        img.onload = function() {
            var ctx = document.getElementById("canvas").getContext('2d');
            ctx.drawImage(this, 0, 0);
            URL.revokeObjectURL(url);
        };
        img.src = url;
    });
    socket.on('message', function(e){
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
    });
    socket.on('chat', function(e){
        $('#messages').append($('<li>').text(e));
    });
    socket.on('disconnect', function () {
        connected = false;
        $('#messages').append($('<li>').text("DISCONNECTED FROM SERVER"));
    });

    $('#size').on('change', function(){ size = this.value; });
    $('#color').on('change', function(){ color = this.value; });
    $('form').on('submit', function(){
        var input = $('#chatinput');
        socket.emit('chat', name + ': ' + input.val());
        input.val('');
        return false;
    });

    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    var uid, name, color = "black", size = 3;
    var penDown = false;

    function send (o) {
        o.uid = uid;
        o.color = color;
        o.size = size;
        if (connected)
            socket.emit('message', o);
    }

    function positionWithE(e) {
        var o = $(canvas).offset();
        return {x: e.clientX-o.left, y: e.clientY-o.top };
    }

    function onMouseDown (e) {
        var p = positionWithE(e);
        p.press = true;
        penDown = true;
        send(p)
    }
    function onMouseUp (e) {
        if (penDown) {
            var p = positionWithE(e);
            penDown = false;
            send(p)
        }
    }
    function onMouseMove (e) {
        var p = positionWithE(e);
        if (penDown) {
            send(p)
        }
    }
    function onMouseLeave (e) {
        if (penDown) {
            var p = positionWithE(e);
            send(p)
        }
    }
    function onMouseEnter (e) {
        if (penDown) {
            var p = positionWithE(e);
            p.press = true;
            penDown = e.buttons != 0;
            send(p)
        }
    }

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("mouseenter", onMouseEnter);

    /*var dirty = false;
    function render () {
        if (!dirty) return;
        dirty = false;
        var w = canvas.width, h = canvas.height;
        var x, y, radius;

        ctx.fillStyle = "blue";
        ctx.font = "bold 10px Arial";
        ctx.fillText("mouse: " + p.x + "," + p.y, 0, 10);

        ctx.fillStyle = 'white';
        ctx.fillRect(0,0,w,h);

        // draw stuff

    }*/

    requestAnimFrame(function loop() {
        requestAnimFrame(loop);
        render();
    }, canvas);

})();