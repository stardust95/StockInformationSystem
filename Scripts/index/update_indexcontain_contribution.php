<?php
/**
 * Created by PhpStorm.
 * User: mlyang
 * Date: 2017/4/23
 * Time: 20:31
 */

$host="112.74.124.145:3306";
$user="group5";
$password="group5";
$database="stockG5";
$conn=new mysqli($host, $user, $password,$database);
//
//$query="select *
//from indexContainStocks a
//where 10>(select count(*) from indexContainStocks where indexCode=a.indexCode and contribution>a.contribution)
//order by a.indexCode,a.contribution desc";

$count=0;
$table="indexContainStocks";
//$result=$conn->query($query);
$query="select * from indexContainStocks ";
$result=$conn->query($query);

if ($result->num_rows > 0) {
    // 输出每行数据
    while ($row = $result->fetch_assoc()) {
        $stockcode = $row['stockCode'];
        $indexcode = $row['indexCode'];
//此处更新贡献值
        $stock_select="select * from stockList where code= ".$stockcode;
//        echo $stock_select;
        $result1=$conn->query($stock_select);
        $stock_row=$result1->fetch_assoc();

        $contribution=$stock_row['amount']/312500000;
//        echo $contribution;
        $update="update ".$table." set  contribution = ".$contribution." where indexCode = ".$indexcode." and stockCode= ".$stockcode." ";
        $result2=$conn->query($update);
//        if($code<100000||199999<$code&&$code<400000){
////            $flag="select *  from ".$table." where indexCode= 3 and "." stockCode= ".$code." ";
//////            echo $flag;
////            $result1=$conn->query($flag);
////            if($result1->num_rows<=0){
//            $insert="insert into ".$table." values('000003','深证','$code','$name',0,0)";
//            if ($conn->query($insert) === TRUE) {
//                echo "新记录插入成功";
//            } else {
//                echo "Error: " . $insert . "<br>" . $conn->error;
//            }
//        }
    }
} else {
    echo "indexContainStocks表异常！";
    echo "Error: " . $query . "<br>" . $conn->error;
    exit;
}
$conn->close();
?>