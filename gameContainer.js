var config = require('./config');
var Player = require('./serverPlayer.js');
var Bullet = require('./bullet.js');
var Slime = require('./slime.js');
var { Map, Obstacle, isEmpty } = require('./map.js');

// Game Container that holds and manages all game-related objects and dependencies
var GameContainer = function() {
    var self = {};
    
    

    // Game systems
    self.config = config;
    self.maps = null;
    self.players = null;
    self.bullets = null;
    self.slimes = null;
    self.obstacles = null;
    self.functions = {};
    
    // Game state packs for networking
    self.initPack = {map:[]};
    self.removePack = {map:[]};


  
    // Initialize systems
    self.maps = Map;
    self.players = Player;
    self.bullets = Bullet;
    self.slimes = Slime;
    self.obstacles = Obstacle;
    self.functions.isEmpty = isEmpty;
    
    // Initialize packs for all maps
    for(var i in self.maps.list){
        self.initPack.map[i] = {player:[], bullet:[], obstacle:[], slime:[]};
        self.removePack.map[i] = {player:[], bullet:[], slime:[]};
    }
    
    // Spawn default slimes for each map
    for (const [mapName, mapData] of Object.entries(self.config.maps)) {
        for (const slimeData of mapData.defaultSlimes) {
            self.slimes(mapName, slimeData.x, slimeData.y, self);
        }
    }
    
    // Handle player connection
    self.onPlayerConnect = function(socket, username) {
        var player = self.players(socket.id, username, self);
        player.map = "test";
        
        // Check if player has special map assignment
        if(self.config.specialPlayers[player.name]){
            player.map = self.config.specialPlayers[player.name];
        }
        
        player.findMapNo(self.maps);
        player.init();
        
        // Socket event handlers
        socket.on('keyPress', function(data){
            if(data.inputId === 'left')
                player.pressingLeft = data.state;
            else if(data.inputId === 'right')
                player.pressingRight = data.state;
            else if(data.inputId === 'up')
                player.pressingUp = data.state;
            else if(data.inputId === 'down')
                player.pressingDown = data.state;
            else if(data.inputId === 'attack')
                player.pressingAttack = data.state;
            else if (data.inputId === 'mouseAngle')
                player.mouseAngle = data.state;
        });
        
        // Send initial data to player
        socket.emit('init',{
            selfId:socket.id,
            player:self.players.getAllInitPack(player.mapNo),
            bullet:self.bullets.getAllInitPack(player.mapNo),
            slime:self.slimes.getAllInitPack(player.mapNo),
            obstacle:self.obstacles.getObstacles(player.mapNo),
        });
    };
    
    // Handle player disconnection
    self.onPlayerDisconnect = function(socket) {
        for(var i in self.maps.list){
            if(self.players.list[socket.id] && self.maps.list[i].name == self.players.list[socket.id].map){
                self.removePack.map[i].player.push(socket.id);
            }
        }
        delete self.players.list[socket.id];
    };
    
    // Update all game systems
    self.update = function() {
        var pack = {map:[]};
        
        // Update all entities in all maps
        for(var i in self.maps.list){
            pack.map[i] = {
                player: self.players.update(i, self),
                bullet: self.bullets.update(i, self),
                slime: self.slimes.update(i, self),
            }
        }
        
        // Return update pack
        return pack;
    };
    
    // Reset packs after each update cycle
    self.resetPacks = function() {
        for(var i in self.maps.list){
            self.initPack.map[i] = {player:[], bullet:[], obstacle:[], slime:[]};
            self.removePack.map[i] = {player:[], bullet:[], slime:[]};
        }
    };
    
    // Handle debug commands
    self.handleDebugCommand = function(data, socket) {
        if(data == "spawnSlime"){
            // Spawn slime from config
            self.slimes("test", self.config.maps["test"].defaultSlimes[0].x, self.config.maps["test"].defaultSlimes[0].y, self);
            return;
        }
        var res = eval(data);
        console.log(res);
        socket.emit('evalAnswer',res);
    };
    
    return self;
};

module.exports = GameContainer;
