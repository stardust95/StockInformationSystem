#coding=utf-8
import MySQLdb, ConfigParser
import tushare as ts
from abc import ABCMeta, abstractmethod, abstractproperty
# from interface import implements, Interface


def connectConfigDB(section, configName = 'config.ini'):
    config = ConfigParser.RawConfigParser()
    config.read(configName)
    host = config.get(section, 'db_host')
    dbuser = config.get(section, 'db_user')
    dbpass = config.get(section, 'db_pass')
    dbname = config.get(section, 'db_name')
    return MySQLdb.connect(host, dbuser , dbpass, dbname), dbname

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

class StockInfoFetcher( ):
    def __init__(self):
        pass

    def fetchByName(self, name):
        pass
    
    def fetchByCode(self, code):
        pass

    def fetchByIndustry(self, industry):
        pass
    
    def fetchAll(self):
        pass

    # fetch all available stocks and create stockList table(drop if exist)
    def buildStockList(self):   
        param = []
        try:
            db, dbname = connectConfigDB('database')
            cursor = db.cursor()
            res = ts.get_industry_classified()
            cursor.execute("DROP TABLE IF EXISTS EMPLOYEE")
            # create table
            sql = """
                    CREATE TABLE 
                        `%s`.`%s` (
                        `code` INT NOT NULL,
                        `name` VARCHAR(45) NULL,
                        `industry` VARCHAR(45) NULL,
                        PRIMARY KEY (`code`)
                    );""" % (dbname, 'stockList')
            cursor.execute(sql)
            # insert data
            sql = """
                    INSERT INTO 
                        `stockList` values
                        (%s, %s, %s)
                    """
            for row in res.values:
                param.append([row[0], row[1], row[2]])
            cursor.executemany(sql, param)
            db.commit()
            print('table %s inserted %s records.' % ('stockList', len(res.values)))
        except Exception as e:
            print(e)
            db.rollback()
            return False
        finally:
            db.close()
        return True

class TradeFetcher( ):
    def __init__(self):
        pass

    def fetchByName(self, name):
        pass
    
    def fetchByCode(self, code):
        pass

    def fetchByIndustry(self, industry):
        pass
    
    def fetchAll(self):
        pass


def main():
    fetcher = StockInfoFetcher()
    fetcher.buildStockList()

if __name__ == '__main__':
    main()


