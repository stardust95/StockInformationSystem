<?php
/**
 * Created by PhpStorm.
 * User: mlyang
 * Date: 2017/5/14
 * Time: 20:01
 */

//date("Y-m-d");

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

$query0="select * from indexIndustry where industry= ";

//$indus=array("专用机械","中成药","互联网","仓储物流","供气供热","元器件","乳制品","保险","全国地产","公路","其他商业","其他建材","农业综合","农药化肥","农用机械"
//,"出版业","化学制药","化工原料","化工机械","化纤","区域地产","医疗保健","半导体","商贸代理","商品城","啤酒"
//,"园区开发","塑料","多元金融","家居用品","家用电器","小金属","工程机械","广告包装","建筑施工","影视音像","房产服务","批发业"
//,"摩托车","文教休闲","新型电力");

$indus = array();
$q="SELECT * FROM indexIndustry  group by industry";
$r = $conn->query($q);
if ($r->num_rows > 0) {
    while ($r1 = $r->fetch_assoc()) {
        array_push($indus,$r1['industry']);
    }
}
else{
    echo "Error: " . $q . "<br>" . $conn->error;
    exit;
}
//print_r($indus);
for($i=0;$i<count($indus);$i++) {
    $query=$query0."'".$indus[$i]."'";
    $companies=0;
    $sumprice=0;
    $sumchange=0;
    $volume=0;
    $amount=0;

    $result = $conn->query($query);
    if ($result->num_rows > 0) {
// 输出每行数据
        while ($row = $result->fetch_assoc()) {
            $code = $row['code'];
            $name = $row['name'];
            $stock_query="select * from stockList where code= '".$code."'";
            $result1 = $conn->query($stock_query);
            if ($result1->num_rows < 0){
                echo "Error: " . $stock_query . "<br>" . $conn->error;
                exit;
            }
            else{
                $row1 = $result1->fetch_assoc();
                $date=date("Y-m-d");
                $companies=$result->num_rows;
                $sumprice+=$row1['trade'];
                $sumchange+=$row1['changepercent'];
                $volume+=$row1['volume'];
                $amount+=$row1['amount'];
            }
        }
    }
    else{
        echo "Error: " . $query . "<br>" . $conn->error;
        exit;
    }
    $avgprice=$sumprice/$companies;
    $avgchange=$sumchange;
    $avg_change=$sumchange/$companies;
    $update = "update industryHistData set date= '".$date."',companies=".$companies.",avgprice=".$avgprice."
        ,avgchange=".$avgchange.",avgp_change=".$avg_change.",volume=".$volume.",amount=".$amount."
        where industry='".$indus[$i]."' ";
    $result_update = $conn->query($update);
    if($result_update!=TRUE){
        echo "Error: " . $update . "<br>" . $conn->error;
        exit;
    }
}