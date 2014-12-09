<?php
$query = $_GET['address'];
$contents = file_get_contents($query);
echo $contents;
?>