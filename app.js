var express = require('express');
var app = express();
var serv = require('http').Server(app);

// Import configuration
var config = require('./config');

app.get('/',function(req, res){
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

serv.listen(config.server.port);
console.log("Server started on port", config.server.port);

var SOCKET_LIST = {};

var Entity = require('./entity.js')

// Import Player class from separate file
var Player = require('./serverPlayer.js');

// Import Bullet class from new separate file
var Bullet = require('./bullet.js');

// Import Slime class from separate file
var Slime = require('./slime.js');

var Map = function(data){
	var self = {};
	self.id = data.id;
	self.name = data.map;
	self.obstacles = data.obstacles;
	self.monsters = data.monsters;
	
	Map.list[self.id] = self;
	return self;

}

Map.list = {};

// Create maps from configuration
for (const [mapName, mapData] of Object.entries(config.maps)) {
    Map({
        id: mapData.id,
        map: mapName,
        obstacles: mapData.obstacles,
        monsters: []
    });
}

var Obstacle = function(param){
    var self = Entity();
    self.x = param.x;
    self.y = param.y;
    self.dx = param.dx;
    self.dy = param.dy;
    self.img = param.img;
    self.id = param.id;
    self.map = param.mapNo;
    
    Map.list[self.map].obstacles[self.id] = self;
    return self;
}

Obstacle.list = {};

Obstacle.getObstacles = function(mapNo){
    var obstacles = [];
    for(var i in Map.list[mapNo].obstacles){
        obstacles.push(Map.list[mapNo].obstacles[i]);
    }
    return obstacles;
}

var isEmpty = function(mapNo,x,y,dx,dy){

	for(var i in Map.list[mapNo].obstacles){
		obstacle = Map.list[mapNo].obstacles[i];
		if(x + dx > obstacle.x && x < obstacle.x + obstacle.dx && y + dy > obstacle.y && y < obstacle.y + obstacle.dy)
			return false;
	}
	return true;
}

var DEBUG = config.server.debug;

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
    console.log('socket connection');
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
    
    socket.on('signIn', function(data){
        Player.onConnect(Map, socket, data.username, Bullet, Slime, Obstacle, isEmpty, initPack);
        socket.emit('signInResponse',{success:true});
    });
    
    socket.on('disconnect', function(){
        Player.onDisconnect(socket);
        delete SOCKET_LIST[socket.id];
    });
    
    socket.on('sendMsgToServer', function(data){
        var playerName = ("" + Player.list[socket.id].name);
        for(var i in SOCKET_LIST){
            SOCKET_LIST[i].emit('addToChat', playerName + ': ' + data);
        }
    });
    
    socket.on('evalServer', function(data){
        if(!DEBUG)
            return;

        if(data == "spawnSlime"){
            // Spawn slime from config
            Slime("test", config.maps["test"].defaultSlimes[0].x, config.maps["test"].defaultSlimes[0].y, Map, Player, Bullet, isEmpty, initPack);
            return;
        }
        var res = eval(data);
        console.log(res);
        socket.emit('evalAnswer',res);
    });
});

var initPack = {map:[]};
var removePack = {map:[]};

for(var i in Map.list){
    initPack.map[i] = {player:[], bullet:[], obstacle:[], slime:[]};
    removePack.map[i] = {player:[], bullet:[], slime:[]};
}

// Spawn default slimes for each map
for (const [mapName, mapData] of Object.entries(config.maps)) {
    for (const slimeData of mapData.defaultSlimes) {
        Slime(mapName, slimeData.x, slimeData.y, Map, Player, isEmpty, initPack);
    }
}

setInterval(function(){
    var pack = {map:[]};
    for(var i in Map.list){
        pack.map[i] = {
            player:Player.update(i, Map, Bullet),
            bullet:Bullet.update(i, Map, removePack),
            slime:Slime.update(i, Map, Player, Bullet, removePack),
        }
    }

    for(var i in SOCKET_LIST){
        for(var n in Map.list){
            if(Player.list[i] && Map.list[n].name == Player.list[i].map){
                var socket = SOCKET_LIST[i];
                socket.emit('init', initPack.map[n]);
                socket.emit('update', pack.map[n]);
                socket.emit('remove', removePack.map[n]);
            }
        }
    }
    
    for(var i in Map.list){
        initPack.map[i] = {player:[], bullet:[], obstacle:[], slime:[]};
        removePack.map[i] = {player:[], bullet:[], slime:[]};
    }
}, config.server.updateInterval);
