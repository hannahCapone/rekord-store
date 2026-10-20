<?php
include("db.php");

echo "<html>";
echo "<body>";
//echo "<h1>FOLLOWING PAGE</h1>";

$acode = $_GET['u_id'];

$SQL = "SELECT albumTitle, artist, yearOfRelease, copyCode, purchaseDate, conditions
    FROM Album JOIN Album_Copy  
    WHERE Album.albumCode = Album_Copy.albumCode 
    AND Album.albumCode = ".$acode;

// echo "<p>Query: ".$SQL."</p>";

$exe = mysqli_query($conn, $SQL) or die(mysqli_error($conn));

$info = mysqli_fetch_array($exe);
echo "<h1>Album Title: ".$info['albumTitle']."</h1>";
echo "<p>----------------------------------------------------------------------------------------------------------------------</p>";
echo "<p><b>Artist: </b>".$info['artist']."</p>";
echo "<p><b>Year Of Release: </b>".$info['yearOfRelease']."</p>";

$exe2 = mysqli_query($conn, $SQL) or die(mysqli_error($conn));

while ($results=mysqli_fetch_array($exe2))
{
    //Album_Copy
    echo "<p>----------------------------------------------------------------------------------------------------------------------</p>";
    echo "<p><b>Copy Code: </b>".$results['copyCode']."</p>";
    echo "<p><b>Purchase Date: </b>".$results['purchaseDate']."</p>";
    echo "<p><b>Condition: </b>".$results['conditions']."</p>"; 
}
echo "<p>----------------------------------------------------------------------------------------------------------------------</p>";


//TESTING GET
// echo "<h2>".$acode."</h2>";

echo "</body>";
echo "</html>";
?>