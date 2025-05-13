// Import Config
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

// Export the Map constructor
module.exports = Map;
