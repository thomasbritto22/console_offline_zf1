<?php
require_once('Zend/Soap/Client.php');
/**
 * --- CHATTER SOAP MODEL ---
 * This soap model is the super class that all soap models
 * for chatter services will extend
 * @author paul.hayes
 *
 */
class ChatterRESTModel {
	
	protected $client;
	protected $sess;
	protected $siteId;
	protected $rootEntityId;
	protected $loggedInUserId;
	protected $siteName;
	protected $chatterKey;
	protected $secretKey;
	protected $resource;
	private $redirector;
	public $response;
	public $testAction;
	

	
	function ChatterRESTModel() {
	}
	/**
    * --- INITALIZE ---
    * Initializes the soap client for catalyst-services.
	*
    */
	protected function init () {
		$this->_redirector = $this->_helper->getHelper('Redirector');
		

	}

	// TODO: Need clean up
	public function testSoapCall ($call,$params) {
		return $this->client->$call($params)->out;
	}

	
	 public function get(){
	 	try {
	 		$loginResponse = $this->client->request();
	 		$response = $loginResponse->__toString();
			$respString = explode("\n",$response);
	 		$this->response = $loginResponse;
	 		$response = $respString[5];
	 		return $response;
	 	} catch (Exception $e) {
	 		echo "Exception";
	 		Zend_Debug::Dump($e);
	 	}
		
	}
     
	public function login($email,$password, $clientId, $clientSecret){
		//NOTE: change this section to pull values from the database!!!
		
		//Personal Note: Why does the api take username when all the usernames are email addresses?

		
		
		$params = 'grant_type=password' .
				'&scope=access_token'.
				'&client_id=' . $clientId .
				'&client_secret=' . $clientSecret .
				'&username=' . urlencode($email) .
				'&password=' . urlencode($password).
				'&response_type=token'.
				'&redirect_uri='.CHATTER_CALLBACK_URL;
		
		$token_url = CHATTER_OAUTH_URL . 'token';
		
		$curl = curl_init($token_url);
		curl_setopt($curl, CURLOPT_HEADER, false);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($curl, CURLOPT_POSTFIELDS, $params);
		$json_response = curl_exec($curl);
		$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		if ( $status != 200 ) {
			
			return $json_response;
		}
		curl_close($curl);
		return $json_response;
		//echo json_decode($json_response, true);
		
	}
    
    public function getFeed($feedName, $auth_token, $method, $params){
    	
    	//Initialize the feed url
    	if(isset($feedName)){
    		$curl = curl_init($feedName);
    	}
    	
    	//set SSL to be false
    	curl_setopt( $curl, CURLOPT_SSL_VERIFYPEER,  false);
    	
    	//create postFiels if needed

    	if(!empty($params))
    	{
    		$postFields = array();
    		foreach($params as $key => $val){
    			$postFields[$key] = $val;
    		}
    		curl_setopt($curl, CURLOPT_POSTFIELDS, $postFields);
    	}
    	
    	//if we're not posting, make sure CURLOPT_POST is set to false
    	if($method != "POST"){
    		curl_setopt($curl, CURLOPT_POST, 0);
    	}
    	
    	//set up authorization token
    	if(isset($auth_token)){
    		curl_setopt($curl, CURLOPT_HTTPHEADER, array( 'Authorization: Bearer ' . $auth_token ) );
    	}
    	//send the request
    	try{
    		$response = curl_exec($curl);
    		$error = curl_error($curl);
    		return $response;
    		}
    	catch (Exception $e){
    		return $e;
    	}
    		
    }

    
    
    
    public function getUser($instanceURL, $authToken, $clientId){
    	
    	//we're doing 2 calls. one for the user (which includes the thumbnail)
    	//and one for the groups
    	
    	//Initialize the feed url
    	

    	$feedName = $instanceURL . "/services/data/v26.0/chatter/users/me/";

   		$curl = curl_init($feedName);

   		if(false === $curl) {
   		    // throw an exception if curl did not initialize
   		    throw new Exception('failed to initialize');
   		}
    	
    	//set SSL to be false
    	curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    	curl_setopt( $curl, CURLOPT_SSL_VERIFYPEER,  false);
    	 
    	//send in authorization token
    	if(isset($authToken)){
    		curl_setopt($curl, CURLOPT_HTTPHEADER, array( 'Authorization: OAuth ' . $authToken ) );
    	}
    	//send the request
    	try{
    		$response = curl_exec($curl);
    		
    		if(false === $response) {
    		    // connection failed
    		    // throw an exception
    		    throw new Exception(curl_error($response), curl_errno($response));
    		}
    		
    		//check response to make sure the session isnt expired (yes, this happens)
    		
    		$responseObj = json_decode($response);
    		//Zend_Debug::Dump($responseObj);
			if(!empty($responseObj->errorCode)){
				
    			if($responseObj->errorCode == "INVALID_SESSION_ID"){
    				$response = $this->refreshToken($authToken,$clientId);
    			}
			}
    		
    		return $response;
    	}
    	catch (Exception $e){
    	    // log error if the curl connection failed
    		trigger_error(
    		    sprintf(
    		        'Curl failed with error #%d: %s',
    		        $e->getCode(),
    		        $e->getMessage()),
    		    E_USER_ERROR
    	    );
    		sprintf('Curl failed with error #%d: %s', $e->getCode(), $e->getMessage());
    	}
    
    }


    public function getUserGroups($instanceURL, $authToken,$clientId){
    	 
    	//we're doing 2 calls. one for the user (which includes the thumbnail)
    	//and one for the groups
    	 
    	//Initialize the feed url
    	 

    	$feedName = $instanceURL . "/services/data/v26.0/chatter/users/me/groups";
    	 
    	if(isset($feedName)){
    		$curl = curl_init($feedName);
    	}
    	 
    	//set SSL to be false
    	curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    	curl_setopt( $curl, CURLOPT_SSL_VERIFYPEER,  false);
    
    	//send in authorization token
    	if(isset($authToken)){
    		curl_setopt($curl, CURLOPT_HTTPHEADER, array( 'Authorization: OAuth ' . $authToken ) );
    	}
    	//send the request
    	try{
    		$response = curl_exec($curl);
    		$error = curl_error($curl);
    
    		//check response to make sure the session isnt expired (yes, this happens)
    
    		$responseObj = json_decode($response);
    		//Zend_Debug::Dump($responseObj);
    		if(gettype($responseObj) == "array"){
    
    			//if the session is invalid, attempt to refresh the token
    			if($responseObj[0]->errorCode == "INVALID_SESSION_ID"){
    				//$response = $this->refreshToken($authToken,$clientId);
    				return $response;
    			}
    		}
    
    		return $response;
    	}
    	catch (Exception $e){
    		return $e;
    	}
    
    }
    
    
    
    public function refreshToken($postFields){
        $redirectURL = CHATTER_OAUTH_URL . 'token';

	    $fieldsString = '';
	    foreach($postFields as $key=>$value) { $fieldsString .= $key.'='.$value.'&'; }
	    $fieldsString = rtrim($fieldsString, '&');
	    
	    $ch = curl_init($redirectURL);
	     
	    curl_setopt($ch, CURLOPT_POST, 1);
	    curl_setopt($ch, CURLOPT_POSTFIELDS, $fieldsString);
	    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
	    
	    $response = curl_exec($ch);
	    	    
	    if($response) {
	        $toReturn = $response;
	    }
	    else {
	        $toReturn = curl_error($ch);
	    }
	    
	    curl_close($ch);
	    
	    return $toReturn;
    }
    
    
    
    public function post($instanceURL, $group, $authKey, $message){
    	
    	//TODO: grab LOGIN_URI from configdefine("LOGIN_URI", "https://na6.salesforce.com");
		$token_url = $instanceURL . "/services/data/v26.0/chatter/feeds/record/".$group."/feed-items";

		//set up cUrl instance
		//Using PHP's cUrl instead of Zend's due to speed
		
    	$curl = curl_init($token_url);
    	$params = array("text"=>$message);

    	curl_setopt($curl, CURLOPT_HTTPHEADER, array( 'Authorization: OAuth ' . $authKey ) );
    
    	curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    	curl_setopt($curl, CURLOPT_POST, true);
    	curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    	curl_setopt($curl, CURLOPT_POSTFIELDS, $params);
    	$json_response = curl_exec($curl);
    	
    	$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    	$error = curl_error($curl);

    	if ( $status != 200 ) {
    		return $json_response;
    	}
    	curl_close($curl);
    	
    	return $json_response;
    }
    
    private function lcfirst($string) {
            return substr_replace($string, strtolower(substr($string, 0, 1)), 0, 1);
        }
} ?>
