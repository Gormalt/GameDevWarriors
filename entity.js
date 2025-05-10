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
    
    self.findMapNo = function(Map){
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

module.exports = Entity