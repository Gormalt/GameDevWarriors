var Entity = require('./entity.js');
var config = require('./config');

// Bullet constructor function
var Bullet = function(parent, angle, gameContainer){
    var self = Entity();
    self.id = Math.random();
    self.spdX = Math.cos(angle/180*Math.PI)* config.bullet.speed;
    self.spdY = Math.sin(angle/180*Math.PI)* config.bullet.speed;
    self.parent = parent;
    self.timer = 0;
    self.dx = config.bullet.dimensions.width;
    self.dy = config.bullet.dimensions.height;
    self.toRemove = false;
    self.gameContainer = gameContainer;
    self.map = gameContainer.players.list[parent].map;
    self.mapNo = gameContainer.players.list[parent].mapNo;
    
    self.update = function(){
        if(self.timer++ > config.bullet.lifespan)
            self.toRemove = true;
        self.updatePosition();
        
        for(var i in self.gameContainer.players.list){
            var p = self.gameContainer.players.list[i];
            if(self.getDistance(p) < config.bullet.hitRange && self.parent !== p.id){
                self.toRemove = true;
                p.hp -= config.bullet.damage;

                if(p.hp <= 0) {
                    var shooter = self.gameContainer.players.list[self.parent];
                    if(shooter)
                        shooter.score += config.player.scorePerKill;
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
    for(var i in self.gameContainer.maps.list){
        if(self.gameContainer.maps.list[i].name == self.map){
            self.gameContainer.initPack.map[i].bullet.push(self.getInitPack());
        }
    }
    return self;
}

Bullet.list = {};

Bullet.getAllInitPack = function(mapNo){
    var bullets = [];
    for (var i in Bullet.list){
        if(Bullet.list[i].mapNo = mapNo){
            bullets.push(Bullet.list[i].getInitPack());
        }
    }
    return bullets;
}

Bullet.update = function(mapNo, gameContainer){
    var pack = [];
    for(var i in Bullet.list){
        if(Bullet.list[i].map == gameContainer.maps.list[mapNo].name){
            var bullet = Bullet.list[i];
            bullet.update();
            if(bullet.toRemove){
                delete Bullet.list[i];
                gameContainer.removePack.map[mapNo].bullet.push(bullet.id);
            }
            else
                pack.push(bullet.getUpdatePack());
        }
    }
    return pack;
}

module.exports = Bullet;
