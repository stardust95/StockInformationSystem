import time
import datetime
import pymysql as mysql
import configparser

'''
每天循环
1）庞博将(更新时间，现价，开盘价)插进stockList当天第一条记录
2）updateStockList()每隔5分钟更新表
3）updateIndexList在其后↑更新表
4）updateStockHistData()插入当天的历史记录
5）updateIndexHistData()在其后↑插入当天历史记录
6）DayLast()从stockList获取必要信息
7）DayLast()清空stockList表格
8）DayLast()清空indexList表格
9）DayLast()给stockList插入下一天第一条记录

* indexList和indexHistData完全通过stockList和stockHistData更新
  应注意在个股表已更新时再调用指数表
'''

def dbConfig():
    config = configparser.RawConfigParser()
    config.read('config.ini')
    section = 'database'
    host = config.get(section, 'db_host')
    port = config.get(section, 'db_port')
    dbuser = config.get(section, 'db_user')
    dbpass = config.get(section, 'db_pass')
    dbname = config.get(section, 'db_name')

    port = int(port)

    return host, port, dbuser, dbpass, dbname

# 插入记录需包含(代码，名称，昨日收盘价)
def DayLast():
    print('DayLast()')

    host, port, dbuser, dbpass, dbname = dbConfig()

    conn = mysql.connect(host = host, port = port, user = dbuser, password = dbpass, database = dbname)
    cursor = conn.cursor()

    now = datetime.datetime.now()
    date = now.strftime('%Y-%m-%d')

    cursor.execute('select distinct code, name from stockList')
    stocks = cursor.fetchall()
    Num = len(stocks)

    i = 0
    while i < Num:
        code = stocks[i][0]
        name = stocks[i][1]

        cursor.execute('select price, time from tradeRecords where code = %s and date = %s order by time desc', (code, date))
        price = cursor.fetchall()
        settlement = price[0][0]

		cursor.execute('SET NAMES utf8mb4')
        cursor.execute('insert into stockList values(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)', \
                       (code, name, '', '', '', '', '', '', settlement, '', '', '', '', '', '', '', ''))
        conn.commit()

        i = i + 1

    cursor.execute('delete from stockList where date != %s', ('',))
    conn.commit()

    cursor.execute('truncate table indexList')
    conn.commit()

    conn.close()


'''
现价：五分钟内的平均成交价
涨跌幅：(此次更新的现价 - 上五分钟的现价) / 上五分钟的现价
开盘价：一天之内不变动 需要每天爬取
最高价：这五分钟之内的最高成交价
最低价：这五分钟之内的最低成交价
昨日收盘价：昨日最后一次交易的价格
成交量：这五分钟内∑成交手
换手率：成交量 / outstanding
成交金额：这五分钟内∑成交金额
市盈率：现价/esp
市净率：现价 / (bvps * totals)
流通市值：outstanding * 现价
总市值：totals * 现价
净流入：买成交额 - 卖成交额
'''
def updateStockList():
    print('updateStockList()')

    host, port, dbuser, dbpass, dbname = dbConfig()

    conn = mysql.connect(host = host, port = port, user = dbuser, password = dbpass, database = dbname)
    cursor = conn.cursor()

    # 针对每一支股票做相同的处理
    cursor.execute('select distinct code from stockList')
    codes = cursor.fetchall()
    Num = len(codes)

    nowTime = time.localtime(time.time())

    hour = nowTime[3]
    min = nowTime[4]
    sec = nowTime[5]

    date = datetime.datetime.now().strftime('%Y-%m-%d')
    tagTime = hour * 10000 + min * 100 + sec #当前整型时间戳

    i = 0
    while i < Num:
        code = codes[i][0]

        cursor.execute('select name, date, trade, open, settlement from stockList where code = %s order by date desc', (code,))
        temp = cursor.fetchall()
        name = temp[0][0]
        latest = temp[0][1] #上一次更新时间字符串表示
        lTime = int(latest[0: 2]) * 10000 + int(latest[3: 5]) * 100  #上一次更新时间整型表示
        lastTrade = temp[0][2]
        open = temp[0][3]
        settlement = temp[0][4]

        # 获取公司相关基本信息
        cursor.execute('select outstanding, esp, bvps, totals from stockBasics where name = %s', (name,))
        temp = cursor.fetchall()
        outstanding = temp[0][0]
        esp = temp[0][1]
        bvps = temp[0][2]
        totals = temp[0][3]

        cursor.execute('select time, price, volume, amount, type from tradeRecords where code = %s and \
                        date = %s order by time desc', (code, date))
        records = cursor.fetchall()
        numRec = len(records)

        totalPrice = 0
        maxPrice = 0
        minPrice = 100000000
        totalVolume = 0
        totalAmount = 0
        validNum = 0
        sellAmount = 0
        buyAmount = 0

        j = 0
        while j < numRec:
            rTime = records[j][0]
            rTime = int(rTime[0: 2]) * 10000 + int(rTime[3: 5]) * 100 + int(rTime[6: 8])

            if rTime > lTime and rTime <= tagTime:
                validNum = validNum + 1

                totalPrice = totalPrice + records[j][1]
                if int(records[j][1]) > maxPrice:
                    maxPrice = int(records[j][1])

                if int(records[j][1]) < minPrice:
                    minPrice = int(records[j][1])

                totalVolume = totalVolume + int(records[j][2])
                totalAmount = totalAmount + int(records[j][3])

                if records[j][4] == "买盘":
                    buyAmount = buyAmount + int(records[j][3])
                elif records[j][4] == "卖盘":
                    sellAmount = sellAmount + int(records[j][3])

            j = j + 1

        if validNum == 0:
            validNum = 1

        # 得到所有字段
        code = code
        name = name
        ddate = str(hour) + '-' + str(min)
        trade = totalPrice / validNum
        if lastTrade == 0:
            changepercent = 0 #回头确认下
        else:
            changepercent = (trade - lastTrade) / lastTrade
        open = open
        high = maxPrice
        low = minPrice
        settlement = settlement
        volume = totalVolume
        turnoverratio = volume / outstanding
        amount = totalAmount
        per = trade / esp
        pb = trade / (bvps * totals)
        nmc = outstanding * trade
        mktcap = totals * trade
        flow = buyAmount - sellAmount

		cursor.execute('SET NAMES utf8mb4')
        cursor.execute('insert into stockList values(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)', \
                       (code, name, ddate, changepercent, trade, open, high, low, settlement, volume, turnoverratio, amount, \
                        per, pb, mktcap, nmc, flow))
        conn.commit()

        i = i + 1

    conn.close()


# 假设交易记录表中已保存至少20天的记录
def updateStockHistData():
    print('updateStockHistData()')

    host, port, dbuser, dbpass, dbname = dbConfig()

    conn = mysql.connect(host = host, port = port, user = dbuser, password = dbpass, database = dbname)
    cursor = conn.cursor()

    today = datetime.datetime.now()
    delta = datetime.timedelta(days = 1)
    date = today.strftime('%Y-%m-%d')
    yesterday = (today - delta).strftime('%Y-%m-%d')

    cursor.execute('select distinct code from stockHistData')
    codes = cursor.fetchall()
    Num = len(codes)

    i = 0
    while i < Num:
        code = codes[i][0]
        # 此时stockList中记录均为当天
        cursor.execute('select open, high, low, volume, trade from stockList where code = %s', (code,))
        records = cursor.fetchall()
        open = records[0][0]
        numRec = len(records)

        high = 0
        low = 100000000
        volume = 0
        tradeXvolume = 0

        j = 0
        while j < numRec:
            if high < records[j][1]:
                high = records[j][1]

            if low > records[j][2]:
                low = records[j][2]

            volume = volume + records[j][3]
            tradeXvolume = tradeXvolume + records[j][3] * records[j][4]

            j = j + 1

        cursor.execute('select price, time from tradeRecords where code = %s and date = %s order by time desc', (code, date))
        price = cursor.fetchall()

        if len(price) != 0:
            settlement = price[0][0]
            price_change = settlement - open
            p_change = price_change / open
        else:
            settlement = 0
            price_change = 0
            p_change = 0


        cursor.execute('select ma5, ma10, ma20, v_ma5, v_ma10, v_ma20 from stockHistData where date = %s', (yesterday,))
        temp = cursor.fetchall()
        ma5_l = temp[0][0]
        ma10_l = temp[0][1]
        ma20_l = temp[0][2]
        v_ma5_l = temp[0][3]
        v_ma10_l = temp[0][4]
        v_ma20_l = temp[0][5]

        v_ma5 = volume + v_ma5_l * 0.8
        v_ma10 = volume + v_ma10_l * 0.9
        v_ma20 = volume + v_ma20_l * 0.95
        ma5 = ((ma5_l * v_ma5_l) * 0.8 + tradeXvolume) / v_ma5
        ma10 = ((ma10_l * v_ma10_l) * 0.9 + tradeXvolume) / v_ma10
        ma20 = ((ma20_l * v_ma20_l) * 0.95 + tradeXvolume) / v_ma20

        cursor.execute('SET NAMES utf8mb4')
        cursor.execute('insert into stockHistData values(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)', \
                       (code, date, open, high, settlement, low, volume, price_change, p_change, ma5, ma10, ma20, v_ma5, v_ma10, v_ma20))
        conn.commit()

        i = i + 1

    conn.close()


# 收盘点位字段应该去掉
#indexList应该在每次调用完updateStockList后更新 不自己设时间戳 完全根据个股信息得出
def updateIndexList():
    print('updateIndexList()')

    host, port, dbuser, dbpass, dbname = dbConfig()

    conn = mysql.connect(host = host, port = port, user = dbuser, password = dbpass, database = dbname)
    cursor = conn.cursor()

    date = datetime.datetime.now().strftime('%H-%M-%S')

    cursor.execute('select distinct indexCode, indexName from indexContainStocks')
    indexes = cursor.fetchall()
    indexNum = len(indexes)

    i = 0
    while i < indexNum:
        indexCode = indexes[i][0]
        indexName = indexes[i][1]

        change = 0
        open = 0
        preclose = 0
        high = 0
        low = 0
        volume = 0
        amount = 0
        totalCon = 0

        cursor.execute('select distinct stockCode, contribution from indexContainStocks where indexCode = %s and \
                        contribution != 0', (indexCode,))
        codes = cursor.fetchall()
        codeNum = len(codes)

        j = 0
        while j < codeNum:
            code = codes[j][0]
            contribution = codes[j][1]


            cursor.execute('select changepercent, open, settlement, high, low, volume, amount, date from stockList where \
                         code = %s order by date desc', (code,))
            temp = cursor.fetchall()
            changepercent_ = temp[0][0]
            open_ = temp[0][1]
            settlement_ = temp[0][2]
            high_ = temp[0][3]
            low_ = temp[0][4]
            volume_ = temp[0][5]
            amount_ = temp[0][6]

            totalCon = totalCon + contribution
            change = change + changepercent_ * contribution
            open = open + open_ * contribution
            preclose = preclose + settlement_ * contribution
            high = high + high_ * contribution
            low = low + low_ * contribution
            volume = volume + volume_ * contribution
            amount = amount + amount_ * contribution

            j = j + 1

        amount = amount / 100000000

        change = change / totalCon
        open = open / totalCon
        preclose = preclose / totalCon
        high = high / totalCon
        low = low / totalCon
        volume = volume / totalCon
        amount = amount / totalCon

		cursor.execute('SET NAMES utf8mb4')
        cursor.execute('insert into indexList values(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)', \
                       (i, indexCode, indexName, date, change, open, preclose, '', high, low, volume, amount))
        conn.commit()

        i = i + 1

    conn.close()


#indexHistList应该在每次调用完updateHistStockList后更新 不自己设时间戳 完全根据个股信息得出
def updateIndexHistData():
    print('updateIndexHistData()')

    host, port, dbuser, dbpass, dbname = dbConfig()

    conn = mysql.connect(host = host, port = port, user = dbuser, password = dbpass, database = dbname)
    cursor = conn.cursor()

    date = datetime.datetime.now().strftime('%Y-%m-%d')

    cursor.execute('select distinct indexCode from indexContainStocks')
    indexes = cursor.fetchall()
    indexNum = len(indexes)

    i = 0
    while i < indexNum:
        indexCode = indexes[i][0]

        open = 0
        high = 0
        close = 0
        low = 0
        volume = 0
        price_change = 0
        p_change = 0
        ma5 = 0
        ma10 = 0
        ma20 = 0
        v_ma5 = 0
        v_ma10 = 0
        v_ma20 = 0
        totalCon = 0

        cursor.execute('select distinct stockCode, contribution from indexContainStocks where indexCode = %s and \
                        contribution != 0', (indexCode,))
        codes = cursor.fetchall()
        codeNum = len(codes)

        j = 0
        while j < codeNum:
            code = codes[j][0]
            contribution = codes[j][1]

            cursor.execute('select open, high, close, low, volume, price_change, p_change, ma5, ma10, ma20, v_ma5, \
                         v_ma10, v_ma20, date from stockHistData where code = %s order by date desc', (code,))
            temp = cursor.fetchall()
            open_ = temp[0][0]
            high_ = temp[0][1]
            close_ = temp[0][2]
            low_ = temp[0][3]
            volume_ = temp[0][4]
            price_change_ = temp[0][5]
            p_change_ = temp[0][6]
            ma5_ = temp[0][7]
            ma10_ = temp[0][8]
            ma20_ = temp[0][9]
            v_ma5_ = temp[0][10]
            v_ma10_ = temp[0][11]
            v_ma20_ = temp[0][12]

            totalCon = totalCon + contribution
            open = open + open_ * contribution
            high = high + high_ * contribution
            close = close + close_ * contribution
            low = low + low_ * contribution
            volume = volume + volume_ * contribution
            price_change = price_change + price_change_ * contribution
            p_change = p_change + p_change_ * contribution
            ma5 = ma5 + ma5_ * contribution
            ma10 = ma10 + ma10_ * contribution
            ma20 = ma20 + ma20_ * contribution
            v_ma5 = v_ma5 + v_ma5_ * contribution
            v_ma10 = v_ma10 + v_ma10_ * contribution
            v_ma20 = v_ma20 + v_ma20_ * contribution

            j = j + 1

        open = open / totalCon
        high = high / totalCon
        close = close / totalCon
        low = low / totalCon
        volume = volume / totalCon
        price_change = price_change / totalCon
        p_change = p_change / totalCon
        ma5 = ma5 / totalCon
        ma10 = ma10 / totalCon
        ma20 = ma20 / totalCon
        v_ma5 = v_ma5 / totalCon
        v_ma10 = v_ma10 / totalCon
        v_ma20 = v_ma20 / totalCon

		cursor.execute('SET NAMES utf8mb4')
        cursor.execute('insert into indexHistData values(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)',\
                       (indexCode, date, open, high, close, low, volume, price_change,p_change, ma5, ma10, ma20, v_ma5, v_ma10, v_ma20))
        conn.commit()

        i = i + 1

    conn.close()


if __name__ == '__main__':
    print("test")

    DayLast()
