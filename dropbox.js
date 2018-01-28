"use strict";

const Dropbox   = require('dropbox');
const express   = require("express");
const app       = express()
const path      = require('path')
const router    = express.Router()
const request   = require('request')
const fs        = require('fs')
var amqp = require('amqplib/callback_api');

app.get('/',function(req,res){
    var token = req.query.access_token
    if (!token) //richiedo il token se non c'è
        res.sendFile(path.join(__dirname + "/pages/login.html"))
    else { //se ho il token carico file su dropbox
        token   = token.replace(new RegExp('"', 'g'), '') //sostituisce " con spazio
        var dbx = new Dropbox({ accessToken: token });
        
        let fileName = "grazie.txt"
        let filePath = "pages/"+fileName
        fs.readFile(filePath, 'utf8', function (err, contents) {
            dbx.filesUpload({
        path: '/Turtle/'+fileName,  //carica su main path
        contents: contents,
        mode: 'overwrite'                   //sovrascrive file se gia esiste
    }) .then(function (response) {
        console.log(fileName + " caricato su Dropbox!")
        res.sendFile(path.join(__dirname + "/pages/exit.html"))

    }).catch(function (err) {
        console.log(err);
        res.send(err)
    });
})
    }
});

app.get("/oauth2callback", (req, res) => {
    if (req.query.error) res.send("Error occured while retrieving authorization code")

        var auth_code = req.query.code
    console.log('Authorization Code ottenuto: '+auth_code);

    request.post(
    {
        url: 'https://api.dropboxapi.com/oauth2/token',
            qs: { //query string, costruisce la stringa di richiesta con i parametri
                code:           auth_code,
                grant_type:     'authorization_code',
                client_id:      '3mhf044h5pnry7b',
                client_secret:  '31h8ifqbkwohmch',
                redirect_uri:   'http://localhost:4000/oauth2callback'
            }
        }, (err, resp, body) => {
            if (err) res.send("Connection error")
                var obj = JSON.parse(body)
            var token = obj.access_token        //qui viene restituito il token dell'utente che si connette
            console.log('token ottenuto: '+token);
            res.redirect("http://localhost:4000?access_token=%22" + token + "%22")
        })

    amqp.connect('amqp://localhost', function(err, conn) {
        conn.createChannel(function(err, ch) {
            var q = 'task_queue';
            var data = new Date();
            var Day,Month,Year, Hh, Mm, Ss, mm;
            Day = data.getDate() + "/";
            Month = data.getMonth() + "/";
            Year = data.getFullYear();
            Hh = data.getHours() + ":";
            Mm = data.getMinutes() + ":";
            Ss = data.getSeconds() + ":";
            mm = data.getMilliseconds() + ":";
            var msg = Day+Month+Year+" at "+Hh+Mm+Ss+mm;
            console.log("RABBIT  ********* Request: "+ msg);
            ch.assertQueue(q, {durable: true});
            ch.sendToQueue(q, new Buffer(msg), {persistent: true});
            console.log("RABBIT [x] Sent '%s'", msg);
        });
        //setTimeout(function() { conn.close(); process.exit(0) }, 500);
    });

})


app.use('/static', express.static('public'));

app.listen(4000,function(){
    console.log('App sta ascoltando su localhost:4000')
})