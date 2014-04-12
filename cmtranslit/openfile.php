<?php

if (!$_FILES['openfile']) {
    $message = "Error: No file Specified";
    print $message;
}
else {
    $name      = $_FILES['openfile']['name'];
    $temp_name = $_FILES['openfile']['tmp_name'];
    $file_type = $_FILES['openfile']['type'];
    $file_size = $_FILES['openfile']['size'];
    $result    = $_FILES['openfile']['error'];

    //File Size Check
    if ( $file_size > 100000) {
        $message = "Error: cannot open file " . $name . ": The file size is over 100K.";
        print $message;
    }
    //File Type Check
    else if ( $file_type != "text/plain" && $file_type != "text/html" ) {
        $message = "Error: cannot open file " . $name . ": Invalid file type - you can only open text files and HTML files";
        print $message;
    }
    else {
	$is_plain_text = false;
	if( $file_type == "text/plain" ) $is_plain_text = true;
	$handle = @fopen($temp_name, "r");
	if ($handle) {
	    if( $is_plain_text ) echo "<pre>";
	    $first = 0;
	    while (!feof($handle)) {
		$buffer = fgets($handle, 4096);
		//if( $is_plain_text && $first != 0 ) print "<br>";
		echo $buffer;
		$first = 1;
	    }
	    if( $is_plain_text ) echo "</pre>";
	    fclose($handle);
	}
	else {
	    $message = "Error: cannot open file " . $name . ": Unexpected server error";
	    print $message;
	}
    }
}
?>
