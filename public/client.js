


var socket = new WebSocket('ws://localhost:8081/');
socket.onopen = function(event) {
}

socket.onerror = function(event) {
  log('Error: ' + JSON.stringify(event));
}

socket.onmessage = function (event) {
  log(event.data);
}

socket.onclose = function(event) {
}
var log = function(text) {
  var newobj = JSON.parse(text);
  var partenza = newobj.From;
  var arrivo = newobj.To;
  var mezzo = newobj.Transport;
  var data = newobj.Day;
  var ora = newobj.Hour;
  var adulti = newobj.Adults;
  var bambini = newobj.Children;
  if(mezzo == "train"){
    trains(partenza, arrivo, data, ora, adulti, bambini);
  }
  else {
    geocode(partenza,arrivo,mezzo);
  }
}

window.addEventListener('beforeunload', function() {
  socket.close();
});

function geocode(partenza,arrivo,mezzo){

      var mapoutput = '<iframe width="550"height="350"frameborder="0" style="border:0 display:block; margin:auto"src="https://www.google.com/maps/embed/v1/directions?key=AIzaSyAzT5feLkHC4CY2AG1OWSRNiwO65VK_QBw&origin='+partenza+'&destination='+arrivo+'&mode='+mezzo+'&avoid=tolls|highways" allowfullscreen></iframe>'
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
function Get(uri){
  var Httpreq= new XMLHttpRequest();
  Httpreq.open('GET',uri,false);
  Httpreq.send(null);
  return Httpreq.responseText;
}
  function trains(partenza, arrivo, data, ora, adulti, bambini){
    var fromUrl="https://www.lefrecce.it/msite/api/geolocations/locations?name="+partenza;
    var toUrl="https://www.lefrecce.it/msite/api/geolocations/locations?name="+arrivo;
    var newPartenza=JSON.parse(Get(fromUrl))[0].name;
    var newArrivo=JSON.parse(Get(toUrl))[0].name;
    var viaggioUrl="https://www.lefrecce.it/msite/api/solutions?origin="+newPartenza+"&destination="+newArrivo+"&arflag=A&adate="+data+"&atime="+ora+"&adultno="+adulti+"&childno="+bambini+"&direction=A&frecce=false&onlyRegional=false"
    var viaggio=JSON.parse(Get(viaggioUrl));
    var i;
    for(i=0;i<viaggio.length;i++){//For di Controllo
        var da=new Date(viaggio[i].departuretime);
    console.log(viaggio[i].trainlist[0].trainidentifier+" From: "+viaggio[i].origin+" To: "+viaggio[i].destination+" Tempo: "+viaggio[i].duration+" Partenza: "+da.getHours()+":"+da.getMinutes()+" Prezzo: "+viaggio[i].minprice);
    }
    var minimoP=minCostTrain(viaggio);

    var minimoT=minTempTrain(viaggio);

    document.getElementById('minP').innerHTML = minimoP;
    document.getElementById('minT').innerHTML = minimoT;
  }

  function minCostTrain(data){
        var tmp;
        var i=1;
        var cont=0;
        var min=data[0].minprice;
        if(min==0){
        	min=data[1].minprice;
        	i++;
        }
        for(;i<data.length;i++){
            tmp=data[i].minprice;
            if(data[i].saleable!=false && data[i].minprice!=0){
                if(min>tmp){
                    min=tmp;
                    cont=i;
                }
            }
        }
        var da=new Date(data[cont].departuretime);
        min=min.toString()+" Euro"+" Nome Treno: "+data[cont].trainlist[0].trainidentifier+" From: "+data[cont].origin+" To: "+data[cont].destination+" Ora Partenza: "+da.getHours()+":"+da.getMinutes();
        return min;
    }

function minTempTrain(data){
        var min,tmp,cont;
        cont=0;
        min=parseInt(data[0].duration[0]+data[0].duration[1]+data[0].duration[3]+data[0].duration[4],10);
        for (var i = 1; i < data.length; i++) {
            tmp=parseInt(data[i].duration[0]+data[i].duration[1]+data[i].duration[3]+data[i].duration[4],10);
            if(min>tmp){
                min=tmp;
                cont=i;        
            }
            
        }
        var da=new Date(data[cont].departuretime);
        if(min>999){
            min=min.toString()[0]+min.toString()[1]+":"+min.toString()[2]+min.toString()[3]+" Ore"+" Nome Treno: "+data[cont].trainlist[0].trainidentifier+" From: "+data[cont].origin+" To: "+data[cont].destination+" Ora Partenza: "+da.getHours()+":"+da.getMinutes();
        }else{
            min="0"+min.toString()[0]+":"+min.toString()[1]+min.toString()[2]+" Ore"+" Nome Treno: "+data[cont].trainlist[0].trainidentifier+" From: "+data[cont].origin+" To: "+data[cont].destination+" Ora Partenza: "+da.getHours()+":"+da.getMinutes();
        }
        return min;
    }

