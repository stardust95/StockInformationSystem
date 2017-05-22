var list_kind;

function onload() {

    var name = 'active';
    $('#nav-home').removeClass(name);
    $('#nav-index').removeClass(name).addClass(name);
    $('#nav-stock').removeClass(name);
    list_kind = $('title').text();
    if (list_kind == "指数列表")
        getIndexListInfo();
    else if (list_kind == "股票列表")
        getStockListInfo();
    else if (list_kind == "新闻列表")
        getFinaNewsList();
    else if(list_kind == "板块列表")
        getIndustryListInfo();
}

function isSuccess(status) {
    return status === "success"
}

function getIndexListInfo() {
    let columns = [
        {
            field: 'index',
            title: '序号'
        },
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
    $.get('/list/data/index/-1', function (result, status) {
        if( isSuccess(status) ){
            for(let index in result){
                result[index]['index'] = Number(index)+1
            }
            $('#list-table').bootstrapTable({
                columns: columns,
                data: result,
                pagination: true,
                search: true,
            })
        }else{
            console.log('status = ' + status)
        }
    })
}

function getStockListInfo() {
    let columns = [
        {
            field: 'index',
            title: '序号'
        },
        {
            field: 'code',
            title: '股票代码'
        },
        {
            field: 'name',
            title: '股票名称',
            formatter: StockLinkFormatter
        },
        {
            field: 'change',
            title: '涨跌幅',
            formatter: ChangeFormatter
        },
        {
            field: 'trade',
            title: '现价'
        },
        {
            field: 'open',
            title: '开盘价'
        },
        {
            field: 'high',
            title: '最高价'
        },
        {
            field: 'low',
            title: '最低价'
        },
        {
            field: 'settlement',
            title: '昨日收盘价'
        },
        {
            field: 'volume',
            title: '成交量'
        },
        {
            field: 'turnoverratio',
            title: '换手率'
        },
        {
            field: 'amount',
            title: '成交金额'
        },
        {
            field: 'per',
            title: '市盈率'
        },
        {
            field: 'pb',
            title: '市净率'
        },
        {
            field: 'mktcap',
            title: '总市值'
        }
    ];
    $.get('/list/data/stock/-1', function (result, status) {
        if( isSuccess(status) ){
            for(let index in result){
                result[index]['index'] = Number(index)+1
            }
            $('#list-table').bootstrapTable({
                columns: columns,
                data: result,
                pagination: true,
                search: true,
            })
        }else{
            console.log('status = ' + status)
        }
    })
}

function getFinaNewsList(){
    var columns = [
        {
            field: 'classify',
            title: '类型'
        },
        {
            field: 'title',
            title: '标题',
            formatter: NewsLinkFormatter
        },
        {
            field: 'date',
            title: '发布时间'
        }
    ]

    $.get('/list/data/news/-1', function (result, status) {
        if( isSuccess(status) ){
            $('#list-table').bootstrapTable({
                columns: columns,
                data: result,
                pagination: true,
                search: true,
            })
        }else{
            console.log('status = ' + status)
        }
    })
}
/*
function getStockNewsList(){
    var columns = [
        {
            field: 'code',
            title: '代码',
            formatter: 'IndexLinkFormatter'
        },
        {
            field: 'title',
            title: '标题',
            formatter: 'IndexLinkFormatter'
        },
        {
            field: 'date',
            title: '发布时间'
        }
    ]

    $.get('/newslist/stock', function (result, status) {
        if( isSuccess(status) ){
            $('#stock-news-table').bootstrapTable({
                columns: columns,
                data: result,
                pagination: true,
                search: true,
            })
        }else{
            console.log('status = ' + status)
        }
    })
}
*/

function getIndustryListInfo() {
    let columns = [
        {
            field: 'index',
            title: '序号'
        },
        {
            field: 'industry',
            title: '行业名称'
        },
        {
            field: 'date',
            title: '日期'
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
            field: 'avgchange',
            title: '平均涨跌额',
            formatter: ChangeFormatter
        },
        {
            field: 'avgp_change',
            title: '平均涨跌幅',
            formatter: ChangeFormatter
        },
        {
            field: 'volume',
            title: '总手'
        },
        {
            field: 'amount',
            title: '总成交额'
        }
    ];
    $.get('/list/data/industry/-1', function (result, status) {
        if( isSuccess(status) ){
            for(let index in result){
                result[index]['index'] = Number(index)+1
            }
            $('#list-table').bootstrapTable({
                columns: columns,
                data: result,
                pagination: true,
                search: true,
            });
        }else{
            console.log('status = ' + status)
        }

    })
}





function IndexLinkFormatter(value, row) {
    // return value
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
}

function NewsLinkFormatter(value, row) {
    // return value
    return "<a href='"+row.url+"'>"+value+"</a>";
}