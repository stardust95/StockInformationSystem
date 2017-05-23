<?php
/**
 * Created by PhpStorm.
 * User: mlyang
 * Date: 2017/5/2
 * Time: 22:49
 */
$host="112.74.124.145:3306";
$user="group5";
$password="group5";
$database="stockG5";
$conn=new mysqli($host, $user, $password,$database);

$table="indexTradeRecords";

$query="select * from tradeRecords limit 1000";
$result=$conn->query($query);

if ($result->num_rows > 0) {
// 输出每行数据
while ($row = $result->fetch_assoc()) {
    $code=$row['code'];
    $date=$row['date'];
    $time=$row['time'];
    $price=$row['price'];
    $volume=$row['volume'];
    $amount=$row['amount'];

//    echo $code.' ';
//    echo $date.' ';
//    echo $time.' ';
//    echo $price.' ';
//    echo $volume.' ';
//    echo $amount.' ';
    if($code==NULL){
        $code=' ';
    }
    if($date==NULL){
        $date=' ';
    }
    if($time==NULL){
        $time=' ';
    }
    if($price==NULL){
        $price=' ';
    }
    if($volume==NULL){
        $volume=' ';
    }
    if($amount==NULL){
        $amount=' ';
    }
    if($code<100000||199999<$code&&$code<400000){
        $code1='399106';
        $insert="insert ignore into ".$table." values('$code1','$date','$time','$price','$volume','$amount')";
//        echo $insert;
        if ($conn->query($insert) === TRUE) {
//            echo "指数交易记录插入成功！";
        } else {
            echo "Error: " . $insert . "<br>" . $conn->error;
        }
    }
    if($code<100000){
        $code1='399107';
        $insert="insert ignore into ".$table." values('$code1','$date','$time','$price','$volume','$amount')";
        if ($conn->query($insert) === TRUE) {
//            echo "指数交易记录插入成功！";
        } else {
            echo "Error: " . $insert . "<br>" . $conn->error;
        }
    }
    if($code>199999 && $code<300000){
        $code1='399108';
        $insert="insert ignore into ".$table." values('$code1','$date','$time','$price','$volume','$amount')";
        if ($conn->query($insert) === TRUE) {
//            echo "指数交易记录插入成功！";
        } else {
            echo "Error: " . $insert . "<br>" . $conn->error;
        }
    }
    if(1999<$code && $code<3000){
        $code1='399333';
        $insert="insert ignore into ".$table." values('$code1','$date','$time','$price','$volume','$amount')";
        if ($conn->query($insert) === TRUE) {
//            echo "指数交易记录插入成功！";
        } else {
            echo "Error: " . $insert . "<br>" . $conn->error;
        }
    }
    if(299999<$code && $code<400000){
        $code1='399606';
        $insert="insert ignore into ".$table." values('$code1','$date','$time','$price','$volume','$amount')";
        if ($conn->query($insert) === TRUE) {
//            echo "指数交易记录插入成功！";
        } else {
            echo "Error: " . $insert . "<br>" . $conn->error;
        }
    }
    if((599999<$code && $code<700000)||(899999<$code&&$code<1000000)){
        $code1='000001';
        $insert="insert ignore into ".$table." values('$code1','$date','$time','$price','$volume','$amount')";
        if ($conn->query($insert) === TRUE){
//            echo "指数交易记录插入成功！";
        } else {
            echo "Error: " . $insert . "<br>" . $conn->error;
        }
    }
    if(599999<$code && $code<604000){
        $code1='000002';
        $insert="insert ignore into ".$table." values('$code1','$date','$time','$price','$volume','$amount')";
        if ($conn->query($insert) === TRUE) {
//            echo "指数交易记录插入成功！";
        } else {
            echo "Error: " . $insert . "<br>" . $conn->error;
        }
    }
    if(899999<$code && $code<1000000){
        $code1='000003';
        $insert="insert ignore into ".$table." values('$code1','$date','$time','$price','$volume','$amount')";
        if ($conn->query($insert) === TRUE) {
//            echo "指数交易记录插入成功！";
        } else {
            echo "Error: " . $insert . "<br>" . $conn->error;
        }
    }
    }
}
else {
   echo "tradeRecord表异常！";
   echo "Error: " . $query . "<br>" . $conn->error;
   exit;
}
?>
