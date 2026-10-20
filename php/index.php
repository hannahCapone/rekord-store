<?php
include("db.php");

echo "<html>";
echo "<body>";
echo "<h1>My Favorite Records</h1>";
echo "<a><i>Click the titles to learn more</i></a>";
echo "<a><br></a>";

$SQL = "SELECT * FROM Album ORDER BY albumCode";
$exeSQL = mysqli_query($conn, $SQL) or die(mysqli_error($conn));

while ($results = mysqli_fetch_array($exeSQL))
{
    echo "<br><a href = followingpage.php?u_id=".$results['albumCode'].">";
    echo $results['albumTitle']." || ";
    echo "<a>";
    echo $results['artist']." || ";
    echo $results['yearOfRelease']." || ";
}

echo "</body>";
echo "</html>";
?>
