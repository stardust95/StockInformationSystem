from stock import *
from DataFetcher import StockInfoFetcher
import datetime

if __name__ == "__main__":
    # updateStockHistData(datetime.date(2017, 5, 3))
    # updateIndexHistData()
    stk = StockInfoFetcher()
    stk.fetchAll()

