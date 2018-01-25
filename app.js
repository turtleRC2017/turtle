var express = require('express');
var app = express();
var path = require('path');
var uuid = require('uuid');
var amqp = require('amqplib/callback_api');

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use('/static', express.static('public'));
app.use(express.json());

var id;

app.get('/',function(req,res){
	res.sendFile(path.join(__dirname + "/pages/geolocalizzazione.html"))
});

app.get('/auto.html',function(req,res){
	res.sendFile(path.join(__dirname + "/pages/auto.html"))
});

app.post('/formHandler', function(req, res) {
	var objToCheck = {Id:id, Transport:req.body.transport, From:req.body.locationInput1, To:req.body.locationInput2 };
  	var objStringified = JSON.stringify(objToCheck);
  	console.log("********* Request: "+objStringified);
  //================================================================================================// DATA SENDER
  amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var msg = 'IN ATTESA CHE FACCIAMO IL FILE DA CARICARE'
    var q = 'task_queue';
    ch.assertQueue(q, {durable: true});
    ch.sendToQueue(q, new Buffer(msg), {persistent: true});
    console.log(" [x] Sent '%s'", msg);
  });
  //setTimeout(function() { conn.close(); process.exit(0) }, 500);
});
  //=================================================================================================//
});

//Errori generici
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.sendFile(path.join(__dirname + "/pages/error.html"));
});

//Risorse non trovate (404 Not Found)
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.listen(3000,function(){
	console.log('App sta ascoltando su localhost:3000')
})

function generateUuid() {
  return Math.random().toString() +
         Math.random().toString() +
         Math.random().toString();
}