var Entity = require('./entity.js');
var config = require('./config');

var Player = function(id, username, gameContainer){
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
    self.maxSpd = config.player.maxSpeed;
    self.hp = config.player.maxHealth;
    self.hpMax = config.player.maxHealth;
    self.score = 0;
    self.jumpSpd = config.player.jumpSpeed;
    self.y = config.player.spawnY;
    self.dx = config.player.dimensions.width;
    self.dy = config.player.dimensions.height;
    self.cx = self.x+(self.dx/2);
    self.cy = self.y+(self.dy/2);
    self.canJump = false;
    self.gameContainer = gameContainer;

    self.update = function(){
        if(self.hp <= 0){
            self.hp = self.hpMax;
            self.x = config.player.respawnX;
        }
        self.updateSpd();
        self.updatePos();
        
        if(self.pressingAttack){
            self.shootBullet(self.mouseAngle);
        }
    }

    self.shootBullet = function(angle){
        var b = self.gameContainer.bullets(self.id, angle, self.gameContainer);
        b.x = self.cx;
        b.y = self.cy;
    }

    self.updatePos = function(){
        if(self.gameContainer.functions.isEmpty(self.mapNo, self.x + self.spdX, self.y, self.dx, self.dy)){
            self.x += self.spdX;
        }
        else if(self.spdX > 0){
            while(!self.gameContainer.functions.isEmpty(self.mapNo, self.x + self.spdX, self.y,self.dx,self.dy) && self.spdX > 0){
                self.spdX--;
            }
            self.x += self.spdX;
            self.canJump = true;
        }
        else if(self.spdX < 0){
            while(!self.gameContainer.functions.isEmpty(self.mapNo, self.x + self.spdX, self.y, self.dx, self.dy) && self.spdX < 0){
                self.spdX++;
            }
            self.x += self.spdX;
            self.canJump = true;
        }
        else{
            self.canJump = true;
            self.spdX = 0;
        }
        
        if(self.gameContainer.functions.isEmpty(self.mapNo, self.x, self.y + self.spdY, self.dx, self.dy)){
            self.y += self.spdY;
        }
        else if(self.spdY > 0){
            while(!self.gameContainer.functions.isEmpty(self.mapNo, self.x, self.y + self.spdY, self.dx, self.dy) && self.spdY > 0){
                self.spdY--;
            }
            self.y += self.spdY;
            self.canJump = true;
        }
        else if(self.spdY < 0){
            while(!self.gameContainer.functions.isEmpty(self.mapNo, self.x, self.y + self.spdY, self.dx, self.dy) && self.spdY < 0){
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
        
        if(self.gameContainer.functions.isEmpty(self.mapNo, self.x, self.y + self.spdY + 1, self.dx, self.dy)){
            self.spdY++;
        }
        else if(!self.gameContainer.functions.isEmpty(self.mapNo, self.x, self.y + self.spdY, self.dx, self.dy)){
            while(!self.gameContainer.functions.isEmpty(self.mapNo, self.x, self.y + self.spdY, self.dx, self.dy) && self.spdY > 0){
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
        for(var i in self.gameContainer.maps.list){
            if(self.gameContainer.maps.list[i].name == self.map){
                self.gameContainer.initPack.map[i].player.push(self.getInitPack());
            }    
        }
    }    
    
    return self;
}

Player.list = {};

Player.getAllInitPack = function(mapNo){
    var player = [];
    for (var i in Player.list){
        if(Player.list[i].mapNo == mapNo){
            player.push(Player.list[i].getInitPack());
        }
    }
    return player;
}

Player.update = function(mapNo, gameContainer){
    var pack = [];
    for(var i in Player.list){
        if(Player.list[i].map == gameContainer.maps.list[mapNo].name){
            var player = Player.list[i];
            player.update();
            pack.push(player.getUpdatePack());    
        }
    }
    return pack;
}

module.exports = Player;
