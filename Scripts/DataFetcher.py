#coding=utf-8
import pymysql, configparser
import datetime
import tushare as ts
import pandas as pd
from sqlalchemy import create_engine
from traceback import print_exc
from abc import ABCMeta, abstractmethod, abstractproperty

"""
Test with python 3.6

MySQL use 'utf8mb4' characterset

API provided at http://tushare.org/trading.html

"""
def getTime():
    return str(datetime.datetime.now())
    
def connectConfigDB(section, configName = 'config.ini'):
    config = configparser.RawConfigParser()
    config.read(configName)
    host = config.get(section, 'db_host')
    dbuser = config.get(section, 'db_user')
    dbpass = config.get(section, 'db_pass')
    dbname = config.get(section, 'db_name')
    return pymysql.connect(host=host, user=dbuser, passwd=dbpass, db=dbname, charset="utf8mb4"), dbname

def createDbEngine(section, configName = 'config.ini'):
    config = configparser.RawConfigParser()
    config.read(configName)
    host = config.get(section, 'db_host')
    dbuser = config.get(section, 'db_user')
    dbpass = config.get(section, 'db_pass')
    dbname = config.get(section, 'db_name')
    return create_engine('mysql+pymysql://%s:%s@%s/%s?charset=utf8mb4' % (dbuser, dbpass, host, dbname), convert_unicode=True)
    
class Singleton(object):
    _instance = None
    def __new__(cls, *args, **kwargs):
        if not isinstance(cls._instance, cls):
            cls._instance = object.__new__(cls, *args, **kwargs)
        return cls._instance

class IDataFetcher(object):

    __metaclass__ = ABCMeta

    @abstractmethod
    def fetchByName(self, name):
        pass

    @abstractmethod
    def fetchByCode(self, code):
        pass

    @abstractmethod
    def fetchByIndustry(self, industry):      # fetchByType
        pass

    @abstractmethod
    def fetchAll(self):
        pass

    # def getOperations(self):
        # pass

class StockInfoFetcher(IDataFetcher):
    def __init__(self):
        pass

    def fetchByName(self, name):
        raise NotImplementedError()
    
    def fetchByCode(self, code):
        raise NotImplementedError()

    def fetchByIndustry(self, industry):
        raise NotImplementedError()

    def fetchAll(self):
        tableName = 'stockBasics'
        param = []
        try:
            db, dbname = connectConfigDB('database')
            cursor = db.cursor()
            cursor.execute("SET NAMES utf8mb4;")
            cursor.execute("DROP TABLE IF EXISTS %s" % tableName)
            sql = """
                CREATE TABLE `%s`.`%s` (
                    `code` VARCHAR(10) NOT NULL COMMENT '股票代码',
                    `name` VARCHAR(45) NOT NULL COMMENT '名称',
                    `industry` VARCHAR(45) NULL COMMENT '所属行业',
                    `area` VARCHAR(45) NULL COMMENT '地区',
                    `pe` DOUBLE NULL COMMENT '市盈率',
                    `outstanding` DOUBLE NULL COMMENT '流通股本(亿)',
                    `totals` DOUBLE NULL COMMENT '总股本(亿)',
                    `totalAssets` DOUBLE NULL COMMENT '总资产(万)',
                    `liquidAssets` DOUBLE NULL COMMENT '流动资产',
                    `fixedAssets` DOUBLE NULL COMMENT '固定资产',
                    `reserved` DOUBLE NULL COMMENT '公积金',
                    `reservedPerShare` DOUBLE NULL COMMENT '每股公积金',
                    `esp` DOUBLE NULL COMMENT '每股收益',
                    `bvps` DOUBLE NULL COMMENT '每股净资',
                    `pb` DOUBLE NULL COMMENT '市净率',
                    `timeToMarket` VARCHAR(45) NULL COMMENT '上市日期',
                    `undp` DOUBLE NULL COMMENT '未分利润',
                    `perundp` DOUBLE NULL COMMENT '每股未分配',
                    `rev` DOUBLE NULL COMMENT '收入同比(%)',
                    `profit` DOUBLE NULL COMMENT '利润同比(%)',
                    `gpr` DOUBLE NULL COMMENT '毛利率(%)',
                    `npr` DOUBLE NULL COMMENT '净利润率(%)',
                    `holders` INT NULL COMMENT '股东人数',
                    PRIMARY KEY (`name`))
                    DEFAULT CHARSET=utf8mb4;
                    """ % (dbname, tableName)
            cursor.execute(sql)
            print ('table %s created' % tableName)
            # fetch and insert data
            res = ts.get_stock_basics()
            sql = 'INSERT IGNORE INTO `' + tableName + \
                """` values
                        (%s, %s, %s, %s, %s, %s, 
                        %s, %s, %s, %s, %s, %s, 
                        %s, %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, %s)
                    """
            for row in res.values:
                # print (row.tolist())
                param.append(row.tolist())
            cursor.executemany(sql, param)
            db.commit()
            print ('\ntable %s inserted %s records.' % (tableName, len(res.values)))
        except:
            print_exc()
            db.rollback()
            return False
        finally:
            db.close()
        return True

    def buildIndexList(self):
        tableName = 'indexList'
        try:
            engine = createDbEngine('database')
            df = ts.get_index()
            df.to_sql(tableName, engine, if_exists='replace')
        except:
            print_exc()
            return False
        return True

    """
    fetch all available stocks and create stockList table(drop if exist)

    """
    def buildStockList(self):   
        param = []
        tableName = 'stockList'
        try:
            db, dbname = connectConfigDB('database')
            cursor = db.cursor()
            cursor.execute("SET NAMES utf8mb4;")
            cursor.execute("DROP TABLE IF EXISTS %s" % tableName)
            # db.commit()
            # create table
            sql = """
                    CREATE TABLE 
                        `%s`.`%s` (
                        `code` VARCHAR(10) NOT NULL COMMENT '股票代码',
                        `name` VARCHAR(45) NULL COMMENT '股票名称',
                        `date` VARCHAR(45) NULL COMMENT '更新时间',
                        `changepercent` DOUBLE NULL COMMENT '涨跌幅',
                        `trade` DOUBLE NULL COMMENT '现价',
                        `open` DOUBLE NULL COMMENT '开盘价',
                        `high` DOUBLE NULL COMMENT '最高价',
                        `low` DOUBLE NULL COMMENT '最低价',
                        `settlement` DOUBLE NULL COMMENT '昨日收盘价',
                        `volume` DOUBLE NULL COMMENT '成交量',
                        `turnoverratio` DOUBLE NULL COMMENT '换手率',
                        `amount` DOUBLE NULL COMMENT '成交量',
                        `per` DOUBLE NULL COMMENT '市盈率',
                        `pb` DOUBLE NULL COMMENT '市净率',
                        `mktcap` DOUBLE NULL COMMENT '总市值',
                        `nmc` DOUBLE NULL COMMENT '流通市值',
                        PRIMARY KEY (`code`, `date`)
                        ) DEFAULT CHARSET=utf8mb4;  
                    """ % (dbname, tableName)       # !IMPORTANT: DEFAULT CHARSET=utf8mb4;  
            cursor.execute(sql)
            print ('table %s created' % tableName)
            # fetch and insert data
            res = ts.get_today_all()
            sql = 'INSERT IGNORE INTO `' + tableName + \
                    """` values(%s, %s, %s, %s, 
                                    %s, %s, %s, %s, 
                                    %s, %s, %s, %s, 
                                    %s, %s, %s, %s)
                    """
            for row in res.values:
                tmp = row.tolist()
                tmp.insert(2, getTime())
                param.append(tmp)
                print(tmp)
            cursor.executemany(sql, param)
            db.commit()
            print ('\ntable %s inserted %s records.' % (tableName, len(res.values)))
        except:
            print_exc()
            db.rollback()
            return False
        finally:
            db.close()
        return True

    def fetchKCurve(self, code, ktype = 'D', start = None, end = None, drop=False):
        tableName = 'stockHistData'
        param = []
        try:
            db, dbname = connectConfigDB('database')
            cursor = db.cursor()
            cursor.execute("SET NAMES utf8mb4;")
            if drop:
                cursor.execute("DROP TABLE IF EXISTS %s" % tableName)
                # db.commit()
                # create table
                sql = """
                        CREATE TABLE 
                            `%s`.`%s` (
                            `code` VARCHAR(10) NOT NULL COMMENT '股票代码',
                            `date` VARCHAR(45) NULL COMMENT '日期',
                            `open` DOUBLE NULL COMMENT '开盘价',
                            `high` DOUBLE NULL COMMENT '最高价',
                            `close` DOUBLE NULL COMMENT '收盘价',
                            `low` DOUBLE NULL COMMENT '最低价',
                            `volume` DOUBLE NULL COMMENT '成交量',
                            `price_change` DOUBLE NULL COMMENT '价格变动',
                            `p_change` DOUBLE NULL COMMENT '涨跌幅',
                            `ma5` DOUBLE NULL COMMENT '5日均价',
                            `ma10` DOUBLE NULL COMMENT '10日均价',
                            `ma20` DOUBLE NULL COMMENT '20日均价',
                            `v_ma5` DOUBLE NULL COMMENT '5日均量',
                            `v_ma10` DOUBLE NULL COMMENT '10日均量',
                            `v_ma20` DOUBLE NULL COMMENT '20日均量',
                            PRIMARY KEY (`code`, `date`)
                            ) DEFAULT CHARSET=utf8mb4;  
                        """ % (dbname, tableName)       # !IMPORTANT: DEFAULT CHARSET=utf8mb4;  
                cursor.execute(sql)
                print ('table %s created' % tableName)
            # fetch and insert data
            res = ts.get_hist_data(code, start=start, end=end, ktype=ktype)
            sql = 'INSERT IGNORE INTO `' + tableName + \
                    """` values(%s, %s, %s, %s, 
                                    %s, %s, %s, %s, 
                                    %s, %s, %s, %s, 
                                    %s, %s, %s)
                    """
            for i in range(0, len(res.values)):
                param.append([code, res.index[i]] + res.values[i].tolist())
            cursor.executemany(sql, param)
            db.commit()
            print ('\ntable %s inserted %s records.' % (tableName, len(res.values)))
        except:
            print_exc()
            db.rollback()
            return False
        finally:
            db.close()
        return True
    
    def fetchCompanyProfitByQuarter(self, year, quarter, drop = False):
        tableName = 'companyProfit'
        param = []
        try:
            db, dbname = connectConfigDB('database')
            cursor = db.cursor()
            cursor.execute("SET NAMES utf8mb4;")
            if drop:
                cursor.execute("DROP TABLE IF EXISTS %s" % tableName)
                sql = """CREATE TABLE 
                            `%s`.`%s` (
                                `code` varchar(10) NOT NULL COMMENT '股票代码',
                                `name` varchar(45) DEFAULT NULL COMMENT '公司名称',
                                `roe` double DEFAULT NULL COMMENT '净资产收益率',
                                `net_profit_ratio` double DEFAULT NULL COMMENT '净利率',
                                `gross_profit_rate` double DEFAULT NULL COMMENT '毛利率',
                                `net_profits` double DEFAULT NULL COMMENT '净利润(万元)',
                                `esp` double DEFAULT NULL COMMENT '每股收益',
                                `business_income` double DEFAULT NULL COMMENT '营业收入(百万元)',
                                `bips` double DEFAULT NULL COMMENT '每股主营业务收入(元)',
                                `date` varchar(45) NOT NULL DEFAULT '' COMMENT '季度(YYYY-Q)',
                                PRIMARY KEY (`code`, `date`)
                            ) DEFAULT CHARSET=utf8mb4;  
                        """ % (dbname, tableName)       # !IMPORTANT: DEFAULT CHARSET=utf8mb4;
                cursor.execute(sql)
                print ('table %s created' % tableName)
            # fetch and insert data
            res = ts.get_profit_data(year, quarter)
            res = res.where(pd.notnull(res), 0)
            sql = 'INSERT IGNORE INTO `' + tableName + \
                    """` values(%s, %s, %s, %s, %s,
                                     %s, %s, %s, %s, %s)
                    """
            for row in res.values:
                param.append(row.tolist() + [str(year)+"-"+str(quarter)])
            cursor.executemany(sql, param)
            db.commit()
            print ('\ntable %s inserted %s records.' % (tableName, len(res.values)))
        except:
            print_exc()
            db.rollback()
            return False
        finally:
            db.close()
        return True

    def fetchCompanyInfoByCode(self, code, drop = False):
        tableName = 'companyInfo'
        param = []
        try:
            db, dbname = connectConfigDB('database')
            cursor = db.cursor()
            cursor.execute("SET NAMES utf8mb4;")
            if drop:
                cursor.execute("DROP TABLE IF EXISTS %s" % tableName)
                # db.commit()
                # create table
                sql = """CREATE TABLE 
                            `%s`.`%s` (
                                `证券代码` VARCHAR(10) DEFAULT NULL,
                                `证券简称` TEXT DEFAULT NULL,
                                `公司名称` TEXT DEFAULT NULL,
                                `公司英文名称` TEXT DEFAULT NULL,
                                `交易所` TEXT DEFAULT NULL,
                                `公司曾有名称` TEXT DEFAULT NULL,
                                `证券简称更名历史` TEXT DEFAULT NULL,
                                `公司注册国家` TEXT DEFAULT NULL,
                                `省份` TEXT DEFAULT NULL,
                                `城市` TEXT DEFAULT NULL,
                                `工商登记号` TEXT DEFAULT NULL,
                                `注册地址` TEXT DEFAULT NULL,
                                `办公地址` TEXT DEFAULT NULL,
                                `注册资本` TEXT DEFAULT NULL,
                                `邮政编码` TEXT DEFAULT NULL,
                                `联系电话` TEXT DEFAULT NULL,
                                `公司传真` TEXT DEFAULT NULL,
                                `法人代表` TEXT DEFAULT NULL,
                                `总经理` TEXT DEFAULT NULL,
                                `成立日期` TEXT DEFAULT NULL,
                                `职工总数` TEXT DEFAULT NULL,
                                PRIMARY KEY (`证券代码`)
                            ) DEFAULT CHARSET=utf8mb4;  
                """ % (dbname, tableName)       # !IMPORTANT: DEFAULT CHARSET=utf8mb4;
                cursor.execute(sql)
                print ('table %s created' % tableName)
            # fetch and insert data
            df = pd.read_html('http://q.stock.sohu.com/cn/%s/gsjj.shtml' % code)[2]
            for row in df.values:
                param += row[1::2].tolist()
            sql = 'INSERT IGNORE INTO `' + tableName + \
                    """` values('%s', '%s', '%s', '%s', '%s','%s', '%s', '%s', '%s', '%s','%s', '%s', '%s', '%s', '%s','%s', '%s', '%s', '%s','%s', '%s')
                    """ % tuple(param)
            cursor.execute(sql)
            db.commit()
            print ('\ntable %s inserted %s records.' % (tableName, 1))
        except:
            print_exc()
            db.rollback()
            return False
        finally:
            db.close()
        return True

    def fetchNewsByCode(self, code, drop = False):
        tableName = 'stockNews'
        param = []
        try:
            db, dbname = connectConfigDB('database')
            cursor = db.cursor()
            cursor.execute("SET NAMES utf8mb4;")
            if drop:
                cursor.execute("DROP TABLE IF EXISTS %s" % tableName)
                sql = """
                        CREATE TABLE 
                            `%s`.`%s` (
                            `code` VARCHAR(10) NOT NULL COMMENT '股票代码',
                            `title` VARCHAR(45) NULL COMMENT '标题',
                            `type` VARCHAR(45) NULL COMMENT '类型',
                            `date` VARCHAR(45) NULL COMMENT '日期',
                            `url` TEXT NULL COMMENT '链接',
                            PRIMARY KEY (`code`, `title`, `date`)
                            ) DEFAULT CHARSET=utf8mb4;  
                        """ % (dbname, tableName)       # !IMPORTANT: DEFAULT CHARSET=utf8mb4;  
                cursor.execute(sql)
                print ('table %s created' % tableName)
            # fetch and insert data
            res = ts.get_notices(code)
            sql = 'INSERT IGNORE INTO `' + tableName + \
                    """` values(%s, %s, %s, %s, %s)
                    """
            for row in res.values:
                param.append([code] + row.tolist())
            cursor.executemany(sql, param)
            db.commit()
            print ('\ntable %s inserted %s records.' % (tableName, len(res.values)))
        except:
            print_exc()
            db.rollback()
            return False
        finally:
            db.close()
        return True

    def fetchFinancialNews(self, drop = False):
        tableName = 'financialNews'
        param = []
        try:
            db, dbname = connectConfigDB('database')
            cursor = db.cursor()
            cursor.execute("SET NAMES utf8mb4;")
            if drop:
                cursor.execute("DROP TABLE IF EXISTS %s" % tableName)
                # db.commit()
                # create table
                sql = """
                        CREATE TABLE 
                            `%s`.`%s` (
                            `classify` VARCHAR(20) NOT NULL COMMENT '新闻类型',
                            `title` TEXT NULL COMMENT '标题',
                            `date` VARCHAR(45) NULL COMMENT '日期',
                            `url` TEXT NULL COMMENT '链接',
                            PRIMARY KEY ( `title`, `date`)
                            ) DEFAULT CHARSET=utf8mb4;  
                        """ % (dbname, tableName)       # !IMPORTANT: DEFAULT CHARSET=utf8mb4;  
                cursor.execute(sql)
                print ('table %s created' % tableName)
            # fetch and insert data
            res = ts.get_latest_news()
            sql = 'INSERT IGNORE INTO `' + tableName + \
                    """` values(%s, %s, %s, %s)
                    """
            for row in res.values:
                param.append(row.tolist())
            cursor.executemany(sql, param)
            db.commit()
            print ('\ntable %s inserted %s records.' % (tableName, len(res.values)))
        except:
            print_exc()
            db.rollback()
            return False
        finally:
            db.close()
        return True
    

class TradeFetcher(Singleton, IDataFetcher):
    def __init__(self):
        pass

    def fetchByName(self, name):
        raise NotImplementedError()
    
    def fetchByCode(self, code, date = None):
        param = []
        tableName = 'tradeRecords'
        try:
            db, dbname = connectConfigDB('database')
            cursor = db.cursor()
            sql = 'INSERT IGNORE INTO `' + tableName + \
                    """` values(%s, %s, %s, %s, 
                                    %s, %s, %s, %s)
                    """
            # fetch and insert data
            if date is None:
                date = str(datetime.datetime.now()).split()[0]
            res = ts.get_tick_data(code, date)
            for row in res.values:
                param.append([code, date] + row.tolist())
            cursor.executemany(sql, param)
            db.commit()
            print ('\ntable %s inserted %s records.' % (tableName, len(res.values)))
        except:
            print_exc()
            db.rollback()
            return False
        finally:
            db.close()
        return True
        
    def fetchByIndustry(self, industry):
        raise NotImplementedError()
    
    def fetchAll(self):
        raise NotImplementedError()
    
    def fetchRealtimeQuotes(self, code):
        tableName = 'realtimeQuotes'
        try:
            engine = createDbEngine('database')
            df = ts.get_realtime_quotes(code)
            df.to_sql(tableName, engine, if_exists='append')
        except:
            print_exc()
            return False
        return True

    def fetchBlockTradeByCode(self, code, date, vol=500, drop = False):
        tableName = 'blockTradeRecords'
        param = []
        try:
            db, dbname = connectConfigDB('database')
            cursor = db.cursor()
            cursor.execute("SET NAMES utf8mb4;")
            if drop:
                cursor.execute("DROP TABLE IF EXISTS %s" % tableName)
                # db.commit()
                # create table
                sql = """
                        CREATE TABLE 
                            `%s`.`%s` (
                            `code` VARCHAR(20) NOT NULL COMMENT '股票代码',
                            `name` VARCHAR(45) NOT NULL COMMENT '股票名称',
                            `date` VARCHAR(20) NULL COMMENT '日期',
                            `time` VARCHAR(20) NULL COMMENT '时间',
                            `price` DOUBLE NULL COMMENT '当前价格',
                            `volume` DOUBLE NULL COMMENT '成交手',
                            `preprice` DOUBLE NULL COMMENT '上一笔价格',
                            `type` VARCHAR(45) NULL COMMENT '买卖类型【买盘、卖盘、中性盘】'
                            ) DEFAULT CHARSET=utf8mb4;  
                        """ % (dbname, tableName)       # !IMPORTANT: DEFAULT CHARSET=utf8mb4;  
                cursor.execute(sql)
                print ('table %s created' % tableName)
            # fetch and insert data
            res = ts.get_latest_news()
            sql = 'INSERT IGNORE INTO `' + tableName + \
                    """` values(%s, %s, %s, %s, %s, %s, %s, %s)
                    """
            for row in res.values:
                tmp = row.tolist()
                tmp.insert(2, date)
                param.append(tmp)
            cursor.executemany(sql, param)
            db.commit()
            print ('\ntable %s inserted %s records.' % (tableName, len(res.values)))
        except:
            print_exc()
            db.rollback()
            return False
        finally:
            db.close()
        return True
        

def main():
    stk = StockInfoFetcher()
    trd = TradeFetcher()
    try:
        db, dbname = connectConfigDB('database')
        cursor = db.cursor()
        sql = "SELECT code FROM stockList"
        cursor.execute(sql)
        results = cursor.fetchall()
        for row in results:
            code = row[0]
            print(code)
            stk.fetchKCurve(code=code, ktype='D', start='2017-01-01', end='2017-05-16')
    except:
        print_exc()
        db.rollback()
        exit()
    finally:
        db.close()
    
    # stk.fetchCompanyInfoByCode('000001')
    # stk.fetchFinancialNews()
    # trd.fetchByCode('000001', '2016-12-19')
    # trd.fetchRealtimeQuotes('000001')
    # trd.fetchBlockTradeByCode('000001', '2017-04-20')

if __name__ == '__main__':
    main()


'''

CREATE TABLE `companyFinReport` (
  `code` varchar(10) NOT NULL COMMENT '股票代码',
  `name` varchar(45) DEFAULT NULL COMMENT '公司名称',
  `esp` double DEFAULT NULL COMMENT '每股收益',
  `eps_yoy` double DEFAULT NULL COMMENT '每股收益同比(%)',
  `bvps` double DEFAULT NULL COMMENT '每股净资产',
  `roe` double DEFAULT NULL COMMENT '净资产收益率(%)',
  `epcf` double DEFAULT NULL COMMENT '每股现金流量(元)',
  `net_profits` double DEFAULT NULL COMMENT '净利润(万元)',
  `profits_yoy` double DEFAULT NULL COMMENT '净利润同比(%)',
  `distrib` varchar(45) DEFAULT NULL COMMENT '分配方案',
  `date` varchar(45) NULL DEFAULT '' COMMENT '日期',
  PRIMARY KEY (`code`,`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



CREATE TABLE `stockFlows` (
  `code` varchar(10) NOT NULL COMMENT '股票代码',
  `name` varchar(45) DEFAULT NULL COMMENT '公司名称',
  `inflow` bigint DEFAULT NULL COMMENT '流入资金',
  `outflow` bigint DEFAULT NULL COMMENT '流出资金',
  `flow` bigint DEFAULT NULL COMMENT '净流入',
  `changepercent` double DEFAULT NULL COMMENT '涨跌幅',
  `date` varchar(45) NULL DEFAULT '' COMMENT '日期',
  PRIMARY KEY (`code`,`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `indexContainStocks` (
  `indexCode` varchar(10) NOT NULL COMMENT '指数代码',
  `indexName` varchar(45) DEFAULT NULL COMMENT '指数名称',
  `stockCode` varchar(10) NOT NULL DEFAULT '' COMMENT '股票代码',
  `stockName` varchar(45) DEFAULT NULL COMMENT '股票名称',
  `contribution` double DEFAULT NULL COMMENT '贡献点数(%)',
  `hot` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`indexCode`,`stockCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `indexTradeRecords` (
  `code` varchar(10) NOT NULL COMMENT '股指代码',
  `date` varchar(45) NOT NULL COMMENT '日期',
  `time` varchar(45) NOT NULL COMMENT '交易时间',
  `price` double NOT NULL COMMENT '成交价格',
  `volume` int(11) DEFAULT NULL COMMENT '成交手',
  `amount` int(11) DEFAULT NULL COMMENT '成交金额(元)'
) DEFAULT CHARSET=utf8mb4;



CREATE TABLE `companyInfo` (
  `证券代码` TEXT DEFAULT NULL,
  `证券简称` TEXT DEFAULT NULL,
  `公司名称` TEXT DEFAULT NULL,
  `公司英文名称` TEXT DEFAULT NULL,
  `交易所` TEXT DEFAULT NULL,
  `公司曾有名称` TEXT DEFAULT NULL,
  `证券简称更名历史` TEXT DEFAULT NULL,
  `公司注册国家` TEXT DEFAULT NULL,
  `省份` TEXT DEFAULT NULL,
  `城市` TEXT DEFAULT NULL,
  `工商登记号` TEXT DEFAULT NULL,
  `注册地址` TEXT DEFAULT NULL,
  `办公地址` TEXT DEFAULT NULL,
  `注册资本` TEXT DEFAULT NULL,
  `邮政编码` TEXT DEFAULT NULL,
  `联系电话` TEXT DEFAULT NULL,
  `公司传真` TEXT DEFAULT NULL,
  `法人代表` TEXT DEFAULT NULL,
  `总经理` TEXT DEFAULT NULL,
  `成立日期` TEXT DEFAULT NULL,
  `职工总数` TEXT DEFAULT NULL,
  PRIMARY KEY (`股票代码`)
) DEFAULT CHARSET=utf8mb4;



'''