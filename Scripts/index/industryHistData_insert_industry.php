<?php
/**
 * Created by PhpStorm.
 * User: mlyang
 * Date: 2017/5/2
 * Time: 21:53
 */


$file_path = "./connect.txt";
if(file_exists($file_path)) {
    $file_arr = file($file_path);
    $host = $file_arr[0];
    $port =$file_arr[1];
    $user = $file_arr[2];
    $password = $file_arr[3];
    $database = $file_arr[4];
    $host=trim($host);
    $port=trim($port);
    $user=trim($user);
    $password=trim($user);
    $database=trim($database);
    $host = $host.":".$port;
}
else{
    echo "连接池读取出错！";
    exit;
}


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