<?php
/**
 * Created by PhpStorm.
 * User: mlyang
 * Date: 2017/4/23
 * Time: 20:31
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

$query="select * from indexContainStocks a 
where 10>(select count(*) from indexContainStocks 
where indexCode=a.indexCode and contribution>a.contribution) 
order by a.indexCode,a.contribution desc";

$table="indexContainStocks";
$result=$conn->query($query);
$count=0;

if ($result->num_rows > 0) {
    // 输出每行数据
    while ($row = $result->fetch_assoc()) {
        $stockcode = $row['stockCode'];
        $indexcode = $row['indexCode'];
//此处更新热门
        $update="update ".$table." set  hot = 1 where indexCode = ".$indexcode." and stockCode= ".$stockcode." ";
//      echo $update;
        $result1=$conn->query($update);
        if ($result1 === TRUE) {
//            echo "新记录插入成功";
        } else {
            echo "Error: " . $update . "<br>" . $conn->error;
        }
    }
} else {
    echo "indexContainStocks异常！";
    echo "Error: " . $query . "<br>" . $conn->error;
}
if($count<10){
    $count++;
    //$res=$conn->query($update);
}
$conn->close();
?>