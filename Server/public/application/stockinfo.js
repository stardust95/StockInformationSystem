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
}



// gui generation functions
function isSuccess(status) {
    return status === "success"
}

function getStockBasic() {

    var fields = [ '股票代码',
                        '名称',
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
            document.getElementById('trade2').innerHTML = object['trade']
            document.getElementById('change2').innerHTML = object['changepercent']
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
            formatter: 'redFormatter'
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
    var trace1 = {
        x: ['2017-01-04', '2017-01-05', '2017-01-06', '2017-01-09', '2017-01-10', '2017-01-11', '2017-01-12', '2017-01-13', '2017-01-17', '2017-01-18', '2017-01-19', '2017-01-20', '2017-01-23', '2017-01-24', '2017-01-25', '2017-01-26', '2017-01-27', '2017-01-30', '2017-01-31', '2017-02-01', '2017-02-02', '2017-02-03', '2017-02-06', '2017-02-07', '2017-02-08', '2017-02-09', '2017-02-10', '2017-02-13', '2017-02-14', '2017-02-15'],
        close: [116.019997, 116.610001, 117.910004, 118.989998, 119.110001, 119.75, 119.25, 119.040001, 120, 119.989998, 119.779999, 120, 120.080002, 119.970001, 121.879997, 121.940002, 121.949997, 121.629997, 121.349998, 128.75, 128.529999, 129.080002, 130.289993, 131.529999, 132.039993, 132.419998, 132.119995, 133.289993, 135.020004, 135.509995],
        decreasing: {line: {color: '#7F7F7F'}},
        high: [116.510002, 116.860001, 118.160004, 119.43, 119.379997, 119.93, 119.300003, 119.620003, 120.239998, 120.5, 120.089996, 120.449997, 120.809998, 120.099998, 122.099998, 122.440002, 122.349998, 121.629997, 121.389999, 130.490005, 129.389999, 129.190002, 130.5, 132.089996, 132.220001, 132.449997, 132.940002, 133.820007, 135.089996, 136.270004],
        increasing: {line: {color: '#17BECF'}},
        line: {color: 'rgba(31,119,180,1)'},
        low: [115.75, 115.809998, 116.470001, 117.940002, 118.300003, 118.599998, 118.209999, 118.809998, 118.220001, 119.709999, 119.370003, 119.730003, 119.769997, 119.5, 120.279999, 121.599998, 121.599998, 120.660004, 120.620003, 127.010002, 127.779999, 128.160004, 128.899994, 130.449997, 131.220001, 131.119995, 132.050003, 132.75, 133.25, 134.619995],
        open: [115.849998, 115.919998, 116.779999, 117.949997, 118.769997, 118.739998, 118.900002, 119.110001, 118.339996, 120, 119.400002, 120.449997, 120, 119.550003, 120.419998, 121.669998, 122.139999, 120.93, 121.150002, 127.029999, 127.980003, 128.309998, 129.130005, 130.539993, 131.350006, 131.649994, 132.460007, 133.080002, 133.470001, 135.520004],
        type: 'candlestick',
        xaxis: 'x',
        yaxis: 'y'
    };

    let data = [trace1];

    let layout = {
        dragmode: 'zoom',
        margin: {
            r: 10,
            t: 25,
            b: 40,
            l: 60
        },
        showlegend: false,
        xaxis: {
            autorange: true,
            domain: [0, 1],
            range: ['2017-01-03 12:00', '2017-02-15 12:00'],
            rangeslider: {range: ['2017-01-03 12:00', '2017-02-15 12:00']},
            title: 'Date',
            type: 'date'
        },
        yaxis: {
            autorange: true,
            domain: [0, 1],
            range: [114.609999778, 137.410004222],
            type: 'linear'
        }
    };

    Plotly.plot('curve-day', data, layout);
}

function LinkFormatter(value, row) {
    // return value
    return "<a href='"+row.url+"'>"+value+"</a>";
}

function redFormatter(value) {
    return "<span style='color:red'>" + value + "</span>"
}

