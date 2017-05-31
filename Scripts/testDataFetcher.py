import unittest
from DataFetcher import *


class TestStockFetcher(unittest.TestCase):

    def test_fetchKCurve(self):
        pass

    def test_fetchCompanyProfitByQuarter(self):
        pass

    def test_fetchCompanyInfoByCode(self):
        pass
    
    def test_fetchNewsByCode(self):
        instance = StockInfoFetcher()
        instance.fetchNewsByCode('000001')
        instance.fetchNewsByCode('asdasd')
        instance.fetchNewsByCode('654321')

    def test_fetchFinancialNews(self):
        pass

class TestTradeFetcher(unittest.TestCase):
    def test_fetchByCode(self):
        pass
    
    def test_fetchRealtimeQuotes(self):
        pass

    def test_fetchBlockTradeByCode(self):
        pass

if __name__ == '__main__':
    unittest.main()
