<?php

$name = $_POST["filename"];
$content = $_POST["rawContents"];

if( $name == "" ) {
    $name = "mynotations.txt";
}
else {
    $name = rtrim(basename($name));
}

header('Content-Description: ' . 'CM Typesetter notations' );
header('Content-Type: ' . "application/x-unknown");
header('Content-Disposition: attachment; filename=' . $name );
print stripslashes($content);
?>
