var express = require('express');
var app = express();
var path = require('path');
var amqp = require('amqplib/callback_api');
var WSS = require('ws').Server;
var http = require('http');
var fs = require('fs')

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use('/static', express.static('public'));
app.use(express.json());

var id;

app.get('/',function(req,res){
	res.sendFile(path.join(__dirname + "/pages/index.html"))
});



app.post('/formHandler', function(req, res) {
	var objToCheck = {Id:id, Transport:req.body.transport, From:req.body.locationInput1, To:req.body.locationInput2, Day:req.body.day, Hour:req.body.hour, Adults:req.body.adults, Children:req.body.children };
  	var msg = JSON.stringify(objToCheck);
  	console.log(msg);

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