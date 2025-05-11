var Entity = require('./entity.js');

// Slime constructor function
var Slime = function(map, x, y, Map, Player, isEmpty, initPack){
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
    
    self.findMapNo(Map);
    
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
    
    return self;
}

Slime.list = {};

Slime.update = function(mapNo, Map, Player, Bullet, removePack){
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

module.exports = Slime;
