<?
include_once('_CatalystService.php');

/**
 * --- SOCIAL MEDIA SOAP MODEL ---
 */
class SocialMediaSoapModel extends CatalystServiceSoapModel {
 	
 	/**
     * --- INITALIZE ---
     * Initializes the Catalyst Service model... fairly self explanitory.
     */
    public function SocialMediaSoapModel(){
        $this->init();
    }
    
    /**
     * --- WRITE TO SOCIAL_MEDIA_LOG TABLE ---
     */
    public function setSocialMediaLog($socialMediaLogDto) {
    	
	   	if (!empty($this->client))  {
	   	 	  	try {
		            $response = $this->client->setSocialMediaLog(array(
		                'in0' => $socialMediaLogDto
		            ))->out;
		} catch(Exception $e) {
	        	echo 'Exception occurred in setSocialMediaLog ; ', $e->getMessage(), "\n";	        
	        }
			return $response;
		}
		 
		return false;
    }
    
    
    /**
     * --- GET SOCIAL MEDIA LOG ROW From the DB BY BitLyUrlId 
     */
    public function getSocialMediaLogByBitlyUrlId($bitlyUrlId) {
        if($this->client){
        	try {
	            $response = $this->client->getSocialMediaLogByBitlyUrlId(array(
	                'in0' => $bitlyUrlId
	            ))->out;
        	} catch(Exception $e) {
	        	echo 'Exception occurred in getSocialMediaByBitlyUrlId ; ', $e->getMessage(), "\n";	        
	        }
 
	        return $response;
 
        }
 
        return false;
    }
    
    /**
     * --- GET SOCIAL MEDIA LOG ROW From the DB BY BitLyUrlId
     */
    public function getSocialMediaLog($id) {
    	if($this->client){
    		try {
    			$response = $this->client->getSocialMediaLog(array(
    					'in0' => $id
    			))->out;
    		} catch(Exception $e) {
    			echo 'Exception occurred in getSocialMediaLog ; ', $e->getMessage(), "\n";
    		}

    		return $response;
    
    	}
    
    	return false;
    }
    
    
    /** 
     * Set the social media user access token to the DB
     */
    public function setSocialMediaUserAccessToken($userId, $userSettingType, $userAccessToken) {
    	
    	$response = $this->client->setUserAccessToken(array(	'in0' => $userId,
		    													'in1' => $userSettingType,
		    													'in2' => $userAccessToken))->out;
    	
    	return $response;
    }
    
    
    /**
     * Get the social media user access token from the DB
     */
    public function getSocialMediaUserAccessToken($userId, $userSettingType) {
    	 
    	$response = $this->client->getUserAccessToken(array(	'in0' => $userId,
    															'in1' => $userSettingType))->out;
    	 
    	return $response;
    }
    
}
