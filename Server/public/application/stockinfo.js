/**
 * Created by stardust on 2017/4/20.
 */


function onload() {
    getRealtimeData();
}



// gui generation functions
function buildTitle(){

}

// data retrieve functions
function getRealtimeData() {

    $.get('/stocks/realtime/000001', function (object, status) {
        if( status === "success" ){
            for(var prop in object){
                let element = document.getElementById(prop)
                if( element )
                    element.innerHTML = object[prop];
            }
        }else{
            console.log("status = " + status)
        }
    })
}
