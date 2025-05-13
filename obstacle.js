// Import Entity and Map
var Entity = require('./entity.js');
var Map = require('./map.js');

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

// Export the Obstacle constructor
module.exports = Obstacle;
