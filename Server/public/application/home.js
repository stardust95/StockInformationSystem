var code = '000001'

function onload() {
    var name = 'active';
    $('#nav-home').removeClass(name).addClass(name);
    $('#nav-index').removeClass(name);
    $('#nav-stock').removeClass(name);

    getIndexInfo();
    drawKCurve();
    getIndexListInfo();
    getNews();
    getHistroyRecord();
    getPersonalStock();
}

function isSuccess(status) {
    return status === "success"
}

function getIndexInfo() {
	let columns = [
        {
            field: 'change',
            title: '涨跌幅'
        },
        {
            field: 'open',
            title: '开盘点位'
        },
        {
            field: 'preclose',
            title: '昨日收盘点位'
        },
        {
            field: 'close',
            title: '收盘点位'
        },
        {
            field: 'high',
            title: '最高点位'
        },
        {
            field: 'low',
            title: '最低点位'
        },
        {
            field: 'volume',
            title: '成交量'
        },
        {
            field: 'amount',
            title: '成交金额'
        }
    ]
    $.get('/indexs/info/'+code, function (result, status) {     // result is object instead of array
        if( isSuccess(status) ){
            $('#index-info-table').bootstrapTable({
                columns: columns,
                data: [result]
            })
        }else{
            console.log('status = ' + status)
        }
    })
}

function drawKCurve() {
    $.getJSON('//data.jianshukeji.com/jsonp?filename=json/aapl-c.json&callback=?', function (data) {
        // Create the chart
        $('#curve-day').highcharts('StockChart', {
            rangeSelector : {
                selected : 1
            },
            title : {
                text : '上证指数'
            },
            series : [{
                name : 'AAPL',
                data : data,
                tooltip: {
                    valueDecimals: 2
                }
            }]
        });
    });
}

function getIndexListInfo() {
    let columns = [
        {
            field: 'code',
            title: '股票代码'
        },
        {
            field: 'name',
            title: '股票名称',
            formatter: IndexLinkFormatter
        },
        {
            field: 'change',
            title: '涨跌幅'
        },
        {
            field: 'volume',
            title: '成交量'
        },
        {
            field: 'amount',
            title: '成交金额'
        }
    ]
    $.get('/indexlist/list', function (result, status) {
        if( isSuccess(status) ){
            for(let index in result){
                result[index]['index'] = Number(index)+1
            }
            $('#index-list-table').bootstrapTable({
                columns: columns,
                data: result.slice(0,8),
                })
        }else{
            console.log('status = ' + status)
        }
    })
}

function getNews(){
    //暂时调
    var columns = [
        {
            field: 'title',
            formatter: 'IndexLinkFormatter'
        },
        {
            field: 'date'
        }
    ]
    $.get('/stocks/newslist/10', function (arr, status) {
        if( isSuccess(status) ){
            $('#financial-news-table').bootstrapTable({
                columns: [{ field: 'classify' }].concat(columns),
                data: arr,
            })
        }else {
            console.log('status = ' + status)
        }
    })
}

function getHistroyRecord(){

}

function getPersonalStock(){

}

function IndexLinkFormatter(value, row) {
    // return value
    return "<a href='/index/"+row.code+"'>"+value+"</a>";
}

function StockLinkFormatter(value, row) {
    // return value
    return "<a href='/stock/"+row.code+"'>"+value+"</a>";
}