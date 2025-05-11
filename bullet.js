var Entity = require('./entity.js');

// Bullet constructor function
var Bullet = function(parent, angle, Player, Map, initPack){
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