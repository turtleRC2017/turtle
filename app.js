var express = require('express');
var app = express();
var path = require('path');
var uuid = require('uuid');
var amqp = require('amqplib/callback_api');
var WSS = require('ws').Server;
var http = require('http');

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use('/static', express.static('public'));
app.use(express.json());


var id;

app.get('/',function(req,res){
	res.sendFile(path.join(__dirname + "/pages/login.html"))
});

app.get('/auto.html',function(req,res){
	res.sendFile(path.join(__dirname + "/pages/auto.html"))
});

app.get('/oauth2callback',function(req,res){
	res.sendFile(path.join(__dirname + "/pages/index.html"))
});

app.post('/formHandler', function(req, res) {
	
	var objToCheck = {Id:id, Transport:req.body.transport, From:req.body.locationInput1, To:req.body.locationInput2, Day:req.body.day, Hour:req.body.hour, Adults:req.body.adults, Children:req.body.children };
  	var msg = JSON.stringify(objToCheck);
  	console.log(msg);
  	
 /*//================================================================================================// DATA SENDER
  amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = 'task_queue';
    

  	console.log("RABBIT  ********* Request: "+ msg);
    ch.assertQueue(q, {durable: true});
    ch.sendToQueue(q, new Buffer(msg), {persistent: true});
    console.log("RABBIT [x] Sent '%s'", msg);
  	});
  	setTimeout(function() { conn.close(); process.exit(0) }, 500);
	});
  //=================================================================================================//*/
  var wss = new WSS({ port: 8081 });
		wss.on('connection', function(socket) {
		  console.log('WEBSOCKET Opened Connection 🎉');

		  socket.send(msg);
		  console.log('WEBSOCKET Sent: ' + msg);

		  socket.on('close', function() {
		    console.log('WEBSOCKET Closed Connection 😱');
		});
	});

	
  res.writeHead(302, {
  	Location: 'http://localhost:8080'
  });
  res.end();
		  
});

//Errori generici
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.sendFile(path.join(__dirname + "/pages/error.html"));
});

/*Risorse non trovate (404 Not Found)
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});*/

app.listen(3000,function(){
	console.log('App sta ascoltando su localhost:3000')
})

var app = express().use(express.static('public'));
var server = http.createServer(app);
server.listen(8080, '127.0.0.1');


function generateUuid() {
  return Math.random().toString() +
         Math.random().toString() +
         Math.random().toString();
}