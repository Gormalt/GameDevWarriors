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

var Map = function(data){

	var self = {};
	self.id = data.id;
	self.name = data.name;
	self.obstacles = data.obstacles;
	self.monsters = data.monsters;
	self.background = data.background;
	self.doors = data.doors;
	
	self.npcs = data.npcs;
	
	Map.list[self.id] = self;
	
	return self;

}

Map.list = {};

Map({
	id:2,
	name:"test",
	obstacles:[
{
	img:1,
	x:-800, 
	y:10, 
	dx:10000, 
	dy:400,
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
},
{
	img:0,
	x:-600, 
	y:-610, 
	dx:100, 
	dy:600,
	id:5	
}
],
monsters:[{
	type: "slime",
	x: 120,
	y: -150,
}],
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
},
{
	img:0,
	x:400,
	y:-70,
	dx:40,
	dy:80,
	id:5,	
}
],
doors:[{
	img: 0,
	x:800,
	y: -150,
	dx:100,
	dy:150,
	id:3,
	bid:2,
	toMapNo:3,
}],
npcs:[{
	img:0,
	x:400,
	y:-70,
	dx:40,
	dy:80,
	id:1,
	bid:5,
}]
});

db.maps.update({name:"test"},{$set:Map.list[2]}, function(err){

});