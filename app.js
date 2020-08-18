var mongojs = require("mongojs");
var db = mongojs('localhost:27017/GameDevWarriors', ['maps', 'profiles']);

var express = require('express');
var app = express();
var serv = require('http').Server(app);

const npcText = require('./client/npcText.json');

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

var Collider = function(x, y, dx, dy){
	var self = {
		x:x,
		y:y,
		dx:dx,
		dy:dy,
		
	}
	
	
	self.isCollidingWithBox = function(trgt){
			
		if(self.x + self.dx > trgt.x && self.x < trgt.x + trgt.dx && self.y + self.dy > trgt.y && self.y < trgt.y + trgt.dy){
			return true;
		}
		return false;
	}
	
	
	return self
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
	
	self.speedDebufX = 0;
	self.speedDebufY = 0;
	
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
		//@Todo, player angled targeting.
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
		
		if(self.speedDebufX != 0){
			
			self.x = self.x + self.speedDebufX;
			if(self.speedDebufX < 0){
				self.speedDebufX++;
			}
			if(self.speedDebufX > 0){
				self.speedDebufX--;
			}
			
			if(self.speedDebufX < 1 && self.speedDebufX > -1){
				self.speedDebufX = 0;
			}
		}
		
		if(self.speedDebufY != 0){
			

			self.spdY = self.spdY + self.speedDebufY;
			self.speedDebufY = 0;
			/*
			if(self.speedDebufY < 0){
				self.speedDebufY++;
			}
			if(self.speedDebufY > 0){
				self.speedDebufY--;
			}
			
			if(self.speedDebufY < 1 && self.speedDebufY > -1){
				self.speedDebufY = 0;
			}
			*/
		}
		if(self.spdY < 1 && self.spdY > -1){
			self.spdY = 0;
		}
		if(self.spdX < 1 && self.spdX > -1){
			self.spdX = 0;
		}
		
	}
	
	self.checkHealth = function(foeId){
		if(self.hp <= 0){
			self.toRemove = true;
		}
		
		if(foeId){
			Player.list[foeId].xp = Player.list[foeId].xp+1;
		}
		
		
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
	if(initPack.map[self.mapNo]){
		initPack.map[self.mapNo].slime.push(self.getInitPack());
	}
		Slime.list[self.id] = self;
		Monster.list[self.id] = self;

		return self.id;
	
}

var Monster = function(){};

Monster.list = {};
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
				Player.list[i].takeDmg(1);
					console.log(Player.list[i].hp);
				Player.list[i].checkHealth();
			}			
		}
	

		
		if(slime.toRemove){
			removePack.map[mapNo].slime.push(slime.id);
			delete Slime.list[slime.id];
			delete Monster.list[slime.id];

		}
		else{
			slimePack.push(slime);
		}
	}
	}
	return slimePack;
	
}

var checkMonsterHitBox = function(tX, tY, tDx, tDy, tMapNo){
	
	collider = new Collider(tX, tY, tDx, tDy);
	
	for(var i in Monster.list){
		monster = Monster.list[i];
		if(monster.isCollidingWithBox(collider) && tMapNo == monster.mapNo){
			console.log("Have detected Collision with monster:" + i);
			return i;
		}
	}
	
	return false;
}


var checkMonsterHitBall = function(tX, tY, tDx, tDy, tMapNo){
	
	collider = new Collider(tX, tY, tDx, tDy);
	
	for(var i in Monster.list){
		monster = Monster.list[i];
		if(monster.isCollidingWithBall(collider) && tMapNo == monster.mapNo){
			console.log("Have detected Collision with monster:" + i);
			return i;
		}
	}
	
	return false;
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
		
		self.xp = data.xp;
		
		self.clas = data.clas;
		self.level = data.level;
		self.abil = data.abil;
		self.mapNo = data.mapNo;
		self.x = data.x;
		self.y = data.y;
		self.meleeScore = false;		
		self.setAbil = {};
		self.items = data.items;
		
		self.equiptment = data.equiptment;
		self.equipt = {};
		
		self.hat = data.hat;
		self.body = data.body;
		self.weapon = data.weapon;
		
		self.speedDebufX = 0;
		self.speedDebufY = 0;
		
		self.number = "" + Math.floor(10 * Math.random());
		
		self.floorTouch = false;
		self.selfpressingRight = false;
		self.pressingLeft = false;
		self.pressingUp = false;
		self.pressingDown = false;
		self.pressingAttack = false;
		self.pressingJump = false;
		self.pressingE = false;
		self.mouseAngle = 0;
		self.pressing1 = false;
		self.pressing2 = false;
		self.pressing3 = false;
		self.pressing4 = false;
		self.pressing5 = false;
		
		self.allAbil = [];
		
		self.armor = 0;
		
		for(var i in data.equipt){
			armor += data.equipt[i].armor;
		}
		
		self.levelPoints = data.levelPoints;
		
		self.strength = data.strength;
		self.mag = data.mag;
		self.vit = data.vit;
		self.def = data.def;
		
		self.maxSpd = 10;

		self.hpMax = 10 + (self.vit*3);
		self.hp = self.hpMax ;
		self.score = 0;
		self.jumpSpd = 13;
		self.dx = 80;
		self.dy = 80;
		self.cx = self.x+(self.dx/2)
		self.cy = self.y+(self.dy/2)
		self.canJump = false;
		self.cooldowns = {};
		
		self.cooldowns.basic = 50;
		self.cooldowns.abil1 = 50;
		self.cooldowns.abil2 = 50;
		self.cooldowns.abil3 = 50;
		self.cooldowns.abil4 = 50;
		self.cooldowns.abil5 = 50;

												
				self.arrowCharge = 0;
		
		self.checkHealth = function(){
			if(self.hp <= 0){
				self.hp = self.hpMax;
				self.x = 20;
				self.spdX = 0;
				self.spdY = 0;
				self.speedDebufX = 0;
				self.speedDebufY = 0;
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
				
				//if(self.clas == 'm' && self.cooldowns.basic <= 0){
					
					//self.launchFireball();
				//	self.cooldowns.basic = 70;
					
				//}

			}
			else if(self.arrowCharge > 10 && self.clas == 'r'){
				
				self.fireArrow();
				self.arrowCharge = 0;
				self.cooldowns.basic = 50;
				
			}
			
			if(self.pressing1 && self.cooldowns.abil1 <= 0 && self.setAbil[0]){
				console.log(self.setAbil);
				self.cooldowns.abil1 = self.executeAbil(self.setAbil[0]);
			}
			
			if(self.pressing2 && self.cooldowns.abil2 <= 0 && self.setAbil[1]){
				
				self.cooldowns.abil2 = self.executeAbil(self.setAbil[1]);
			}
			
			if(self.pressing3 && self.cooldowns.abil3 <= 0 && self.setAbil[2]){
				
				self.cooldowns.abil3 = self.executeAbil(self.setAbil[2]);
			}
			if(self.pressing4 && self.cooldowns.abil4 <= 0 && self.setAbil[3]){
				
				self.cooldowns.abil4 = self.executeAbil(self.setAbil[3]);
			}			
			if(self.pressing5 && self.cooldowns.abil5 <= 0 && self.setAbil[4]){
				
				self.cooldowns.abil5 = self.executeAbil(self.setAbil[4]);
			}
			//self.checkInteract();


		}
	
	self.takeDmg = function(dmg){
		
			self.hp = self.hp - Math.floor(dmg * (1 - (0.03*self.def)));
			self.checkHealth();
	}
	
	self.executeAbil = function(abilNum){
		if(abilNum == 2){
			self.launchFireball();
			return 100;
		}
		if(abilNum == 3){
			self.blastWind();
			return 100;
		}
		
		
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
	
	self.blastWind = function(){
		Bullet({
			parent:self.id,
			angle:self.mouseAngle,
			img:0,
			dmg:5,
			eff:20,
			x:self.cx - 31,
			y:self.cy - 6,
			dx:50,
			dy:30,
			speed:60,
			type:"windBlast",
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
		
		
		hit = checkMonsterHitBox(collider.x, collider.y, collider.dx, collider.dy, self.mapNo);
		

		if(hit != false){
			Monster.list[hit].hp -= self.strength;
			Monster.list[hit].checkHealth(self.id);
		}
		
		for(var i in Player.list){
		
			player = Player.list[i] 	
			
			if(collider.isCollidingWithBox(player) && self.id != i){
				player.takeDmg(self.strength);
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
			if(self.floorTouch){
				self.canJump = true;
				self.floorTouch = false;
			}
			
		}
		else if(self.spdX < 0){
			while(!isEmpty(self.mapNo, self.x + self.spdX, self.y, self.dx, self.dy) && self.spdX < 0){
				self.spdX++;
				
			}
			self.x += self.spdX;
			if(self.floorTouch){
				self.canJump = true;
				self.floorTouch = false;
			}

		}
		else{
			if(self.floorTouch){
				self.canJump = true;
				self.floorTouch = false;
			}
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
			//	self.canJump = true;
				self.floorTouch = true;
		}
		else if(self.spdY < 0){
			while(!isEmpty(self.mapNo, self.x, self.y + self.spdY, self.dx, self.dy) && self.spdY < 0){
				self.spdY++;
				
			}
			self.y += self.spdY;
			if(self.floorTouch){
			//	self.canJump = true;
				self.floorTouch = false;
			}
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
			
			if(self.spdY > 0){
				self.canJump = true;
				self.floorTouch = true;
			}
			
			
			while(!isEmpty(self.mapNo, self.x, self.y + self.spdY, self.dx, self.dy) && self.spdY > 0){
				self.spdY--;
				
			}

		}	
		
		if(self.speedDebufX != 0){
			
			console.log("X debuf:" + self.speedDebufX);
			
			
			self.spdX += self.speedDebufX;
			if(self.speedDebufX < 0){
				self.speedDebufX++;
			}
			if(self.speedDebufX > 0){
				self.speedDebufX--;
			}
			if(self.speedDebufX <= 1 && self.speedDebufX >= -1){
				self.speedDebufX = 0;
			}

		}
		
		if(self.speedDebufY != 0){
			
			console.log("Y Debuf:" + self.speedDebufY);
			console.log("y sped:" +self.spdY);
			
			self.spdY += self.speedDebufY;
			
			self.speedDebufY = 0;
			
			/*
			if(self.speedDebufY < 0){
				self.speedDebufY++;
			}
			if(self.speedDebufY > 0){
				self.speedDebufY--;
			}
			if(self.speedDebufY <= 1 && self.speedDebufY >= -1){
				self.speedDebufY = 0;
			}*/
		}
		
		if(self.spdY < 1 && self.spdY > -1){
			self.spdY = 0;
		}
		
		if(self.spdX < 1 && self.spdX > -1){
			self.spdX = 0;
		}
		

	}
	
	self.updateCooldowns = function(){
	if(self.cooldowns.basic >= 0)
		self.cooldowns.basic--;
	if(self.cooldowns.abil1 >= 0)
		self.cooldowns.abil1--;
	if(self.cooldowns.abil2 >= 0)
		self.cooldowns.abil2--;
	if(self.cooldowns.abil3 >= 0)
		self.cooldowns.abil3--;
	if(self.cooldowns.abil4 >= 0)
		self.cooldowns.abil4--;
	if(self.cooldowns.abil5 >= 0)
		self.cooldowns.abil5--;
	}
	
	self.checkInteract = function (){
		
		for(var i in Map.list[self.mapNo].doors){
			
			if(self.isCollidingWithBox(Map.list[self.mapNo].doors[i]) && self.pressingE){
				Player.changeMap(self.id, Map.list[self.mapNo].doors[i].toMapNo);
				return true;
			}
		}
		for(var i in Map.list[self.mapNo].npcs){
			
			if(self.isCollidingWithBox(Map.list[self.mapNo].npcs[i]) && self.pressingE){
				Map.list[self.mapNo].npcs[i].interact(self.id);
				return true;
			}
		}
		
		return false;
			
	}
	
	self.levelUp = function(){
		self.level++;
		self.levelPoints = self.levelPoints + 2;
		
		if(self.level == 2){
			self.abil[2] = "fireball";
		}
		else if(self.level == 4){
			self.abil[3] = "windBlast";
		}
		self.updateDataBase();
		
		getPlayerProfile(self.name, function(acData){
			var socket = SOCKET_LIST[self.id];
			socket.emit('init',{selfData: {
				
				
					username:self.name, 
					id:self.id, 
					level : self.level, 
					clas : self.clas, 
					mapNo : self.mapNo, 
					x : self.x, 
					y : self.y, 
					abil : self.abil,
					equiptment :self.equiptment,
					items: self.items,
					levelPoints: self.levelPoints,
					xp: self.xp,
					hat : self.hat, 
					body : self.body, 
					weapon : self.weapon,
					
					strength: self.strength,
					mag: self.mag,
					vit: self.vit,
					def: self.def,
					
			}, level:true});
		});
		
	}
	
	self.updateDataBase = function(){
		getPlayerProfile(self.name, function(res){
			console.log(res);
			cb = function(){}
			updateData = {
				$set:{ 
					username:res.username, 
					id:res.id, 
					level : self.level, 
					clas : self.clas, 
					mapNo : self.mapNo, 
					x : self.x, 
					y : self.y, 
					abil : self.abil,
					equiptment :self.equiptment,
					items: self.items,
					levelPoints: self.levelPoints,
					xp: self.xp,
					hat : self.hat, 
					body : self.body, 
					weapon : self.weapon,
					
					strength: self.strength,
					mag: self.mag,
					vit: self.vit,
					def: self.def,
				}
			}
			db.profiles.update({username:res.username},updateData,{upsert:true},function(err){
					console.log(err);
			});				
		});

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
		else if(data.inputId === 'e')
			player.pressingE = data.state;
		else if(data.inputId === '1')
			player.pressing1 = data.state;
		else if(data.inputId === '2')
			player.pressing2 = data.state;
		else if(data.inputId === '3')
			player.pressing3 = data.state;
		else if(data.inputId === '4')
			player.pressing4 = data.state;
		else if(data.inputId === '5')
			player.pressing5 = data.state;
	});
	
	socket.on('checkInteract', function(data){
		if(Player.list[socket.id].checkInteract()){
			socket.emit('interactResponse', {success:true});
		}
		else{
			socket.emit('interactResponse', {success:false});
		}
		
	});
	
	sendInitalData(socket.id, data.username, socket);
	
	
}


sendInitalData = function(id, username, socket){
	
	getPlayerProfile(username, function(acData){
		playerCharacter = acData;
		socket.emit('init',{
			selfId:id,
			selfData:acData,
			player:Player.getAllInitPack(Player.list[id].mapNo),
			bullet:Bullet.getAllInitPack(Player.list[id].mapNo),
			slime:Slime.getAllInitPack(Player.list[id].mapNo),
			obstacle:getObstacles(Player.list[id].mapNo),
			background:getBackground(Player.list[id].mapNo),
		});
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
				dPlayer.updateDataBase();
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
	self.eff = param.eff;
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
			
			hit = checkMonsterHitBall(self.x,self.y, self.dx, self.dy, self.mapNo);
		
			if(hit != false){
				Monster.list[hit].hp -= self.dmg;
				Monster.list[hit].checkHealth(self.parent);
				self.toRemove = true;
			}
		}
		
		if(self.type == "fireball"){
			
			for(var i in Player.list){
				var p = Player.list[i];
				if(self.isCollidingWithBall(p) && self.parent !== p.id && self.mapNo == p.mapNo){
					
					self.explode(100, 10);
					
				}
			}
			
			hit = checkMonsterHitBall(self.x,self.y, self.dx, self.dy, self.mapNo);
		
			if(hit != false){
				self.explode(100, 10);
			}
			
			if(!isEmpty(self.mapNo, self.x + self.spdX, self.y + self.spdY, self.dx, self.dy)){

				self.explode(100, 10);
				for(var i in Player.list){
				var p = Player.list[i];
				if(self.isCollidingWithBall(p) && self.parent !== p.id && self.mapNo == p.mapNo){
					self.toRemove = true;
					p.hp -= self.dmg;
					p.checkHealth();
					//p.y = Math.random() * 500;

				}
			}
			
			hit = checkMonsterHitBall(self.x,self.y, self.dx, self.dy, self.mapNo);
		
			if(hit != false){
				Monster.list[hit].hp -= self.dmg;
				Monster.list[hit].checkHealth(self.parent);
				self.toRemove = true;
			}	
					
			}		
		}
		
		if(self.type == "windBlast"){
			for(var i in Player.list){
				var p = Player.list[i];
				if(self.isCollidingWithBall(p) && self.parent !== p.id && self.mapNo == p.mapNo){
					self.toRemove = true;
					p.hp -= self.dmg;
					p.checkHealth();
					//p.y = Math.random() * 500;
					p.speedDebufX = Math.cos(self.angle/180*Math.PI)* self.eff;
					p.speedDebufY = Math.sin(self.angle/180*Math.PI)* self.eff;
				}
			}
			
			hit = checkMonsterHitBall(self.x,self.y, self.dx, self.dy, self.mapNo);
		
			if(hit != false){
				Monster.list[hit].hp -= self.dmg;
				Monster.list[hit].checkHealth(self.parent);					
				Monster.list[hit].speedDebufX = Math.cos(self.angle/180*Math.PI)* self.eff;
				Monster.list[hit].speedDebufY = Math.sin(self.angle/180*Math.PI)* self.eff;
				self.toRemove = true;
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
			
			hit = checkMonsterHitBall(explosion.x, explosion.y, explosion.dy, explosion.mapNo);
		
			if(hit != false){
				Monster.list[hit].hp -= dmg;
				Monster.list[hit].checkHealth(self.parent);
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
	self.npcs = [];
	for(var i in data.npcs){
		self.npcs[i] = NPC(data.npcs[i]);
	}
	
	for(var i in self.monsters){
		
		monster = self.monsters[i];
		
		if(monster.type = "slime"){
			self.monsters[i].id = Slime(self.id, monster.x, monster.y);
		}
	}
	
	Map.list[self.id] = self;
	
	
	
	return self;

}

var NPC = function(data){
	
		var self = MapObject(data);
	self.textData = {
		x: self.x - 60,
		y: self.y - 60
	}
	self.rotations = {};
	self.interact = function(id){
	
		if(self.id === 1){
			if(self.rotations[id] == undefined || self.rotations[id] === 0){
				self.textData.text = npcText.t1;
				makeTextBubble(id, self.textData);
				self.rotations[id] = 1;
			}
			else if(self.rotations[id] === 1){
				self.textData.text = npcText.t2;
				makeTextBubble(id, self.textData);
				self.rotations[id] = 0;
			}
		}
	}
	
	return self;
	
}

var makeTextBubble = function(id, data){
	socket = SOCKET_LIST[id];
	
	socket.emit('textBubble', data);
}

Map.list = {};

/*
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
});
*/

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
	
	self.getObstacle = function(){
		return {
			x: self.x,
			y: self.y,
			dx: self.dx,
			dy:self.dy,
			img:self.img,
			id:self.id,
			map: self.map,
		}
	}
	
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

	db.profiles.insert({username:data.username, id:id, level:1, levelPoints: 0, clas: data.pack.clas, mapNo: 2, x:0, y:-100, abil:[], items:[], equiptment:[], xp:0, strength: 1, mag: 1, vit: 1, def: 1, hat:data.pack.hat, body:data.pack.body, weapon:data.pack.weapon}, function(err){
		cb(id);
	});
}

var getPlayerProfile = function(user, cb){
	db.profiles.findOne({username:user}, function(err,res){
		if(res){
			cb(res);
		}
		else{
			cb(null);
		}
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
getMapData("test", Map);


var isEmpty = function(mapNo,x,y,dx,dy){
	for(var i in Map.list[mapNo].obstacles){
		obstacle = Map.list[mapNo].obstacles[i];
		if(x + dx > obstacle.x && x < obstacle.x + obstacle.dx && y + dy > obstacle.y && y < obstacle.y + obstacle.dy){
			
			return false;
			
		}
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
	
	socket.on('changeSetAbil', function(data){
		
		Player.list[data.id].setAbil[data.pos] = data.abilNum;
		
		console.log(Player.list[data.id].setAbil);
		
	});
	
	socket.on('statPlus', function(data){
		Player.list[data.id].levelPoints--;
		if(data.stat == "str"){
			Player.list[data.id].strength++;
		}
		if(data.stat == "vit"){
			Player.list[data.id].vit++;
		}		
		if(data.stat == "mag"){
			Player.list[data.id].mag++;
		}		
		if(data.stat == "def"){
			Player.list[data.id].def++;
		}		
	});
	
	socket.on('evalServer', function(data){
		if(!DEBUG)
			return;
		res = data.split(" ");
		if(res[0] == "levelUp"){
			for(var i in Player.list){
				if(Player.list[i].name == res[1])
					Player.list[i].levelUp();
			}
			return;
		}

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
//Slime(2, 900, -200);


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