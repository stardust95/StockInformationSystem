var code = '000001';
var index_name = '上证指数';
var index_num = 0;
var stock_name = '平安银行';
var stock_num = 0;
function onload() {
    var name = 'active';
    $('#nav-home').removeClass(name).addClass(name);
    $('#nav-index').removeClass(name);
    $('#nav-stock').removeClass(name);

    getIndexInfo();

    getIndexListInfo();
    getStockListInfo();

    drawIndexKCurve(code);
    drawStockKCurve(code);

    getNews();

    getIndustryHistList();

    getCompanyIncList();
    getCompanyDecList();
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

function drawIndexKCurve(code) {
    $.get('/list/curve/index/'+code, function (result, status) {
        if( isSuccess(status) ){
            var data = transformHistData(result);
            $('#index-curve-day').highcharts('StockChart', {
                rangeSelector : {
                    selected : 1
                },
                title : {
                    text : index_name
                },
                series : [{
                    name : 'AAPL',
                    data : data,
                    tooltip: {
                        valueDecimals: 2
                    }
                }]
            });
        }else{
            console.log('status = ' + status)
        }
    })
}

function drawStockKCurve(code, name) {
    $.get('/list/curve/stock/'+code, function (result, status) {
        if( isSuccess(status) ){
            var data = transformHistData(result);
            $('#stock-curve-day').highcharts('StockChart', {
                rangeSelector : {
                    selected : 1
                },
                title : {
                    text : stock_name
                },
                series : [{
                    name : 'AAPL',
                    data : data,
                    tooltip: {
                        valueDecimals: 2
                    }
                }]
            });
        }else{
            console.log('status = ' + status)
        }
    })
}

function getIndexListInfo() {
    let columns = [
        {
            field: 'code',
            title: '指数代码'
        },
        {
            field: 'name',
            title: '指数名称',
            formatter: IndexLinkFormatter
        },
        {
            field: 'change',
            title: '涨跌幅',
            formatter: ChangeFormatter
        },
        {
            field: 'volume',
            title: '成交量'
        },
        {
            field: 'amount',
            title: '成交金额'
        }
    ];
    $.get('/list/data/index/10', function (result, status) {
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

function getStockListInfo() {
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
            field: 'changepercent',
            title: '涨跌幅',
            formatter: ChangeFormatter
        },
        {
            field: 'volume',
            title: '成交量'
        },
        {
            field: 'amount',
            title: '成交金额'
        }
    ];
    $.get('/list/data/stock/10', function (result, status) {
        if( isSuccess(status) ){
            for(let index in result){
                result[index]['index'] = Number(index)+1
            }
            $('#stock-list-table').bootstrapTable({
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
    ];
    $.get('/list/data/news/10', function (arr, status) {
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

function getIndustryHistList(){
    let columns = [
        {
            field: 'industry',
            title: '行业名称'
        },
        {
            field: 'companies',
            title: '公司数'
        },
        {
            field: 'avgprice',
            title: '平均价格'
        },
        {
            field: 'avgp_change',
            title: '平均涨跌幅',
            formatter: ChangeFormatter
        }
    ];
    $.get('/list/data/industry/10', function (result, status) {
        if( isSuccess(status) ){
            $('#industry-hist-table').bootstrapTable({
                columns: columns,
                data: result,
            })
        }else{
            console.log('status = ' + status)
        }

    })
}

function getCompanyIncList(){
    let columns = [
        {
            field: 'code',
            title: '股票代码'
        },
        {
            field: 'name',
            title: '净资产收益率',
            formatter: StockLinkFormatter
        },
        {
            field: 'roe',
            title: '每股收益',
            formatter: ChangeFormatter
        },
        {
            field: 'net_profit_ratio',
            title: '净利润增长',
            formatter: ChangeFormatter
        }
    ];
    $.get('/list/company/inc/10', function (result, status) {
        if( isSuccess(status) ){
            $('#company-inc-table').bootstrapTable({
                columns: columns,
                data: result,
            })
        }else{
            console.log('status = ' + status)
        }

    })
}

function getCompanyDecList(){
    let columns = [
        {
            field: 'code',
            title: '股票代码'
        },
        {
            field: 'name',
            title: '公司名称',
            formatter: StockLinkFormatter
        },
        {
            field: 'roe',
            title: '净资产收益率',
            formatter: ChangeFormatter
        },
        {
            field: 'net_profit_ratio',
            title: '净利润增长',
            formatter: ChangeFormatter
        }
    ];
    $.get('/list/company/dec/10', function (result, status) {
        if( isSuccess(status) ){
            $('#company-dec-table').bootstrapTable({
                columns: columns,
                data: result,
            })
        }else{
            console.log('status = ' + status)
        }

    })
}

//transform json data to 2-d array like below
//[[time_1,volume_2],[time_2,volume_2],[,],...[time_n,volume_n]]
function transformHistData(data) {
    var resArray = [];
    for (let index in data) {
        var unixTime = data[index].date;
        unixTime = new Date(Date.parse(unixTime.replace(/-/g, "/")));
        unixTime = unixTime.getTime();
        var temp = [unixTime, data[index].close];
        resArray.push(temp);
    }
    return resArray;
}

$("#index-list-table").on("mouseover", 'tbody>tr',
    function() {
        var temp = index_name;
        code = $(this).children('td').first().text();
        index_name = $(this).children('td').eq(1).text();
        if ((code!="没有找到匹配的记录")&&(index_name!=temp))
        {
            $("#index-list-table tbody tr").eq(index_num).removeClass('danger');
            drawIndexKCurve(code);
            $(this).addClass('danger');
            index_num = $(this).attr('data-index');
        }
    }
);

$("#stock-list-table").on("mouseover", 'tbody>tr',
    function() {
        var temp = stock_name;
        code = $(this).children('td').first().text();
        stock_name = $(this).children('td').eq(1).text();
        if ((code!="没有找到匹配的记录")&&(stock_name!=temp))
        {
            $("#stock-list-table tbody tr").eq(stock_num).removeClass('danger');
            drawStockKCurve(code);
            $(this).addClass('danger');
            stock_num = $(this).attr('data-index');
        }
    }
);

function IndexLinkFormatter(value, row) {
    // return value
    if(row.url)
        return "<a href='"+row.url+"'>"+value+"</a>";
    if(row.code)
        return "<a href='/index/"+row.code+"'>"+value+"</a>";
}

function StockLinkFormatter(value, row) {
    // return value
    return "<a href='/stock/"+row.code+"'>"+value+"</a>";
}

function ChangeFormatter(value, row) {
    if(value > 0)
        return "<span style='color:#ff0000'>+"+value+"</span>";
    else if(value < 0)
        return "<span style='color:#33ff33'>"+value+"</span>";
    else
        return value;
}