<?php

$name = $_POST["filename"];
$content = $_POST["plaintextcontent"];
$plain  = 0;
if( $content != "" ) {
    if( $name == "" ) {
	$name = "translit_text.txt";
    }
    $plain  = 1;
}
else {
    $content = $_POST["content"];
    if( $name == "" )
	$name = "translit_text.html";
}
$name = rtrim(basename($name));

header('Content-Description: ' . 'CM Unified Transliteration Scheme text' );
header('Content-Type: ' . "application/x-unknown");
header('Content-Disposition: attachment; filename=' . $name );
if( $plain == 0 ) {
    print "<html><head></head><body>\n";
    $content = preg_replace('/(<[^\/]*\/>)/',"$1\n",$content);
    print $content;
    print "</body>";
}
else {
    print stripslashes(html_entity_decode($content));
}
?>
