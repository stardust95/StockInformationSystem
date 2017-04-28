
function onload() {
    getIndexListInfo();
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
            title: '股票代码'
        },
        {
            field: 'name',
            title: '股票名称'
        },
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
    $.get('/indexlist/list', function (result, status) {
        if( isSuccess(status) ){
            for(let index in result){
                result[index]['index'] = Number(index)+1
            }
            $('#index-list-table').bootstrapTable({
                columns: columns,
                data: result,
                pagination: true,
                
            })
        }else{
            console.log('status = ' + status)
        }
    })
}