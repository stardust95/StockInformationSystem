
function onload() {

    var name = 'active';
    $('#nav-home').removeClass(name);
    $('#nav-index').removeClass(name).addClass(name);
    $('#nav-stock').removeClass(name);

    getIndexListInfo();
}

function isSuccess(status) {
    return status === "success"
}

function getIndexListInfo() {
	let columns = [
        {
            field: 'code',
            title: '股票代码',
            sortable: true
        },
        {
            field: 'name',
            title: '股票名称',
            formatter: LinkFormatter,
            sortable: true
        },
        {
            field: 'change',
            title: '涨跌幅',
            formatter:colorFormatter,
            sortable: true
        },
        {
            field: 'open',
            title: '开盘点位',
            sortable: true
        },
        {
            field: 'preclose',
            title: '昨日收盘点位',
            sortable: true
        },
        {
            field: 'close',
            title: '收盘点位',
            sortable: true
        },
        {
            field: 'high',
            title: '最高点位',
            sortable: true
        },
        {
            field: 'low',
            title: '最低点位',
            sortable: true
        },
        {
            field: 'volume',
            title: '成交量',
            sortable: true
        },
        {
            field: 'amount',
            title: '成交金额',
            sortable: true
        }
    ]
    $.get('/indexlist/list', function (result, status) {
        if( isSuccess(status) ){
            for(let index in result){
                result[index]['index'] = Number(index)+1
            }
            $('#index-list-table').bootstrapTable({
                columns: columns,
                data: result,
                pagination: true,
                sortable: true
            })
        }else{
            console.log('status = ' + status)
        }
    })
}

function LinkFormatter(value, row) {
    // return value
    return "<a href='/index/"+row.code+"'>"+value+"</a>";
}



function colorFormatter(value) {
    if( value < 0 )
        return "<span style='color:red'>" + value + "</span>"
    else
        return "<span style='color:green'>+" + value + "</span>"
}
