var Entity = require('./entity.js')

var Player = function(id, username, isEmpty){
    var self = Entity();
    self.id = id;
    self.name = username;
    self.number = "" + Math.floor(10 * Math.random());
    self.selfpressingRight = false;
    self.pressingLeft = false;
    self.pressingUp = false;
    self.pressingDown = false;
    self.pressingAttack = false;
    self.pressingJump = false;
    self.mouseAngle = 0;
    self.maxSpd = 10;
    self.hp = 10;
    self.hpMax = 10;
    self.score = 0;
    self.jumpSpd = 13;
    self.y = -80;
    self.dx = 80;
    self.dy = 80;
    self.cx = self.x+(self.dx/2)
    self.cy = self.y+(self.dy/2)
    self.canJump = false;
    self.isEmpty = isEmpty;

    self.update = function(Bullet){
        if(self.hp <= 0){
            self.hp = self.hpMax;
            self.x = 20;
        }
        self.updateSpd();
        self.updatePos();
        
        if(self.pressingAttack){
            self.shootBullet(self.mouseAngle, Bullet);
        }
    }

    self.shootBullet = function(angle, Bullet){
        var b = Bullet(self.id,angle);
        b.x = self.cx;
        b.y = self.cy;
    }

    self.updatePos = function(){
        if(self.isEmpty(self.mapNo, self.x + self.spdX, self.y, self.dx, self.dy)){
            self.x += self.spdX;
        }
        else if(self.spdX > 0){
            while(!self.isEmpty(self.mapNo, self.x + self.spdX, self.y,self.dx,self.dy) && self.spdX > 0){
                self.spdX--;
            }
            self.x += self.spdX;
            self.canJump = true;
        }
        else if(self.spdX < 0){
            while(!self.isEmpty(self.mapNo, self.x + self.spdX, self.y, self.dx, self.dy) && self.spdX < 0){
                self.spdX++;
            }
            self.x += self.spdX;
            self.canJump = true;
        }
        else{
            self.canJump = true;
            self.spdX = 0;
        }
        
        if(self.isEmpty(self.mapNo, self.x, self.y + self.spdY, self.dx, self.dy)){
            self.y += self.spdY;
        }
        else if(self.spdY > 0){
            while(!self.isEmpty(self.mapNo, self.x, self.y + self.spdY, self.dx, self.dy) && self.spdY > 0){
                self.spdY--;
            }
            self.y += self.spdY;
            self.canJump = true;
        }
        else if(self.spdY < 0){
            while(!self.isEmpty(self.mapNo, self.x, self.y + self.spdY, self.dx, self.dy) && self.spdY < 0){
                self.spdY++;
            }
            self.y += self.spdY;
            self.canJump = true;
        }
        else{
            self.canJump = true;
            self.spdY = 0;
        }
        
        self.cx = self.x + (self.dx/2);
        self.cy = self.y + (self.dy/2);
    }

    self.updateSpd = function(){
        if(self.pressingRight)
            self.spdX = self.maxSpd;
        else if(self.pressingLeft)
            self.spdX = -self.maxSpd;
        else
            self.spdX = 0;
        
        if(self.pressingUp && self.canJump == true){
            self.spdY = -self.jumpSpd;
            self.canJump = false;
        }
        else if(self.pressingDown)
            self.spdY = +self.jumpSpd;
        
        if(self.isEmpty(self.mapNo, self.x, self.y + self.spdY + 1, self.dx, self.dy)){
            self.spdY++;
        }
        else if(!self.isEmpty(self.mapNo, self.x, self.y + self.spdY, self.dx, self.dy)){
            while(!self.isEmpty(self.mapNo, self.x, self.y + self.spdY, self.dx, self.dy) && self.spdY > 0){
                self.spdY--;
            }
            self.canJump = true;
        }    
    }
    
    self.getInitPack = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            number:self.number,
            hp:self.hp,
            hpMax:self.hpMax,
            score:self.score,
            name:self.name,
            dx: self.dx,
            dy: self.dy,
        };
    }
    
    self.getUpdatePack = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            hp:self.hp,
            score:self.score,
        }
    }
    
    Player.list[id] = self;
    
    self.init = function(){
        for(var i in Map.list){
            if(Map.list[i].name == self.map){
                initPack.map[i].player.push(self.getInitPack());
            }    
        }
    }    
    
    return self;
}

Player.list = {};

Player.onConnect = function(Map, socket, username, Bullet, Slime, Obstacle, isEmpty){
    var player = Player(socket.id, username, isEmpty);
    player.map = "test";
    
    if(player.name == 'bob'){
        player.map = "Dev";
    }

    player.findMapNo(Map);
    player.init();

    socket.on('keyPress', function(data){
        if(data.inputId === 'left')
            player.pressingLeft = data.state;
        else if(data.inputId === 'right')
            player.pressingRight = data.state;
        else if(data.inputId === 'up')
            player.pressingUp = data.state;
        else if(data.inputId === 'down')
            player.pressingDown = data.state;
        else if(data.inputId === 'attack')
            player.pressingAttack = data.state;
        else if (data.inputId === 'mouseAngle')
            player.mouseAngle = data.state;
    });

    socket.emit('init',{
        selfId:socket.id,
        player:Player.getAllInitPack(Player.list[socket.id].mapNo),
        bullet:Bullet.getAllInitPack(Player.list[socket.id].mapNo),
        slime:Slime.getAllInitPack(Player.list[socket.id].mapNo),
        obstacle:Obstacle.getObstacles(Player.list[socket.id].mapNo),
    });
}

Player.getAllInitPack = function(mapNo){
    var player = [];
    for (var i in Player.list){
        if(Player.list[i].mapNo == mapNo){
            player.push(Player.list[i].getInitPack());
        }
    }
    return player;
}

Player.onDisconnect = function(socket){
    for(var i in Map.list){
        if(Player.list[socket.id] && Map.list[i].name == Player.list[socket.id].map){
            removePack.map[i].player.push(socket.id);
        }
    }
    delete Player.list[socket.id];
}

Player.update = function(mapNo, Map, Bullet){
    var pack = [];
    for(var i in Player.list){
        if(Player.list[i].map == Map.list[mapNo].name){
            var player = Player.list[i];
            player.update(Bullet);
            pack.push(player.getUpdatePack());    
        }
    }
    return pack;
}

module.exports = Player;
