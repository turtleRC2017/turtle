<html>
 <head>
  <title>Test PHP</title>
 </head>
 <body>
 <?
	require_once('twitteroauth/OAuth.php');
	require_once('twitteroauth/twitteroauth.php');
	define('CONSUMER_KEY', 'Y8eUjQ8P4OXFx9lXTFTfyj5bm');
	define('CONSUMER_SECRET', 'zoFjFhSKv14rYRYBo8YYhjkoLgoL6m97AZhQkobdaREFLnlXXf');
	define('OAUTH_CALLBACK', 'http://localhost/index.php');
	session_start();

	// gestione richeiste logout
	if(isset($_GET['logout'])){
		session_unset();
		// redirect per sicurezza parametri
		$redirect = 'http://' . $_SERVER['HTTP_HOST'] . $_SERVER['PHP_SELF'];
  		header('Location: ' . filter_var($redirect, FILTER_SANITIZE_URL));
	}


	// se user session non abilitata prendi url
	if(!isset($_SESSION['data']) && !isset($_GET['oauth_token'])) {
		// creata nuovo twitter connection 
		$connection = new TwitterOAuth(CONSUMER_KEY, CONSUMER_SECRET);
		// prende il token dall oggetto di connessione
		$request_token = $connection->getRequestToken(OAUTH_CALLBACK); 
		// se request token esiste prendilo e salvalo nella connessione
		if($request_token){
			$token = $request_token['oauth_token'];
			$_SESSION['request_token'] = $token ;
			$_SESSION['request_token_secret'] = $request_token['oauth_token_secret'];
			// get the login url from getauthorizeurl method
			$login_url = $connection->getAuthorizeURL($token);
		}
	}

	// se è un url callback,..
	if(isset($_GET['oauth_token'])){
		// creata un nuovo oggetto twitter connection
		$connection = new TwitterOAuth(CONSUMER_KEY, CONSUMER_SECRET, $_SESSION['request_token'], $_SESSION['request_token_secret']);
		// prende access token dal metodo getAccesToken
		$access_token = $connection->getAccessToken($_REQUEST['oauth_verifier']);
		if($access_token){	
			$connection = new TwitterOAuth(CONSUMER_KEY, CONSUMER_SECRET, $access_token['oauth_token'], $access_token['oauth_token_secret']);
			// setta l'array dei parametri
			$params =array('include_entities'=>'false');
			// acquisisce i dati
			$data = $connection->get('account/verify_credentials',$params);
			if($data){
				// salva i dati nella attuale sessione
				$_SESSION['data']=$data;
				// redirect per rimuovere paramentri da url (sicurezza)
				$redirect = 'http://' . $_SERVER['HTTP_HOST'] . $_SERVER['PHP_SELF'];
  				header('Location: ' . filter_var($redirect, FILTER_SANITIZE_URL));
			}
		}
	}

	if(isset($login_url) && !isset($_SESSION['data'])){
		// se non ho i dati manda al login url
		echo "<a href='$login_url'><img src='twitter.png'></a>";
	}
	else{
		//se ho i dati mostrali..
		$data = $_SESSION['data'];
		// mostra i miei dati di twitter
		echo "Name : ".$data->name."<br>";
		echo "Username : ".$data->screen_name."<br>";
		echo "Photo : <img src='".$data->profile_image_url."'/><br><br>";
		// mostra oulsante logout se sono dentro
		echo "<a href='?logout=true'><button>Effettua il Logout</button></a>";

	}  
?>
 </body>
</html>
