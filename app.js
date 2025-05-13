var express = require('express');
var app = express();
var serv = require('http').Server(app);

// Import configuration and GameContainer
var config = require('./config');
var GameContainer = require('./gameContainer');

app.get('/',function(req, res){
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

serv.listen(config.server.port);
console.log("Server started on port", config.server.port);

var SOCKET_LIST = {};

// Import game classes
var Player = require('./serverPlayer.js');
var Bullet = require('./bullet.js');
var Slime = require('./slime.js');
var { Map, Obstacle, isEmpty } = require('./map.js');

// Create game container and initialize with all dependencies
var gameContainer = GameContainer();
gameContainer.initialize(Player, Bullet, Slime, Map, Obstacle, isEmpty);

var DEBUG = config.server.debug;

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
    console.log('socket connection');
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
    
    socket.on('signIn', function(data){
        gameContainer.onPlayerConnect(socket, data.username);
        socket.emit('signInResponse',{success:true});
    });
    
    socket.on('disconnect', function(){
        gameContainer.onPlayerDisconnect(socket);
        delete SOCKET_LIST[socket.id];
    });
    
    socket.on('sendMsgToServer', function(data){
        var playerName = ("" + gameContainer.players.list[socket.id].name);
        for(var i in SOCKET_LIST){
            SOCKET_LIST[i].emit('addToChat', playerName + ': ' + data);
        }
    });
    
    socket.on('evalServer', function(data){
        if(!DEBUG)
            return;
        gameContainer.handleDebugCommand(data, socket);
    });
});

// Game loop
setInterval(function(){
    // Update all game systems through the container
    var pack = gameContainer.update();

    // Send updates to all clients
    for(var i in SOCKET_LIST){
        for(var n in Map.list){
            if(gameContainer.players.list[i] && Map.list[n].name == gameContainer.players.list[i].map){
                var socket = SOCKET_LIST[i];
                socket.emit('init', gameContainer.initPack.map[n]);
                socket.emit('update', pack.map[n]);
                socket.emit('remove', gameContainer.removePack.map[n]);
            }
        }
    }
    
    // Reset packs after sending
    gameContainer.resetPacks();
}, config.server.updateInterval);
