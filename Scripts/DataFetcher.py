#coding=utf-8
import pymysql, configparser
import tushare as ts
from sqlalchemy import create_engine
from traceback import print_exc
from abc import ABCMeta, abstractmethod, abstractproperty

"""
Test with python 3.6

MySQL use 'utf8mb4' characterset

API provided at http://tushare.org/trading.html

"""

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

    """ fetch 
    code,股票代码
    name,名称
    industry,所属行业
    area,地区
    pe,市盈率
    outstanding,流通股本(亿)
    totals,总股本(亿)
    totalAssets,总资产(万)
    liquidAssets,流动资产
    fixedAssets,固定资产
    reserved,公积金
    reservedPerShare,每股公积金
    esp,每股收益
    bvps,每股净资
    pb,市净率
    timeToMarket,上市日期
    undp,未分利润
    perundp, 每股未分配
    rev,收入同比(%)
    profit,利润同比(%)
    gpr,毛利率(%)
    npr,净利润率(%)
    holders,股东人数
    """
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
                    `name` VARCHAR(45) NOT NULL,
                    `industry` VARCHAR(45) NULL,
                    `area` VARCHAR(45) NULL,
                    `pe` DOUBLE NULL,
                    `outstanding` DOUBLE NULL,
                    `totals` DOUBLE NULL,
                    `totalAssets` DOUBLE NULL,
                    `liquidAssets` DOUBLE NULL,
                    `fixedAssets` DOUBLE NULL,
                    `reserved` DOUBLE NULL,
                    `reservedPerShare` DOUBLE NULL,
                    `esp` DOUBLE NULL,
                    `bvps` DOUBLE NULL,
                    `pb` DOUBLE NULL,
                    `timeToMarket` VARCHAR(45) NULL,
                    `undp` DOUBLE NULL,
                    `perundp` DOUBLE NULL,
                    `rev` DOUBLE NULL,
                    `profit` DOUBLE NULL,
                    `gpr` DOUBLE NULL,
                    `npr` DOUBLE NULL,
                    `holders` INT NULL,
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
                        %s, %s, %s, %s)
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
                        `code` VARCHAR(10) NOT NULL,
                        `name` VARCHAR(45) NULL,
                        `industry` VARCHAR(45) NULL,
                        PRIMARY KEY (`code`)
                        ) DEFAULT CHARSET=utf8mb4;  
                    """ % (dbname, tableName)       # !IMPORTANT: DEFAULT CHARSET=utf8mb4;  
            cursor.execute(sql)
            print ('table %s created' % tableName)
            # fetch and insert data
            res = ts.get_stock_basics()
            sql = 'INSERT INTO `' + tableName + \
                    """` values(%s, %s, %s)
                    """
            for row in res.values:
                item = [str(row[0]), str(row[1]), str(row[2])]
                if row[0] in records:
                    records[row[0]][1] = records[row[0]][1] + " " + row[2]
                else:
                    records[row[0]] = [row[1], row[2]]
                # param.append(item)
            for (k, v) in records.items():
                param.append([k] + v)
                # print(param[-1])
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
    trd.fetchByCode('600848')
    

if __name__ == '__main__':
    main()


