var mongojs = require("mongojs");
var db = mongojs('localhost:27017/GameDevWarriors', ['maps', 'profiles']);

var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res){
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

serv.listen(5000);
console.log("Server started.");

var SOCKET_LIST = {};

var Entity = function(){
	var self = {
		
		x:0,
		y:0,
		dx:0,
		dy:0,
		spdX:0,
		spdY:0,
		id:"",
		mapNo:2,
	}

	
	self.update = function(){
		self.updatePosition();
	}
	self.updatePosition = function (){
		self.x += self.spdX;
		self.y += self.spdY;
	}
	self.getDistance = function(pt){
		return Math.sqrt(Math.pow(self.x + self.dx/2 - (pt.x +pt.dx/2),2) + Math.pow(self.y + self.dy/2 - (pt.y + pt.dy/2),2));
	}
	self.isCollidingWithBox = function(trgt){
		
		//if(trgt.angle !== undefined && self.angle !== undefined){
			//var realAngle = (self.angle-trgt.angle) * Math.PI/180;

			
		//	x = Math.cos(realAngle)*self.x - Math.sin(realAngle)*self.y;
		//	y = Math.sin(realAngle)*self.x + Math.cos(realAngle)*self.y;
		//	console.log("Arrow Co-ors: " + x + ", " + y);
			
			//if(x + self.dx > trgt.x && x < trgt.x + trgt.dx && y + self.dy > trgt.y && y < trgt.y + trgt.dy){
			//	return true;
			//}
		//}		
		if(self.x + self.dx > trgt.x && self.x < trgt.x + trgt.dx && self.y + self.dy > trgt.y && self.y < trgt.y + trgt.dy){
			return true;
		}
		return false;
	}
	self.isCollidingWithBall = function(trgt){
		
		if(self.getDistance(trgt) < self.dx/2 + trgt.dx/2 && self.getDistance(trgt) < self.dy/2 + trgt.dy/2){
			return true;
		}
			return false;
	}
	
	return self;

}

var getPointDis = function(x1, y1, x2, y2){
	return Math.sqrt(Math.pow(x1 - x2,2) + Math.pow(y1 - y2,2));
}

var Slime = function(map, x, y){
	var self = Entity();
	self.x = x;
	self.y = y;
	self.id = Math.random();
	self.maxhp = 10;
	self.hp = 10;
	self.range = 250;
	self.cooldown = 4000;
	self.toRemove = false;
	self.dx = 50;
	self.dy = 50;
	self.angle = 0;
	self.mapNo = map;
	
	
	self.targetPlayer = function(){
		var distance = self.range;
		var playerId = null;
		for(var i in Player.list){
			if(self.getDistance(Player.list[i]) < distance && Player.list[i].mapNo == self.mapNo){
				distance = self.getDistance(Player.list[i]);
				playerId = i;

				}
		}
		return playerId;
	}
	
	self.attackPlayer = function(playerId){

		var attackAngle = 1;
		//@Todo, player targeting.
		if(Player.list[playerId].x > self.x){
			self.spdX = 10;
		}
		else
		{
			self.spdX = -10;
		}
		self.spdY = -10;
		cooldown = 0;
	}
	
	self.updatePos = function(){

		if(isEmpty(self.mapNo, self.x, self.y + 1, 50, 50)){
			self.spdY++;
		}
		else if(self.spdY > 0){
			self.spdY = 0;
			self.spdX = 0;
		}
		
		if(isEmpty(self.mapNo, self.x, self.y + self.spdY, 50, 50)){
			self.y += self.spdY;
		}
		else{
			self.spdY = 0;
		}
		
		self.x += self.spdX;
		
	}
	
	self.getInitPack = function(){
		return{
			id:self.id,
			x:self.x,
			y:self.y,
			hp:self.hp,
			dx:self.dx,
			dy:self.dy,
			hpMax:self.hpMax,
		}
	}
	
		initPack.map[self.mapNo].slime.push(self.getInitPack());
		Slime.list[self.id] = self;

	
}

Slime.list = {};

Slime.update = function(mapNo){
	var slimePack = [];
	
	for(var i in Slime.list){
	if(Slime.list[i].mapNo == mapNo){
	
		slime = Slime.list[i];
		if(slime.cooldown >= 60 && slime.targetPlayer()){
			slime.attackPlayer(slime.targetPlayer());
			slime.cooldown = 0;
		}
		
		if(slime.cooldown < 60){
			slime.cooldown++;
		}
		slime.updatePos();
		
		for(var i in Player.list){
			if(slime.isCollidingWithBox(Player.list[i]) && slime.mapNo == Player.list[i].mapNo){
				Player.list[i].hp--;	
				Player.list[i].checkHealth();
			}			
		}
		
		for(var i in Bullet.list){
			if(slime.isCollidingWithBox(Bullet.list[i]) && Bullet.list[i].mapNo == slime.mapNo){
				slime.hp = slime.hp - Bullet.list[i].dmg;
			}
		}
		if(slime.hp <= 0){
			slime.toRemove = true;
		}
		
		if(slime.toRemove){
			removePack.map[mapNo].slime.push(slime.id);
			delete Slime.list[slime.id];

		}
		else{
			slimePack.push(slime);
		}
	}
	}
	return slimePack;
	
}


Slime.getAllInitPack = function(mapNo){
			var slime = [];
	for (var i in Slime.list){
		if(Slime.list[i].mapNo == mapNo){
			slime.push(Slime.list[i].getInitPack());
		}
	}
	return slime;
}


//Player Object

var Player = function(id, data){
	var self = Entity();

		self.id = id;
		self.name = data.username;
		self.angle = 0;
		
		self.clas = data.clas;
		self.level = data.level;
		self.mapNo = data.mapNo;
		self.x = data.x;
		self.y = data.y;
		self.meleeScore = false;
		self.hat = data.hat;
		self.body = data.body;
		self.weapon = data.weapon;
		
		self.number = "" + Math.floor(10 * Math.random());
		
		self.selfpressingRight = false;
		self.pressingLeft = false;
		self.pressingUp = false;
		self.pressingDown = false;
		self.pressingAttack = false;
		self.pressingJump = false;
		
		self.mouseAngle = 0;
		
		
		self.maxSpd = 10;
		self.hp = 10;
		self.hpMax = 10;
		self.score = 0;
		self.jumpSpd = 13;
		self.dx = 80;
		self.dy = 80;
		self.cx = self.x+(self.dx/2)
		self.cy = self.y+(self.dy/2)
		self.canJump = false;
		self.cooldowns = {};
		
		self.cooldowns.basic = 50;
		
				self.arrowCharge = 0;
		
		self.checkHealth = function(){
			if(self.hp <= 0){
				self.hp = self.hpMax;
				self.x = 20;
			}
		}
		
		var super_update = self.update;
		
		self.update = function(){
			
			self.updateSpd();
			self.updatePos();
			self.updateCooldowns();
			//super_update();
			if(self.pressingAttack){
					
				
				if(self.clas == 'r' && self.cooldowns.basic <= 0){
					
					self.arrowCharge++;
					
				}
				if(self.clas == 'w' && self.cooldowns.basic <= 0){
					self.slashSword();
				}
				
				if(self.clas == 'm' && self.cooldowns.basic <= 0){
					
					self.launchFireball();
					self.cooldowns.basic = 70;
					
				}

			}
			else if(self.arrowCharge > 10 && self.clas == 'r'){
				
				self.fireArrow();
				self.arrowCharge = 0;
				self.cooldownsBasic = 50;
				
			}
			
			self.checkInteract();


		}
	
	self.fireArrow = function(){
		
		Bullet({
			parent:self.id,
			angle:self.mouseAngle,
			img:0,
			dmg:5,
			x:self.cx - 31,
			y:self.cy - 6,
			dx:63,
			dy:12,
			speed:60,
			type:"arrow",
		});
	}
	
	self.launchFireball = function(){
		
		Bullet({
			parent:self.id,
			angle:self.mouseAngle,
			img:0,
			dmg:5,
			x:self.cx - 31,
			y:self.cy - 6,
			dx:20,
			dy:20,
			speed:40,
			type:"fireball",
		});
	}
	
	self.slashSword = function(){
		
		collider = Entity();
		self.meleeScore = true;
		self.cooldowns.basic = 20;
		
		if(self.mouseAngle <= 60 && self.mouseAngle >= -60){
			collider.x = self.x + 70;
			collider.y = self.y - 10;
			collider.dx = 40;
			collider.dy = self.dy + 20;
		}
		
		if(self.mouseAngle < -60 && self.mouseAngle > -120){
			collider.x = self.x - 10;
			collider.y = self.y - 30;
			collider.dx = self.dx + 20;
			collider.dy = 40;
		}
		
		if(self.mouseAngle <= -120 || self.mouseAngle >= 120){
			collider.x = self.x - 30;
			collider.y = self.y - 10;
			collider.dx = 40;
			collider.dy = self.dy + 20;
		}		
		
		if(self.mouseAngle <= 120 && self.mouseAngle >= 60){
			collider.x = self.x - 10;
			collider.y = self.y + 70;
			collider.dx = self.dx + 20;
			collider.dy = 40;	
		}		
		
		for(var i in Player.list){
		
		player = Player.list[i] 	
			
			if(collider.isCollidingWithBox(player) && self.id != i){
				player.hp -= 5;
				player.checkHealth();

			}
		}
		
		
	}
	
	self.updatePos = function(){
		

		if(isEmpty(self.mapNo, self.x + self.spdX, self.y, self.dx, self.dy)){
		self.x += self.spdX;
		}
		else if(self.spdX > 0){
			while(!isEmpty(self.mapNo, self.x + self.spdX, self.y,self.dx,self.dy) && self.spdX > 0){
				self.spdX--;
				
			}
			self.x += self.spdX;
			self.canJump = true;
			
		}
		else if(self.spdX < 0){
			while(!isEmpty(self.mapNo, self.x + self.spdX, self.y, self.dx, self.dy) && self.spdX < 0){
				self.spdX++;
				
			}
			self.x += self.spdX;
			self.canJump = true;

		}
		else{
			self.canJump = true;
			self.spdX = 0;
			
		}
		
		if(isEmpty(self.mapNo, self.x, self.y + self.spdY, self.dx, self.dy)){
		self.y += self.spdY;
		}
		else if(self.spdY > 0){
			while(!isEmpty(self.mapNo, self.x, self.y + self.spdY, self.dx, self.dy) && self.spdY > 0){
				self.spdY--;

			}
			self.y += self.spdY;
			self.canJump = true;
			
		}
		else if(self.spdY < 0){
			while(!isEmpty(self.mapNo, self.x, self.y + self.spdY, self.dx, self.dy) && self.spdY < 0){
				self.spdY++;

			}
			self.y += self.spdY;
			self.canJump = true;

		}
		else{
			self.canJump = true;
			self.spdY = 0;
		}
		
		self.cx = self.x + (self.dx/2);
		self.cy = self.y + (self.dy/2);
	}
	
	self.updateSpd = function(){
		if(self.pressingRight)
			self.spdX = self.maxSpd;
		else if(self.pressingLeft)
			self.spdX = -self.maxSpd;
		else
			self.spdX = 0;
		
		if(self.pressingUp && self.canJump == true){
			self.spdY = -self.jumpSpd;
			self.canJump = false;
		}
		else if(self.pressingDown)
			self.spdY = +self.jumpSpd;
		
		if(isEmpty(self.mapNo, self.x, self.y + self.spdY + 1, self.dx, self.dy)){
			self.spdY++;
		}
		else if(!isEmpty(self.mapNo, self.x, self.y + self.spdY, self.dx, self.dy)){
			while(!isEmpty(self.mapNo, self.x, self.y + self.spdY, self.dx, self.dy) && self.spdY > 0){
				self.spdY--;
				
			}
				self.canJump = true;
		}	

	}
	
	self.updateCooldowns = function(){
		if(self.cooldowns.basic >= 0)
		self.cooldowns.basic--;
	}
	
	self.checkInteract = function (){
		for(var i in Map.list[self.mapNo].doors){
			
			if(self.isCollidingWithBox(Map.list[self.mapNo].doors[i]) && self.pressingUp){
				Player.changeMap(self.id, Map.list[self.mapNo].doors[i].toMapNo);
			}
		}
	}
	
	self.getInitPack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			number:self.number,
			hp:self.hp,
			hpMax:self.hpMax,
			score:self.score,
			name:self.name,
			dx:self.dx,
			dy:self.dy,
			hat:self.hat,
			body:self.body,
			weapon:self.weapon,
			clas:self.clas,
			
			angle:self.mouseAngle,
			bowCharge:self.bowCharge,
		};
	}
	self.getUpdatePack = function(){
		if(self.clas == 'r'){
			return {
				id:self.id,
				x:self.x,
				y:self.y,
				hp:self.hp,
				score:self.score,
				angle:self.mouseAngle,
				bowCharge:self.arrowCharge,
			}
		}
		if(self.clas == 'w'){
			var temp = self.meleeScore;
			self.meleeScore = false;
			return {
				id:self.id,
				x:self.x,
				y:self.y,
				hp:self.hp,
				score:self.score,
				angle:self.mouseAngle,
				meleeScore:temp,
			}
		}
		if(self.clas == 'm'){

			return {
				id:self.id,
				x:self.x,
				y:self.y,
				hp:self.hp,
				score:self.score,
				angle:self.mouseAngle,
			}
		}
	}
	Player.list[id] = self;
	
	self.init = function(){
		
		initPack.map[self.mapNo].player.push(self.getInitPack());
		
	}	
			return self;
}

Player.list = {};
Player.onConnect = function(socket, data){
		var player = Player(socket.id, data);
		
		

		player.init();

	socket.on('keyPress', function(data){
		if(data.inputId ==='left')
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

	
	socket.emit('init',{
		selfId:socket.id,
		player:Player.getAllInitPack(Player.list[socket.id].mapNo),
		bullet:Bullet.getAllInitPack(Player.list[socket.id].mapNo),
		slime:Slime.getAllInitPack(Player.list[socket.id].mapNo),
		obstacle:getObstacles(Player.list[socket.id].mapNo),
		background:getBackground(Player.list[socket.id].mapNo),
	});
	
}

Player.getAllInitPack = function(mapNo){
		var player = [];
	for (var i in Player.list){
	//console.log(Player.list[i].mapNo + " " + Player.list[i].name);
		if(Player.list[i].mapNo == mapNo){
			player.push(Player.list[i].getInitPack());
		}
	}
	return player;
}

Player.onDisconnect = function(socket){

	dPlayer = Player.list[socket.id];
	if(dPlayer){
			removePack.map[dPlayer.mapNo].player.push(socket.id);
	}
	
	delete Player.list[socket.id];
}

Player.update = function(mapNo){
	
		var pack = [];
	for(var i in Player.list){
	if(Player.list[i].mapNo == mapNo){
		var player = Player.list[i];
			player.update();
			pack.push(player.getUpdatePack());	
	

	}
	}
	return pack;
}
Player.changeMap = function(playerId, mapNo){
	
	
	player = Player.list[playerId];;
	
	oldMap = player.mapNo;
	Player.list[playerId].mapNo = mapNo;
	Player.list[playerId].map = Map.list[mapNo].name;
		socket = SOCKET_LIST[playerId];
		
		socket.emit('init',{
		selfId:socket.id,
		player:Player.getAllInitPack(Player.list[playerId].mapNo),
		bullet:Bullet.getAllInitPack(Player.list[playerId].mapNo),
		slime:Slime.getAllInitPack(Player.list[playerId].mapNo),
		obstacle:getObstacles(Player.list[playerId].mapNo),
		background:getBackground(Player.list[playerId].mapNo),
		whipe:true,
	});
	
		
		initPack.map[mapNo].player.push(player.getInitPack());
	
		removePack.map[oldMap].player.push(playerId);
}


var Bullet = function(param){
	
	var self = Entity();
	
	self.angle = param.angle;
	self.id = Math.random();
	self.spdX = Math.cos(self.angle/180*Math.PI)* param.speed;
	self.spdY = Math.sin(self.angle/180*Math.PI)* param.speed;
	self.parent = param.parent;
	self.timer = 0;
	self.dmg = param.dmg;
	self.x = param.x;
	self.y = param.y;
	self.dx = param.dx;
	self.dy = param.dy;
	self.toRemove = false;
	self.mapNo = Player.list[param.parent].mapNo;
	self.img = param.img;
	self.type = param.type;
	
	self.exploding = 0;
	
	var super_update = self.update;
	
	self.update = function(){
	
		if(self.exploding > 0){
			
			self.exploding--;
			if(self.exploding == 1){
				self.toRemove = true;
			}
			self.spdX = 0;
			self.spdY = 0;
			return;
			
		}
	
		if(self.timer++ > 100){
			self.toRemove = true;
		}
		
		super_update();
		if(self.type == "arrow"){
			
			for(var i in Player.list){
				var p = Player.list[i];
				if(self.isCollidingWithBall(p) && self.parent !== p.id && self.mapNo == p.mapNo){
					self.toRemove = true;
					p.hp -= self.dmg;
					p.checkHealth();
					//p.y = Math.random() * 500;

				}
			}
		}
		
		if(self.type == "fireball"){
			
			for(var i in Player.list){
				var p = Player.list[i];
				if(self.isCollidingWithBall(p) && self.parent !== p.id && self.mapNo == p.mapNo){
					
					self.explode(100, 10);
					
				}
				

			}
			
			if(!isEmpty(self.mapNo, self.x + self.spdX, self.y + self.spdY, self.dx, self.dy)){

				self.explode(100, 10);
					
					
			}		
		}
		

		
	}
			
		
		self.explode = function(radius, dmg){
			
				self.exploding = 20;
				explosion = {
					x:self.x - radius/2,
					y:self.y - radius/2,
					dx:radius,
					dy:radius,
					
				}
			for(var i in Player.list){
				var p = Player.list[i];
	
				if(p.isCollidingWithBall(explosion) && self.mapNo == p.mapNo){
					p.hp -= dmg;
					p.checkHealth();
					
				}
				

			}
			
		}
	
	
		self.getInitPack = function(){
		return{
			id:self.id,
			x:self.x,
			y:self.y,
			type:self.type,
			angle:self.angle,
			dx:self.dx,
			dy:self.dy,
		};
	}
	self.getUpdatePack = function(){
		
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			explo:self.exploding,
		}
	}
	
	
	Bullet.list[self.id] = self;

	initPack.map[self.mapNo].bullet.push(self.getInitPack());
		
	
	return self;
}
Bullet.list = {};


var Map = function(data){

	var self = {};
	self.id = data.id;
	self.name = data.name;
	self.obstacles = data.obstacles;
	self.monsters = data.monsters;
	self.background = data.background;
	self.doors = data.doors;
	
	Map.list[self.id] = self;
	
	return self;

}

Map.list = {};
Map({
	id:2,
	name:"test",
	obstacles:[
{
	img:0,
	x:-600, 
	y:10, 
	dx:2000, 
	dy:600,
	id:2
},
{
	img:0,
	x:100, 
	y:-60, 
	dx:20, 
	dy:20,
	id:1
},
{
	img:0,
	x:120, 
	y:-260, 
	dx:50, 
	dy:50,
	id:3
}
],
monsters:[],
background:[
{
	img:0,
	x:120, 
	y:-70, 
	dx:200, 
	dy:200,
	id:1
},
{
	img:0,
	x:700,
	y:-150,
	dx:100,
	dy:150,
	id:2,
}
],
doors:[{
	img: 0,
	x:700,
	y: -150,
	dx:100,
	dy:150,
	id:3,
	bid:3,
	toMapNo:3,
}]
})
var Background = function(param){

	var self = {};
	self.id = param.id;
	self.x = param.x;
	self.y = param.y;
	self.dx = param.dx;
	self.dy = param.dy;
	Background.list[self.id] = self;
}	

Background.list = {};

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

var MapObject = function(param){
	var self = Entity();
	self.x = param.x;
	self.y = param.y;
	self.dx = param.dx;
	self.dy = param.dy;
	self.img = param.img;
	self.id = param.id;
	self.mapNo = param.mapNo;
	self.obstacleID = param.oID;
	self.background = param.bID;
	
	return self;
}

var Door = function(param){
	
	var self = MapObject(param);
	Map.list[self.mapNo].background[self.bID] = self;
	
}

Door.list = {};

//Obstacle Initialization. To be replaced by reading the database later.
/*
Obstacle({
	img:0,
	x:-600, 
	y:10, 
	dx:2000, 
	dy:600,
	id:2,
	mapNo:2,
});
Obstacle({
	img:0,
	x:100, 
	y:-60, 
	dx:20, 
	dy:20,
	id:1,
	mapNo:2,
	
});
Obstacle({
	img:0,
	x:120, 
	y:-260, 
	dx:50, 
	dy:50,
	id:3,
	mapNo:2,
});
*/
var getObstacles = function(mapNo){
	console.log("Map no is: " + mapNo);
	var obstacles = [];
	for(var i in Map.list[mapNo].obstacles){
		obstacles.push(Map.list[mapNo].obstacles[i]);
	}
	return obstacles;
}

var getBackground = function(mapNo){
	var background = [];
	for(var i in Map.list[mapNo].background){
		background.push(Map.list[mapNo].background[i]);
	}
	return background;
}

Bullet.getAllInitPack = function(mapNo){
	var bullets = [];
	for (var i in Bullet.list){
		if(Bullet.list[i].mapNo == mapNo){
			bullets.push(Bullet.list[i].getInitPack());
		}
	}
	return bullets
}

Bullet.update = function(mapNo){
	
	var pack = [];
	for(var i in Bullet.list){
	if(Bullet.list[i].mapNo == mapNo){
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

var DEBUG = true;

//@DataBase

var isValidPassword = function(data, cb){
	db.profiles.findOne({username:data.username,id:data.id},function(err,res){

		if(res && res.id == data.id)
			cb(true);
		else
			cb(false);
	});
}

var isUsernameTaken = function(data,cb){
	db.profiles.find({username:data.username},function(err,res){
		if(res.length > 0)
			cb(true);
		else
			cb(false);
	});
}
var addUser = function(data,cb){
	id = 100000 * Math.random();
	id = Math.floor(id).toString();

	db.profiles.insert({username:data.username, id:id, level:1, clas: data.pack.clas, mapNo: 2, x:0, y:-100, hat:data.pack.hat, body:data.pack.body, weapon:data.pack.weapon}, function(err){
		cb(id);
	});
}

var getMapData = function(map, cb){

	db.maps.findOne({name:map}, function(err,res){
		if(res){

			cb(res);

		}
	});
}

var getPlayerData = function(name, cb){
		
	db.profiles.findOne({username:name}, function(err,res){
		if(res){
			cb(res);
		}
		
		
	});
}

getMapData("Dev", Map);



var isEmpty = function(mapNo,x,y,dx,dy){
	for(var i in Map.list[mapNo].obstacles){
		obstacle = Map.list[mapNo].obstacles[i];
		if(x + dx > obstacle.x && x < obstacle.x + obstacle.dx && y + dy > obstacle.y && y < obstacle.y + obstacle.dy)
			return false;
	}
	return true;
}

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	console.log('socket connection');
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	//socket.on('signIn', function(data){
	//	Player.onConnect(socket, data.username);
	//	socket.emit('signInResponse',{success:true});
	//});
	socket.on('signIn', function(data){
		
		isValidPassword(data, function(res){
			if(res){
				loginData = getPlayerData(data.username, function(res){
					Player.onConnect(socket, res);
					
				});
				socket.emit('signInResponse',{success:true});
			}
			else{
				socket.emit('signInResponse',{success:false});
			}
		});
	});
	
	socket.on('signUp', function(data){
		isUsernameTaken(data, function(res){
			if(res){
				socket.emit('signUpResponse',{success:false});
			}
			else{
				addUser(data, function(id){
					socket.emit('signUpResponse',{success:true, id: id});
				});
			}
		});
	});	
		
		
	socket.on('disconnect', function(){
		Player.onDisconnect(socket);
		delete SOCKET_LIST[socket.id];
	});
	socket.on('sendMsgToServer', function(data){
		var playerName = ("" + Player.list[socket.id].name);
		for(var i in SOCKET_LIST){
			SOCKET_LIST[i].emit('addToChat', playerName + ': ' + data);
		}
	});
	socket.on('evalServer', function(data){
		if(!DEBUG)
			return;
		

		if(data == "spawnSlime"){
		Slime(2, 900, -200);
			return;
		}
		var res = eval(data);
		console.log(res);
		socket.emit('evalAnswer',res);
	});
	
});

var initPack = {map:[]};
var removePack = {map:[]};

for(var i in Map.list){
	initPack.map[i] = {player:[], bullet:[], obstacle:[], slime:[]};
	removePack.map[i] = {player:[], bullet:[], slime:[]};
}


//Initializing test-slimes
Slime(2, 900, -200);

setInterval(function(){
	var pack = {map:[]};
	for(var i in Map.list){
		pack.map[i] = {
			player:Player.update(i),
			bullet:Bullet.update(i),
			slime:Slime.update(i),
		
		}
		
	}

	for(var i in SOCKET_LIST){
		for(var n in Map.list){
			//console.log(Player.list);
			if(Player.list[i] && n == Player.list[i].mapNo){
				var socket = SOCKET_LIST[i];
				socket.emit('init', initPack.map[n]);
				socket.emit('update', pack.map[n]);
				socket.emit('remove', removePack.map[n]);
			}
		}
	}
	//console.log(initPack);
	
	for(var i in Map.list){
	initPack.map[i] = {player:[], bullet:[], obstacle:[], slime:[]};
	removePack.map[i] = {player:[], bullet:[], slime:[]};
}
	
}, 1000/25);