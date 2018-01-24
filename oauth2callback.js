//Il pulsante per loggarsi dovrà fare un redirect a questo indirizzo per ottenere l'autorization code!!!
//const oauthlink = "https://www.dropbox.com/oauth2/authorize?client_id=3mhf044h5pnry7b&response_type=code&redirect_uri=http://localhost:3000/oauth2callback

const Dropbox 	= require("dropbox")
const express   = require("express")
const request   = require("request")

const router    = express.Router()

const url       = "http://localhost:3000"

router.get("/", (req, res) => {
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
                redirect_uri:   'http://localhost:3000/oauth2callback'
            }
        }, (err, resp, body) => {
            if (err) res.send("Connection error")
            var obj = JSON.parse(body)
            var token = obj.access_token		//qui viene restituito il token dell'utente che si connette
            token   = token.replace(new RegExp('"', 'g'), '') //sostituisce " con spazio
        var dbx = new Dropbox({ accessToken: token });

        	fs.readFile(filePath, 'utf8', function (err, contents) {
            	dbx.filesUpload({
                path: fileName,  //carica su main path
                contents: contents,
                mode: 'overwrite'                   //sovrascrive file se gia esiste
            	}) .then(function (response) {
                console.log("fileName" + "caricato su Dropbox!")
            	}).catch(function (err) {
                console.log(err);
            	});
        	})
})

module.exports = router
