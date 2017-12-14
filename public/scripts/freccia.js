
function freccia(){
    //var trans = document.myForm.transport.value;
    var from = document.myForm.From.value;
    var to = document.myForm.To.value;
    //elements[3] = document.myForm.Departing.value;
    //elements[4] = document.myForm.Returning.value;
    var adults = document.myForm.Adults.value;
    var children = document.myForm.Children.value;
    var fromUrl="https://www.lefrecce.it/msite/api/geolocations/locations?name="+from;
    var toUrl="https://www.lefrecce.it/msite/api/geolocations/locations?name="+to;

    function Get(uri){//Funzione per prendere json da URL
        var Httpreq= new XMLHttpRequest();
        Httpreq.open('GET',uri,false);
        Httpreq.send(null);
        return Httpreq.responseText;
    }
    
    var newFrom=JSON.parse(Get(fromUrl))[0].name;
    console.log("From: "+newFrom);
    var newTo=JSON.parse(Get(toUrl))[0].name;
    console.log("To: "+newTo);
    var viaggioUrl="https://www.lefrecce.it/msite/api/solutions?origin="+newFrom+"&destination="+newTo+"&arflag=A&adate=28/12/2017&atime=17&adultno="+adults+"&childno="+children+"&direction=A&frecce=false&onlyRegional=false"
    var viaggio=JSON.parse(Get(viaggioUrl));
    var i;
    for(i=0;i<viaggio.length;i++){
        var da=new Date(viaggio[i].departuretime);
    console.log(viaggio[i].trainlist[0].trainidentifier+" From: "+viaggio[i].origin+" To: "+viaggio[i].destination+" Tempo: "+viaggio[i].duration+" Partenza: "+da.getHours()+":"+da.getMinutes()+" Prezzo: "+viaggio[i].minprice);
    }
    var minimoP=minCostTrain(viaggio);
    console.log("Costo minimo: "+minimoP);

    var minimoT=minTempTrain(viaggio);
    console.log("Tempo min: "+minimoT);
    var doc = new jsPDF();
    doc.setFontSize(10);
    doc.text(35,25,minimoT);
    doc.text(35,35,minimoP);
    doc.setFontSize(2);
    doc.save('a4.pdf');
    
}
function minCostTrain(data){
        var i,tmp;
        var cont=0;
        var min=data[0].minprice;
        for(i=1;i<data.length;i++){
            tmp=data[i].minprice;
            if(data[i].saleable!=false){
                if(min>tmp){
                    min=tmp;
                    cont=i;
                }
            }
        }
        min=min.toString()+" Nome Treno: "+data[cont].trainlist[0].trainidentifier;
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
        if(min>999){
            min=min.toString()[0]+min.toString()[1]+":"+min.toString()[2]+min.toString()[3]+" Nome Treno: "+data[cont].trainlist[0].trainidentifier;
        }else{
            min="0"+min.toString()[0]+":"+min.toString()[1]+min.toString()[2]+" Nome Treno: "+data[cont].trainlist[0].trainidentifier;
        }
        return min;
    }

