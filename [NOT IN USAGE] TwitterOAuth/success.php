<html>
 <head>
  <title>Test PHP</title>
 </head>
 <body>
 <?php 
 	$data = $_SESSION['data'];
	// mostra i miei dati di twitter
	echo "Name : ".$data->name."<br>";
	echo "Username : ".$data->screen_name."<br>";
	echo "Photo : <img src='".$data->profile_image_url."'/><br><br>";
	// mostra oulsante logout se sono dentro
	echo "<a href='?logout=true'><button>Effettua il Logout</button></a>"; ?>
 </body>
</html>