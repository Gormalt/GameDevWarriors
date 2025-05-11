var Entity = require('./entity.js');
var config = require('./config');

// Bullet constructor function
var Bullet = function(parent, angle, Player, Map, initPack){
    var self = Entity();
    self.id = Math.random();
    self.spdX = Math.cos(angle/180*Math.PI)* config.bullet.speed;
    self.spdY = Math.sin(angle/180*Math.PI)* config.bullet.speed;
    self.parent = parent;
    self.timer = 0;
    self.dx = config.bullet.dimensions.width;
    self.dy = config.bullet.dimensions.height;
    self.toRemove = false;
    self.map = Player.list[parent].map;
    self.mapNo = Player.list[parent].mapNo;
    
    self.update = function(){
        if(self.timer++ > config.bullet.lifespan)
            self.toRemove = true;
        self.updatePosition();
        
        for(var i in Player.list){
            var p = Player.list[i];
            if(self.getDistance(p) < config.bullet.hitRange && self.parent !== p.id){
                self.toRemove = true;
                p.hp -= config.bullet.damage;

                if(p.hp <= 0) {
                    var shooter = Player.list[self.parent];
                    if(shooter)
                        shooter.score += config.player.scorePerKill;
                    p.hp = p.hpMax * config.player.respawnHealthFactor;
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

Bullet.getAllInitPack = function(mapNo){
    var bullets = [];
    for (var i in Bullet.list){
        if(Bullet.list[i].mapNo = mapNo){
            bullets.push(Bullet.list[i].getInitPack());
        }
    }
    return bullets;
}

Bullet.update = function(mapNo, Map, removePack){
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

module.exports = Bullet;
