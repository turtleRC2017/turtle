
var amqp = require('amqplib/callback_api');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;


amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = 'rpc_queue';

    ch.assertQueue(q, {durable: false});
    ch.prefetch(1);
    console.log(' [x] Awaiting RPC requests');
    ch.consume(q, function reply(msg) {
      var req = JSON.parse(msg.content.toString());
      console.log(req.From)
      var fromUrl = "https://www.lefrecce.it/msite/api/geolocations/locations?name=" + req.From;
      var toUrl = "https://www.lefrecce.it/msite/api/geolocations/locations?name=" + req.To;
      var From = JSON.parse(getJSON(fromUrl))[0].name;
      console.log(From);
      var To = JSON.parse(getJSON(toUrl))[0].name;
      console.log(To);
      var travelUrl="https://www.lefrecce.it/msite/api/solutions?origin="+From+"&destination="+To+"&arflag=A&adate=28/12/2017&atime=17&adultno="+req.Adults+"&childno="+req.Children+"&direction=A&frecce=false&onlyRegional=false"
      console.log(getJSON(travelUrl));
      var travel = JSON.parse(getJSON(travelUrl));

      ch.sendToQueue(msg.properties.replyTo,
        new Buffer(JSON.stringify(travel)),
        {correlationId: msg.properties.correlationId});
      ch.ack(msg);
    },{noAck: true});
  });
  
});


function getJSON(url){
        var Httpreq= new XMLHttpRequest();
        Httpreq.open('GET',url,false);
        Httpreq.send(null);
        return Httpreq.responseText;
}

function geocode(){
      function Get(uri){
          var Httpreq= new XMLHttpRequest();
          Httpreq.open('GET',uri,false);
          Httpreq.send(null);
          return Httpreq.responseText;
      }
      var partenza = document.locationForm.locationInput1.value;
      var arrivo = document.locationForm.locationInput2.value;
      var mezzo = document.locationForm.transport.value;

      var mapoutput = '<iframe width="550"height="350"frameborder="0" style="border:0 display:block; margin:auto"src="https://www.google.com/maps/embed/v1/directions?key=AIzaSyAzT5feLkHC4CY2AG1OWSRNiwO65VK_QBw&origin='+partenza+'&destination='+arrivo+'&avoid=tolls|highways" allowfullscreen></iframe>'
      document.getElementById('map').innerHTML = mapoutput;

      var percorso = 'https://maps.googleapis.com/maps/api/directions/json?origin='+partenza+'&destination='+arrivo+'&mode='+mezzo+'&key=AIzaSyAzT5feLkHC4CY2AG1OWSRNiwO65VK_QBw'
      var viaggio=JSON.parse(Get(percorso));

     var i = 0;
     var stepbystep = '';
     var step;
     var km;
     var str = viaggio.routes[0].legs[0].steps;
     
     while(str[i]!=null) {
      step = viaggio.routes[0].legs[0].steps[i].html_instructions;
      km = viaggio.routes[0].legs[0].steps[i].distance.text;
      stepbystep += i + ' - '+step + ' per ' + km + '<br>';
      i+=1;
     }
      document.getElementById('datas').innerHTML = stepbystep;
}



      