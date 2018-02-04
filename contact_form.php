<?php

require 'class.phpmailer.php';

require '/home/solution/creds/truerisk_credentials.php';



$err_message = '';



$first_name = stripcslashes( $_POST[ 'firstName' ] );

$last_name = stripcslashes( $_POST[ 'lastName' ] );

$title = stripcslashes( $_POST[ 'title' ] );

$company = stripcslashes( $_POST[ 'company' ] );

$email = stripcslashes( $_POST[ 'emailAddress' ] );

$phone = stripcslashes( $_POST[ 'busPhone' ] );

$state = stripcslashes( $_POST[ 'stateProv' ] );

$industry = stripcslashes( $_POST[ 'srg-industry-dropdown' ] );

$utmsource = stripcslashes( $_POST[ 'utmsource' ] );
$utmkeyword = stripcslashes( $_POST[ 'utmkeyword' ] );
$utmmedium = stripcslashes( $_POST[ 'utmmedium' ] );

//$state = stripcslashes($_POST['state']); 



function validateEmail( $email ) {

	if ( preg_match( "/^[_\.0-9a-zA-Z-]+@([0-9a-zA-Z][0-9a-zA-Z-]+\.)+[a-zA-Z]{2,6}$/i", $email ) ) {

		return true;

	} else {

		return false;

	}

}



if ( strlen( $first_name ) < 1 || $first_name == 'First name' ) {

	$err_message .= 'firstName,';

}

if ( strlen( $last_name ) < 1 || $last_name == 'Last name' ) {

	$err_message .= 'lastName,';

}

if ( strlen( $company ) < 1 || $company == 'Company' ) {

	$err_message .= 'company,';

}


if ( strlen( $title ) < 1 || $title == 'Title' ) {

	$err_message .= 'title,';

}


if ( strlen( $phone ) < 1 || $phone == 'Phone' ) {

	$err_message .= 'busPhone,';

}

if ( strlen( $state ) < 1 || $state == 'Select a State' ) {

	$err_message .= 'state,';

}

if ( strlen( $industry ) < 1 || $industry == 'Select an industry' ) {

	$err_message .= 'industry,';

}

if ( strlen( $email ) < 1 || validateEmail( $email ) == FALSE ) {

	$err_message .= 'email,';

}



// validation errors

if ( $err_message != '' ) {



	print json_encode( array( 'returned_val' => $err_message, 'type' => 'error' ) );



} else { // all clear - success



	$successMessage = 'Thanks for registering.';



	//Initialize the $query_string variable for later use

	$query_string = "";



	//Initialize the $kv array for later use

	$kv = array();



	//For each POST variable as $name_of_input_field => $value_of_input_field

	foreach ( $_POST as $key => $value ) {



		//Set array element for each POST variable (ie. first_name=Arsham)

		$kv[] = stripslashes( $key ) . "=" . stripslashes( $value );



	}



	//Create a query string with join function separted by &

	$query_string = join( "&", $kv );





	//Check to see if cURL is installed ...

	if ( !function_exists( 'curl_init' ) ) {

		die( 'Sorry cURL is not installed!' );

	}



	//The original form action URL from Step 2 :)

	$url = 'https://s1834359157.t.eloqua.com/e/f2';
	// $url = 'https://www.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8';

	//$retUrl = 'http://' . $_SERVER['HTTP_HOST'] . '/index.php?screen=thanks';



	//Open cURL connection

	$ch = curl_init();



	//Set the url, number of POST vars, POST data

	curl_setopt( $ch, CURLOPT_URL, $url );

	curl_setopt( $ch, CURLOPT_POST, count( $kv ) );

	curl_setopt( $ch, CURLOPT_POSTFIELDS, $query_string );



	//Set some settings that make it all work :)

	curl_setopt( $ch, CURLOPT_HEADER, FALSE );

	curl_setopt( $ch, CURLOPT_RETURNTRANSFER, FALSE );

	curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, TRUE );



	//Execute SalesForce web to lead PHP cURL

	$result = curl_exec( $ch );



	//close cURL connection

	curl_close( $ch );

	if ( $result == 'ok' )

	{

		$type = 'prospect';



		// log to db - prospect

		$dbh = new PDO( 'mysql:host=' . $host . ';dbname=' . $dbname, $user, $pass );



		$stmt = $dbh->prepare( "INSERT INTO responses_internetretailer (first_name, last_name, title, company, email, phone, state, industry, utmsource, utmkeyword, utmmedium) VALUES (:first_name, :last_name, :title, :company, :email, :phone, :state, :industry, :utmsource, :utmkeyword, :utmmedium)" );

		$stmt->bindParam( ':first_name', $db_first_name );
		$stmt->bindParam( ':last_name', $db_last_name );
		$stmt->bindParam( ':title', $db_title );
		$stmt->bindParam( ':company', $db_company );
		$stmt->bindParam( ':email', $db_email );
		$stmt->bindParam( ':phone', $db_phone );
		$stmt->bindParam( ':state', $db_state );
		$stmt->bindParam( ':industry', $db_industry );		
		$stmt->bindParam( ':utmsource', $db_utmsource );
		$stmt->bindParam( ':utmkeyword', $db_utmkeyword );
		$stmt->bindParam( ':utmmedium', $db_utmmedium );		
		// $stmt->bindParam(':state', $db_state);
		// $stmt->bindParam(':type', $db_type);


		$db_first_name = $first_name;
		$db_last_name = $last_name;
		$db_title = $title;
		$db_company = $company;
		$db_email = $email;
		$db_phone = $phone;
		$db_state = $state;
		$db_industry = $industry;		
		$db_utmsource = $utmsource;
		$db_utmkeyword = $utmkeyword;
		$db_utmmedium = $utmmedium;		
		//  $db_state = $state;
		//      $db_type = $type;

		$stmt->execute();



		$dbh = null;



		print json_encode( array( 'returned_val' => $successMessage, 'type' => 'success', 'email' => $email ) );

	} else {

		$err_message = 'There was an error submitting the form. Please try again later. The administrator has been notified.';



		$mail = new PHPMailer;



		$mail->From = $email;

		$mail->FromName = $first_name;

		// $mail->AddAddress('gangelo@transunion.com', 'Gerald Angelo'); // Add a recipient

		$mail->AddAddress( 'jiacono@transunion.com', 'Juliana Iacono' ); // Add a recipient

		$mail->AddReplyTo( $email, $first_name );



		$mail->WordWrap = 50; // Set word wrap to 50 characters

		$mail->IsHTML( true ); // Set email format to HTML



		$mail->Subject = 'DVM Disruptor Landing: Error Submitting Form';

		$mail->Body = 'There was an attempt to submit a form. Connection to salesforce failed. The user saw the following error: ' . $successMessage;

		$mail->AltBody = 'There was an attempt to submit a form. Connection to salesforce failed. The user saw the following error: ' . $successMessage;



		if ( !$mail->Send() ) {

			$err_Message = 'There was an error submitting the form and an error email could not be sent. Mailer Error: ' . $mail->ErrorInfo;

		}



		print json_encode( array( 'returned_val' => $err_message, 'type' => 'error' ) );

	}



}