var Entity = require('./entity.js');
var config = require('./config');

// Slime constructor function
var Slime = function(map, x, y, gameContainer){
    var self = Entity();
    self.x = x;
    self.y = y;
    self.id = Math.random();
    self.maxhp = config.slime.maxHealth;
    self.hp = config.slime.maxHealth;
    self.range = config.slime.detectionRange;
    self.cooldown = config.slime.attackCooldown;
    self.toRemove = false;
    self.dx = config.slime.dimensions.width;
    self.dy = config.slime.dimensions.height;
    self.map = map;
    self.gameContainer = gameContainer;
    
    self.findMapNo(gameContainer.maps);
    
    self.targetPlayer = function(){
        var distance = self.range;
        var playerId = null;
        for(var i in self.gameContainer.players.list){
            if(self.getDistance(self.gameContainer.players.list[i]) < distance){
                distance = self.getDistance(self.gameContainer.players.list[i]);
                playerId = i;
            }
        }
        return playerId;
    }
    
    self.attackPlayer = function(playerId){
        var attackAngle = 1;
        if(self.gameContainer.players.list[playerId].x > self.x){
            self.spdX = config.slime.attackSpeed;
        }
        else {
            self.spdX = -config.slime.attackSpeed;
        }
        self.spdY = config.slime.jumpSpeed;
        cooldown = 0;
    }
    
    self.updatePos = function(){
        if(self.gameContainer.functions.isEmpty(self.mapNo, self.x, self.y + 1, config.slime.dimensions.width, config.slime.dimensions.height)){
            self.spdY += config.slime.gravityAcceleration;
        }
        else if(self.spdY > 0){
            self.spdY = 0;
            self.spdX = 0;
        }
        
        if(self.gameContainer.functions.isEmpty(self.mapNo, self.x, self.y + self.spdY, config.slime.dimensions.width, config.slime.dimensions.height)){
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
            hpMax:self.maxhp,
        }
    }
    
    for(var i in self.gameContainer.maps.list){
        if(self.gameContainer.maps.list[i].name == self.map){
            self.gameContainer.initPack.map[i].slime.push(self.getInitPack());
            Slime.list[self.id] = self;
        }
    }
    
    return self;
}

Slime.list = {};

Slime.update = function(mapNo, gameContainer){
    var slimePack = [];
    
    for(var i in Slime.list){
        if(Slime.list[i].map == gameContainer.maps.list[mapNo].name){
            slime = Slime.list[i];
            if(slime.cooldown >= 60 && slime.targetPlayer()){
                slime.attackPlayer(slime.targetPlayer());
                slime.cooldown = 0;
            }
            
            if(slime.cooldown < 60){
                slime.cooldown++;
            }
            slime.updatePos();
            
            for(var i in gameContainer.players.list){
                if(slime.isCollidingWith(gameContainer.players.list[i])){
                    gameContainer.players.list[i].hp -= config.slime.damage;    
                }            
            }
            
            for(var i in gameContainer.bullets.list){
                if(slime.isCollidingWith(gameContainer.bullets.list[i])){
                    slime.hp--;
                }
            }
            
            if(slime.hp <= 0){
                slime.toRemove = true;
            }
            
            if(slime.toRemove){
                gameContainer.removePack.map[mapNo].slime.push(slime.id);
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

module.exports = Slime;
