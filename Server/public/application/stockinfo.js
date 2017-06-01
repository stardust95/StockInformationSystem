/**
 * Created by stardust on 2017/4/20.
 */

var code = document.getElementById('code').innerText;
var stock;
var company;

function onload() {

    var name = 'active';
    $('#nav-home').removeClass(name);
    $('#nav-index').removeClass(name);
    $('#nav-stock').removeClass(name).addClass(name);

    getStockBasic();
    getRealtimeData();
    drawKCurve();
    buildTradeRecordTable();
    buildQuotesTable();
    buildNewsTable();
    buildCompanyInfoView();
    drawProfitChart();
    buildCommentTable();
}

// gui generation functions
function isSuccess(status) {
    return status === "success"
}

function getStockBasic() {

    var fields = [ '股票名称',
                        '所属行业',
                        '地区',
                        '市盈率',
                        '流通股本(亿)',
                        '总股本(亿)',
                        '总资产(万)',
                        '流动资产',
                        '固定资产',
                        '公积金',
                        '每股公积金',
                        '每股收益',
                        '每股净资',
                        '市净率',
                        '上市日期',
                        '未分利润',
                        '每股未分配',
                        '收入同比(%)',
                        '利润同比(%)',
                        '毛利率(%)',
                        '净利润率(%)',
                        '股东人数']

    $.get('/stocks/info/' + code, function (data, status) {
        if( isSuccess(status) ){
            var table = document.getElementById('stock-basic-table')
            var index = 0
            for(var prop in data){
                table.innerHTML += "<tr>"
                                                        + "<td class='pull-left text-bold'>" + fields[index++] + "</td>"
                                                        + "<td class='pull-right'>" + data[prop] + "</td>"
                                                    + "</tr>"
            }
            stock = data
            buildRankingTable()
        }else {
            console.log('status = ' + status)
        }
    })
}

// data retrieve functions
function getRealtimeData() {

    $.get('/stocks/realtime/' + code, function (object, status) {
        if( isSuccess(status) ){
            object["mktcap"] = Math.floor(object["mktcap"])
            object["nmc"] = Math.floor(object["nmc"])
            object['date'] = object['date'].split('.')[0]
            for(var prop in object){
                let element = document.getElementById(prop)
                if( element )
                    element.innerHTML = object[prop]
            }
            document.getElementById('trade2').innerHTML = Number(object['trade']).toFixed(2)
            document.getElementById('change2').innerHTML = colorFormatter(Number(object['changepercent']).toFixed(2))
            if( object['changepercent'] > 0 ){
                $('#arrow-icon').addClass('fa fa-arrow-up')
                $('#arrow-icon').css('color', 'green')
            }else {
                $('#arrow-icon').addClass('fa fa-arrow-down')
                $('#arrow-icon').css('color', 'red')
            }
        }else{
            console.log("status = " + status)
        }
    })
}

function buildTradeRecordTable() {
    var limit = 5
    $.get('/stocks/trades/' + code + '/' + limit, function (arr, status) {
        if( isSuccess(status) ){
            $('#trade-records-table').bootstrapTable({
                columns: [
                    {
                        field: 'time',
                        title: '时间'
                    },
                    {
                        field: 'price',
                        title: '成交价格',
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
                ],
                data: arr
            })
        }else{
            console.log("status = " + status)
        }
    })

    $.get('/stocks/blocks/' + code + "/" + 10, function (arr, status) {
        if( isSuccess(status) ){
            $('#block-records-table').bootstrapTable({
                columns: [
                    {
                        field: 'price',
                        title: '成交价'
                    },
                    {
                        field: 'change',
                        title: '平均溢价',
                        formatter: 'redFormatter'
                    },
                    {
                        field: 'volume',
                        title: '成交量(万股)'
                    },
                    {
                        field: 'date',
                        title: '日期'
                    }
                ],
                data: arr
            })
        }else{
            console.log("status = " + status)
        }
    })
}

function buildQuotesTable() {
    var number = ['①', '②', '③', '④', '⑤']
    $.get('/stocks/quotes/' + code, function (data, status) {
        if( isSuccess(status) ){
            var arr = []
            var types = ['卖', '买']
            for(let index in types){
                for(let i=1; i<=5; i++){
                    arr.push({
                        'i': types[index] + number[i-1],
                        'p': data['a'+i+'_p'],
                        'v': data['a'+i+'_v']
                    })
                }
            }

            $('#quotes-table').bootstrapTable({
                columns: [
                    {
                        field: 'i'      // index
                        // title: ''
                    },
                    {
                        field: 'p',      // price
                        title: '交易价格',
                        formatter: 'redFormatter'
                    },
                    {
                        field: 'v',  // value
                        title: '交易量'
                    },
                ],
                data: arr
            })
        }else{
            console.log('status = ' + status)
        }
    })
}

function buildCompanyInfoView() {
    $.get('/stocks/comp/' + code, function (object, status) {
        if( isSuccess(status) ){
            var treeview = document.getElementById('company-info-list')
            for(var prop in object){
                treeview.innerHTML += "<p> · " + prop + "： " + object[prop] + "</p>"
                // treeview.appendChild("<li>" + prop + "： " + object[prop])
            }
        }else {
            console.log('status = ' + status)
        }
    })
}

function buildRankingTable() {
    let columns = [
        {
            field: 'index',
            title: '排名'
        },
        {
            field: 'name',
            title: '股票名称',
            formatter: 'LinkFormatter'
        },
        {
            field: 'trade',
            title: '当前价格'
        },
        {
            field: 'changepercent',
            title: '涨跌幅',
            formatter: 'colorFormatter'
        },
        {
            field: 'mktcap',
            title: '市值'
        },
        {
            field: 'per',
            title: '市盈率'
        }
    ]

    $.get('/stocks/rank/industry/' + stock.industry + "/10", function (result, status) {
        if( isSuccess(status) ){
            for(let index in result){
                result[index]['index'] = Number(index)+1
                result[index]['mktcap'] = Math.round(result[index]['mktcap'])
            }
            $('#industry-rank-table').bootstrapTable({
                columns: columns,
                data: result
            })
        }else{
            console.log('status = ' + status)
        }
    })

    $.get('/stocks/rank/area/' + stock.area + "/10", function (result, status) {
        if( isSuccess(status) ){
            for(let index in result){
                result[index]['index'] = Number(index)+1
                result[index]['mktcap'] = Math.round(result[index]['mktcap'])
            }
            $('#area-rank-table').bootstrapTable({
                columns: columns,
                data: result
            })
        }else{
            console.log('status = ' + status)
        }
    })

    document.getElementById('rank-field').innerText = stock.area

    $('#rank-tab a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var elem = document.getElementById('rank-field')
        if( e.target.innerText === "同行业个股" ){
            elem.innerHTML = stock.industry
        }else{
            elem.innerHTML = stock.area
        }
    })
}

function buildNewsTable() {
    var columns = [
        {
            field: 'title',
            formatter: 'LinkFormatter'
        },
        {
            field: 'date'
        }
    ]
    $.get('/stocks/news/' + code + "/10", function (arr, status) {
        if( isSuccess(status) ){
            $('#stock-news-table').bootstrapTable({
                columns: columns,
                data: arr
            })
        }else {
            console.log('status = ' + status)
        }
    })

    $.get('/stocks/newslist/10', function (arr, status) {
        if( isSuccess(status) ){
            $('#financial-news-table').bootstrapTable({
                columns: [{ field: 'classify' }].concat(columns),
                data: arr
            })
        }else {
            console.log('status = ' + status)
        }
    })

}

function drawProfitChart() {
    $.get('/stocks/profit/'+code, function (arr, status) {
        if( isSuccess(status) ){
            var dates = []
            var business_incomes = []
            var net_profit_ratios = []
            var net_profits = []
            for(var index in arr){
                // if( !dates.includes(arr[index]['date']) ){
                dates.push(arr[index]['date'])
                business_incomes.push(arr[index]['business_income'])
                net_profit_ratios.push(arr[index]['net_profit_ratio'])
                net_profits.push(arr[index]['net_profits'])
                // }
            }
            $('#profit-chart').highcharts({
                title: {
                    text: ''
                },
                xAxis: {
                    categories: dates
                },
                yAxis: [{ // Primary yAxis
                    labels: {
                        format: '{value}%',
                        style: {
                            color: Highcharts.getOptions().colors[2]
                        }
                    },
                    title: {
                        text: '净利润率',
                        style: {
                            color: Highcharts.getOptions().colors[2]
                        }
                    },
                    opposite: true
                }, { // Secondary yAxis
                    gridLineWidth: 0,
                    title: {
                        text: '净利润',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        }
                    },
                    labels: {
                        format: '{value} ',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        }
                    }
                }, { // Tertiary yAxis
                    gridLineWidth: 0,
                    title: {
                        text: '营业收入',
                        style: {
                            color: Highcharts.getOptions().colors[1]
                        }
                    },
                    labels: {
                        format: '{value} ',
                        style: {
                            color: Highcharts.getOptions().colors[1]
                        }
                    },
                    opposite: true
                }],
                tooltip: {
                    shared: true
                },
                legend: {       // ?
                    layout: 'vertical',
                    align: 'left',
                    x: 80,
                    verticalAlign: 'top',
                    y: 55,
                    floating: true,
                    backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
                },
                series: [{
                    name: '净利润',
                    type: 'column',
                    yAxis: 1,
                    data: net_profits,
                    tooltip: {
                        valueSuffix: ' 万元'
                    }
                }, {
                    name: '营业收入',
                    type: 'column',
                    yAxis: 2,
                    data: business_incomes,
                    marker: {
                        enabled: false
                    },
                    tooltip: {
                        valueSuffix: ' 百万'
                    }
                }, {
                    name: '净利润率',
                    type: 'spline',
                    data: net_profit_ratios,
                    tooltip: {
                        valueSuffix: ' %'
                    }
                }]
            })
        }else{
            console.log('status = ' + status)
        }
    })

}


function drawKCurve() {
    $.getJSON('/stocks/hist/' + code, function (data) {
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
                Date.parse(data[i]["date"]), // the date
                data[i]["open"], // open
                data[i]["high"], // high
                data[i]["low"], // low
                data[i]["close"] // close
            ]);

            volume.push([
                Date.parse(data[i]["date"]), // the date
                data[i]["volume"] // the volume
            ]);
        }
        console.log(ohlc);
        // create the chart
        Highcharts.stockChart('stock-curve-day', {

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
                    // units: groupingUnits
                }
            }, {
                type: 'column',
                name: 'Volume',
                data: volume,
                yAxis: 1,
                dataGrouping: {
                    // units: groupingUnits
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

function colorFormatter(value) {
    if( value < 0 )
        return "<span style='color:red'>" + value + "</span>"
    else
        return "<span style='color:green'>+" + value + "</span>"
}

function redFormatter(value) {
    return "<span style='color:red'>" + value + "</span>"
}

