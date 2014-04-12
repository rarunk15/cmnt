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
    if ( $file_size > 5000) {
        $message = "Error: cannot open file " . $name . ": The file size is over 5K.";
        print $message;
    }
    //File Type Check
    else if ( $file_type != "text/plain" ) {
        $message = "Error: cannot open file " . $name . ": Invalid file type";
        print $message;
    }
    else {
       header("Content-Type: text/plain");
	$handle = @fopen($temp_name, "r");
	if ($handle) {
	    while (!feof($handle)) {
		$buffer = fgets($handle, 4096);
		echo $buffer;
	    }
	    fclose($handle);
	}
	else {
	    $message = "Error: cannot open file " . $name . ": Unexpected server error";
	    print $message;
	}
    }
}
?>

