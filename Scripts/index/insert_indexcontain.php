<?php
/**
 * Created by PhpStorm.
 * User: mlyang
 * Date: 2017/4/23
 * Time: 21:51
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

$query="select * from stockList ";
$table="indexContainStocks";
$result=$conn->query($query);
//$insert="insert into ".$table." values('100','1','1','1','1','1')";
//echo $insert;
//$conn->query($insert);

if ($result->num_rows > 0) {
    // 输出每行数据
    while ($row = $result->fetch_assoc()) {
        $code = $row['code'];
        $name = $row['name'];
//        $insert="insert into ".$table." values('$code','$code','$code','$code','$code','$code')";
//        echo "<br> id: ". $row["index"]. " - Name: ". $row["code"]. " " . $row["name"];
        if($code<100000||199999<$code&&$code<400000){
//            $flag="select *  from ".$table." where indexCode= 3 and "." stockCode= ".$code." ";
////            echo $flag;
//            $result1=$conn->query($flag);
//            if($result1->num_rows<=0){
            $insert="insert into ".$table." values('399106','深证','$code','$name',0,0)";
            if ($conn->query($insert) === TRUE) {
//                echo "新记录插入成功";
            } else {
                echo "Error: " . $insert . "<br>" . $conn->error;
            }
//                echo "深证";
//                echo $row['code']."\n";
//            }
//            else{
//                $update="update ".$table." set  contribution = 1 , hot = 1 where indexCode =3 and stockCode= ".$code." ";
////                echo $update;
//                $res=$conn->query($flag);
//            }
        }
        if($code<100000){
            $insert="insert into ".$table." values('399107','深证A股','$code','$name',0,0)";
            if ($conn->query($insert) === TRUE) {
//            echo $insert;
//                $conn->query($insert);
            } else {
                echo "Error: " . $insert . "<br>" . $conn->error;
            }
        }
        if($code>199999 && $code<300000){
            $insert="insert into ".$table." values('399108','深证B股','$code','$name',0,0)";
            if ($conn->query($insert) === TRUE) {
//                echo "深市B股OK";
            } else {
                echo "Error: " . $insert . "<br>" . $conn->error;
            }
        }
        if(1999<$code && $code<3000){
            $insert="insert into ".$table." values('399333','中小板块指数','$code','$name',0,0)";
            if ($conn->query($insert) === TRUE) {
//                echo "中小板";
            } else {
                echo "Error: " . $insert . "<br>" . $conn->error;
            }
        }
        if(299999<$code && $code<400000){
            $insert="insert into ".$table." values('399606','创业板块指数','$code','$name',0,0)";
            if ($conn->query($insert) === TRUE) {
//                echo "创业板";
            } else {
                echo "Error: " . $insert . "<br>" . $conn->error;
            }
        }
        if((599999<$code && $code<700000)||(899999<$code&&$code<1000000)){
            $insert="insert into ".$table." values('000001','上证指数','$code','$name',0,0)";
            if ($conn->query($insert) === TRUE) {
//                echo "上证";
            } else {
                echo "Error: " . $insert . "<br>" . $conn->error;
            }
        }
        if(599999<$code && $code<604000){
            $insert="insert into ".$table." values('000002','上证A股','$code','$name',0,0)";
            if ($conn->query($insert) === TRUE) {
//                echo "沪A";
            } else {
                echo "Error: " . $insert . "<br>" . $conn->error;
            }
        }
        if(899999<$code && $code<1000000){
            $insert="insert into ".$table." values('000003','上证B股','$code','$name',0,0)";
            if ($conn->query($insert) === TRUE) {
//                echo "沪B";
            } else {
                echo "Error: " . $insert . "<br>" . $conn->error;
            }
        }
    }
} else {
    echo "stockList表为空！";
    echo "Error: " . $query . "<br>" . $conn->error;
}
    $conn->close();
?>