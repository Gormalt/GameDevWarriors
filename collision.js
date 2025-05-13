// Import Map
var Map = require('./map.js');

var isEmpty = function(mapNo, x, y, dx, dy){
    for(var i in Map.list[mapNo].obstacles){
        obstacle = Map.list[mapNo].obstacles[i];
        if(x + dx > obstacle.x && x < obstacle.x + obstacle.dx && y + dy > obstacle.y && y < obstacle.y + obstacle.dy)
            return false;
    }
    return true;
}

// Export the isEmpty function
module.exports = isEmpty;
