/**
 * Created by stardust on 2017/4/27.
 */

var code = document.getElementById('code').innerText
var index

function onload() {
    var name = 'active';
    $('#nav-home').removeClass(name);
    $('#nav-index').removeClass(name).addClass(name);
    $('#nav-stock').removeClass(name);

    getIndexRealtimeData()
}

function isSuccess(status) {
    return status === "success"
}

function formatNumber(num) {

    if( $.isNumeric(num) && Math.round(num) != num ){
        return Number(num).toFixed(2)
    }else{
        return num
    }
}

function getIndexRealtimeData() {
    $.get('/indexs/info/' + code, function (data, status) {
        if( isSuccess(status) ){
            index = data
            index['uplimit'] = index['preclose'] * 1.1
            index['downlimit'] = index['preclose'] * 0.9
            for(var prop in index){
                let element = document.getElementById(prop)
                if( element )
                    element.innerText = formatNumber(index[prop])
            }
        }else{
            console.log('status = ' + status)
        }
    })
}


