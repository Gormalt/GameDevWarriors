var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res){
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

serv.listen(8000);
console.log("Server started.");

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

Map({
    id:2,
    map:"test",
    obstacles:[
        {
            img:0,
            x:-600, 
            y:10, 
            dx:2000, 
            dy:600,
            id:2
        },
        {
            img:0,
            x:100, 
            y:-60, 
            dx:20, 
            dy:20,
            id:1
        },
        {
            img:0,
            x:120, 
            y:-260, 
            dx:50, 
            dy:50,
            id:3
        }
    ],
    monsters:[]
});

Map({id:5,map:"Dev",obstacles:[],monsters:[]});

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

var DEBUG = true;

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
            Slime("test", 900, -200, Map, Player, Bullet, isEmpty, initPack);
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


Slime("test", 900, -200, Map, Player, Bullet, isEmpty, initPack);

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
}, 1000/25);
