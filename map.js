// Import Entity and Config
var Entity = require('./entity.js');
var config = require('./config');

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

// Create maps from configuration
for (const [mapName, mapData] of Object.entries(config.maps)) {
    Map({
        id: mapData.id,
        map: mapName,
        obstacles: mapData.obstacles,
        monsters: []
    });
}

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

// Export the Map, Obstacle constructors, and isEmpty function
module.exports = {
    Map,
    Obstacle,
    isEmpty
};
