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
        
        ctx.drawImage(Img.player, x - 40, y - 40, 80, 80);
        
        ctx.fillStyle = 'black';
        ctx.textAlign = "center";
        ctx.fillText(self.name, x, y - 63);
        
        var hpWidth = 60 * self.hp / self.hpMax;
        ctx.fillStyle = 'red';
        ctx.fillRect(x - hpWidth/2, y - 54, hpWidth,8);
    }
    
    Player.list[self.id] = self;
    return self;
}

Player.list = {};
