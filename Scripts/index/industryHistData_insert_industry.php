<?php
/**
 * Created by PhpStorm.
 * User: mlyang
 * Date: 2017/5/2
 * Time: 21:53
 */

$host="112.74.124.145:3306";
$user="group5";
$password="group5";
$database="stockG5";
$conn=new mysqli($host, $user, $password,$database);


$table="indexTradeRecords";
$query="select * from stockList ";
$result=$conn->query($query);


if ($result->num_rows > 0) {
// 输出每行数据
    while ($row = $result->fetch_assoc()) {
        $code=$row['code'];
        $name=$row['name'];
        $query_indus="select * from stockBasics where name= '".$name."' ";
        echo  $query_indus;
        $result1=$conn->query($query_indus);
        if ($result1->num_rows > 0){
            $row = $result1->fetch_assoc();
            $industry=$row['industry'];
        }else{
            echo "stockBasics表出错！";
            echo "Error: " . $query_indus . "<br>" . $conn->error;
        }
        $insert="insert ignore into indexIndustry values('$code','$name','$industry')";
        echo $insert;
        if ($conn->query($insert) === TRUE) {
        } else {
            echo "Error: " . $insert . "<br>" . $conn->error;
        }
    }
}
?>