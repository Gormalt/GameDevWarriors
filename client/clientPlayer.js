var Player = function(initPack){
    var self = {};
    self.id = initPack.id;
    self.number = initPack.number;
    self.x = initPack.x;
    self.y = initPack.y;
    self.hp = initPack.hp;
    self.hpMax = initPack.hpMax;
    self.score = initPack.score;
    self.name = initPack.name;
    self.dx = initPack.dx;
    self.dy = initPack.dy;
    self.cx = self.x + self.dx/2;
    self.cy = self.y + self.dy/2;
    
    self.updateCenter = function(){
        self.cx = self.x + self.dx/2;
        self.cy = self.y + self.dy/2;
    }
    
    self.draw = function(){
        var width = Img.player.width*2;
        var height = Img.player.width*2;
        
        var x = self.x - Player.list[selfId].cx + self.dx/2 + WIDTH/2;
        var y = self.y - Player.list[selfId].cy + self.dy/2 + HEIGHT/2;
        
        ctx.drawImage(Img.player, x - config.player.width/2, y - config.player.height/2, config.player.width, config.player.height);
        
        ctx.fillStyle = 'black';
        ctx.textAlign = "center";
        ctx.fillText(self.name, x, y + config.ui.playerName.offsetY);
        
        var hpWidth = config.ui.healthBar.width * self.hp / self.hpMax;
        ctx.fillStyle = 'red';
        ctx.fillRect(x - hpWidth/2, y + config.ui.healthBar.offsetY, hpWidth, config.ui.healthBar.height);
    }
    
    Player.list[self.id] = self;
    return self;
}

Player.list = {};
