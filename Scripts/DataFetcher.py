#coding=utf-8
import pymysql, configparser
import datetime
import tushare as ts
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
    
class IDataFetcher():

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
        tableName = 'stockBasics2'
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
            sql = 'INSERT INTO `' + tableName + \
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
        param = []
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
        records = {}
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
            sql = 'INSERT INTO `' + tableName + \
                    """` values(%s, %s, %s, %s, 
                                    %s, %s, %s, %s, 
                                    %s, %s, %s, %s, 
                                    %s, %s, %s, %s)
                    """
            # for row in res.values:
            #     item = [str(row[0]), str(row[1]), str(row[2])]
            #     if row[0] in records:
            #         records[row[0]][1] = records[row[0]][1] + " " + row[2]
            #     else:
            #         records[row[0]] = [row[1], row[2]]
                # param.append(item)
            # for (k, v) in records.items():
                # param.append([k] + v)
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

class TradeFetcher(IDataFetcher):
    def __init__(self):
        pass

    def fetchByName(self, name):
        raise NotImplementedError()
    
    def fetchByCode(self, code):
        param = []
        tableName = 'tradeRecords'
        try:
            db, dbname = connectConfigDB('database')
            cursor = db.cursor()
            sql = 'INSERT INTO `' + tableName + \
                    """` values(%s, %s, %s, %s, %s, %s, %s, %s)
                    """
            # fetch and insert data
            res = ts.get_today_ticks(code)
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
        
    def fetchByIndustry(self, industry):
        raise NotImplementedError()
    
    def fetchAll(self):
        raise NotImplementedError()


def main():
    stk = StockInfoFetcher()
    trd = TradeFetcher()
    stk.buildStockList()

if __name__ == '__main__':
    main()


