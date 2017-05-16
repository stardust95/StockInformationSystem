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
    buildRiseAndFallTable()
    buildTradeRecordsTable()
    buildHotStocksTable()
    drawKCurve()
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
            index['volume'] = Math.round(index['volume'] / 10000)
            index['amount'] = Math.round(index['amount'])

            for(var prop in index){
                let element = document.getElementById(prop)
                if( element )
                    element.innerText = formatNumber(index[prop])
            }
            document.getElementById('change2').innerHTML = index['change']
            if( index['change'] > 0 ){
                $('#arrow-icon').addClass('fa fa-arrow-up')
                $('#arrow-icon').css('color', 'green')
            }else {
                $('#arrow-icon').addClass('fa fa-arrow-down')
                $('#arrow-icon').css('color', 'red')
            }
        }else{
            console.log('status = ' + status)
        }
    })
}

function buildRiseAndFallTable() {
    var columns = [
        {
            field: 'stock'
        },
        {
            field: 'change'
        }
    ]
    var data = []
    var stocks_demo = [ '中国神华', '青岛海尔', '中国石油', '农业银行', '河钢股份', '世荣兆业', '中化岩土', '贵州茅台', '中国石化' ]
    for(var index in stocks_demo){
        data.push({ stock: stocks_demo[index], change: (Math.random() * 10).toFixed(2) })
    }
    $('#rise-table').bootstrapTable({
        columns: columns,
        data: data
    })
    data = []
    for(var index in stocks_demo){
        data.push({ stock: stocks_demo[stocks_demo.length - index - 1], change: -(Math.random() * 10).toFixed(2) })
    }
    $('#fall-table').bootstrapTable({
        columns: columns,
        data: data
    })
}

function buildHotStocksTable() {
    let columns = [
        {
            field: 'stockName',
            title: '股票'
        },
        {
            field: 'contribution',
            title: '贡献点数',
            formatter: 'redFormatter'
        }
    ]

    $.get('/indexs/hot/' + '000000' + '/10', function (data, status) {      // TODO
        if( isSuccess(status) ){
            $('#hot-table').bootstrapTable({
                columns: columns,
                data: data
            })
        }else{
            console.log('status = ' + status)
        }
    })

}

function buildTradeRecordsTable() {
    let columns = [
        {
            field: 'time',
            title: '时间'
        },
        {
            field: 'price',
            title: '成交价',
            formatter: 'redFormatter'
        },
        {
            field: 'volume',
            title: '成交量'
        },
        {
            field: 'amount',
            title: '成交金额(元)'
        }
    ]
    $.get('/indexs/trades/' + code, function (data, status) {
        if( isSuccess(status) ){
            $('#trade-records-table').bootstrapTable({
                columns: columns,
                data: data
            })
        }else{
            console.log('status = ' + status)
        }
    })
}

function drawKCurve() {
    $.getJSON('https://www.highcharts.com/samples/data/jsonp.php?filename=aapl-ohlcv.json&callback=?', function (data) {

        // split the data set into ohlc and volume
        var ohlc = [],
            volume = [],
            dataLength = data.length,
            // set the allowed units for data grouping
            groupingUnits = [[
                'week',                         // unit name
                [1]                             // allowed multiples
            ], [
                'month',
                [1, 2, 3, 4, 6]
            ]],

            i = 0;

        for (i; i < dataLength; i += 1) {
            ohlc.push([
                data[i][0], // the date
                data[i][1], // open
                data[i][2], // high
                data[i][3], // low
                data[i][4] // close
            ]);

            volume.push([
                data[i][0], // the date
                data[i][5] // the volume
            ]);
        }


        // create the chart
        Highcharts.stockChart('curve-day', {

            rangeSelector: {
                enabled: false
            },

            title: {
                // text: 'AAPL Historical'
            },

            yAxis: [{
                labels: {
                    align: 'right',
                    x: -3
                },
                title: {
                    text: 'OHLC'
                },
                height: '60%',
                lineWidth: 2
            }, {
                labels: {
                    align: 'right',
                    x: -3
                },
                title: {
                    text: 'Volume'
                },
                top: '65%',
                height: '35%',
                offset: 0,
                lineWidth: 2
            }],

            tooltip: {
                split: true
            },

            series: [{
                type: 'candlestick',
                name: 'AAPL',
                data: ohlc,
                dataGrouping: {
                    units: groupingUnits
                }
            }, {
                type: 'column',
                name: 'Volume',
                data: volume,
                yAxis: 1,
                dataGrouping: {
                    units: groupingUnits
                }
            }]
        });
    });
}

function LinkFormatter(value, row) {
    if( row.url )
        return "<a href='"+row.url+"'>"+value+"</a>";
    else if( row.code )
        return "<a href='"+row.code+"'>"+value+"</a>";
    else
        return value;
}
function redFormatter(value) {
    return "<span style='color:red'>" + value + "</span>"
}



