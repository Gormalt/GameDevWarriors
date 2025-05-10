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

var Entity = function(){
    var self = {
        map:0,
        x:0,
        y:0,
        dx:0,
        dy:0,
        spdX:0,
        spdY:0,
        id:"",
        mapNo:null,
    }
    
    self.findMapNo = function(){
        for(var i in Map.list){
            if(Map.list[i].name == self.map){
                self.mapNo = i;
            }
        }
    }
    
    self.update = function(){
        self.updatePosition();
    }
    
    self.updatePosition = function (){
        self.x += self.spdX;
        self.y += self.spdY;
    }
    
    self.getDistance = function(pt){
        return Math.sqrt(Math.pow(self.x - pt.x,2) + Math.pow(self.y - pt.y,2));
    }
    
    self.isCollidingWith = function(trgt){
        if(self.x + self.dx > trgt.x && self.x < trgt.x + trgt.dx && self.y + self.dy > trgt.y && self.y < trgt.y + trgt.dy){
            return true;
        }
        return false;
    }
    
    return self;
}

var Slime = function(map, x, y){
    var self = Entity();
    self.x = x;
    self.y = y;
    self.id = Math.random();
    self.maxhp = 10;
    self.hp = 10;
    self.range = 250;
    self.cooldown = 4000;
    self.toRemove = false;
    self.dx = 50;
    self.dy = 50;
    self.map = map;
    
    self.findMapNo();
    
    self.targetPlayer = function(){
        var distance = self.range;
        var playerId = null;
        for(var i in Player.list){
            if(self.getDistance(Player.list[i]) < distance){
                distance = self.getDistance(Player.list[i]);
                playerId = i;
            }
        }
        return playerId;
    }
    
    self.attackPlayer = function(playerId){
        var attackAngle = 1;
        if(Player.list[playerId].x > self.x){
            self.spdX = 10;
        }
        else {
            self.spdX = -10;
        }
        self.spdY = -10;
        cooldown = 0;
    }
    
    self.updatePos = function(){
        if(isEmpty(self.mapNo, self.x, self.y + 1, 50, 50)){
            self.spdY++;
        }
        else if(self.spdY > 0){
            self.spdY = 0;
            self.spdX = 0;
        }
        
        if(isEmpty(self.mapNo, self.x, self.y + self.spdY, 50, 50)){
            self.y += self.spdY;
        }
        else{
            self.spdY = 0;
        }
        
        self.x += self.spdX;
    }
    
    self.getInitPack = function(){
        return{
            id:self.id,
            x:self.x,
            y:self.y,
            hp:self.hp,
            dx:self.dx,
            dy:self.dy,
            hpMax:self.hpMax,
        }
    }
    
    for(var i in Map.list){
        if(Map.list[i].name == self.map){
            initPack.map[i].slime.push(self.getInitPack());
            Slime.list[self.id] = self;
        }
    }
}

Slime.list = {};

Slime.update = function(mapNo){
    var slimePack = [];
    
    for(var i in Slime.list){
        if(Slime.list[i].map == Map.list[mapNo].name){
            slime = Slime.list[i];
            if(slime.cooldown >= 60 && slime.targetPlayer()){
                slime.attackPlayer(slime.targetPlayer());
                slime.cooldown = 0;
            }
            
            if(slime.cooldown < 60){
                slime.cooldown++;
            }
            slime.updatePos();
            
            for(var i in Player.list){
                if(slime.isCollidingWith(Player.list[i])){
                    Player.list[i].hp--;    
                }            
            }
            
            for(var i in Bullet.list){
                if(slime.isCollidingWith(Bullet.list[i])){
                    slime.hp--;
                }
            }
            
            if(slime.hp <= 0){
                slime.toRemove = true;
            }
            
            if(slime.toRemove){
                removePack.map[mapNo].slime.push(slime.id);
                delete Slime.list[slime.id];
            }
            else{
                slimePack.push(slime);
            }
        }
    }
    return slimePack;
}

Slime.getAllInitPack = function(mapNo){
    var slime = [];
    for (var i in Slime.list){
        if(Slime.list[i].mapNo = mapNo){
            slime.push(Slime.list[i].getInitPack());
        }
    }
    return slime;
}

// Import Player class from separate file
var Player = require('./serverPlayer.js');

var Bullet = function(parent, angle){
    var self = Entity();
    self.id = Math.random();
    self.spdX = Math.cos(angle/180*Math.PI)* 10;
    self.spdY = Math.sin(angle/180*Math.PI)* 10;
    self.parent = parent;
    self.timer = 0;
    self.dx = 20;
    self.dy = 20;
    self.toRemove = false;
    self.map = Player.list[parent].map;
    self.mapNo = Player.list[parent].mapNo;
    
    self.update = function(){
        if(self.timer++ > 100)
            self.toRemove = true;
        self.updatePosition();
        
        for(var i in Player.list){
            var p = Player.list[i];
            if(self.getDistance(p) < 32 && self.parent !== p.id){
                self.toRemove = true;
                p.hp -= 1;

                if(p.hp <= 0) {
                    var shooter = Player.list[self.parent];
                    if(shooter)
                        shooter.score += 1;
                    p.hp = p.hpMax;
                    p.x = Math.random() * 500;
                }
            }
        }
    }
    
    self.getInitPack = function(){
        return{
            id:self.id,
            x:self.x,
            y:self.y,
        };
    }
    
    self.getUpdatePack = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,
        }
    }
    
    Bullet.list[self.id] = self;
    for(var i in Map.list){
        if(Map.list[i].name == self.map){
            initPack.map[i].bullet.push(self.getInitPack());
        }
    }
    return self;
}

Bullet.list = {};

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

var getObstacles = function(mapNo){
    var obstacles = [];
    for(var i in Map.list[mapNo].obstacles){
        obstacles.push(Map.list[mapNo].obstacles[i]);
    }
    return obstacles;
}

Bullet.getAllInitPack = function(mapNo){
    var bullets = [];
    for (var i in Bullet.list){
        if(Bullet.list[i].mapNo = mapNo){
            bullets.push(Bullet.list[i].getInitPack());
        }
    }
    return bullets
}

Bullet.update = function(mapNo){
    var pack = [];
    for(var i in Bullet.list){
        if(Bullet.list[i].map == Map.list[mapNo].name){
            var bullet = Bullet.list[i];
            bullet.update();
            if(bullet.toRemove){
                delete Bullet.list[i];
                removePack.map[mapNo].bullet.push(bullet.id);
            }
            else
                pack.push(bullet.getUpdatePack());
        }
    }
    return pack;
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
        Player.onConnect(socket, data.username);
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
            Slime("test", 900, -200);
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

Slime("test", 900, -200);

setInterval(function(){
    var pack = {map:[]};
    for(var i in Map.list){
        pack.map[i] = {
            player:Player.update(i),
            bullet:Bullet.update(i),
            slime:Slime.update(i),
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
