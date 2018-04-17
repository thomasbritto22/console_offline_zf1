<?php
require_once ('_LrnService.php');

class SloServiceSoapModel extends LrnServiceSoapModel {

	function SloServiceSoapModel() {
		$this->init();
	}

	public function validateTrustKey( $formData, $trustKey) {
	    if(!empty($this->client)){
    	    $response = $this->client->validateTrustKey(array(
    	    	'in0' => $formData,
    	    	'in1' => $trustKey,
    	    	'in2' => $this->siteName
    	    ))->out;
		    return $response->dataObject;
		}
		else return false;
	}

    public function authenticate( $formData, $trustKey) {
	    if(!empty($this->client)){
    	    $response = $this->client->authenticate(array(
    	    	'in0' => $formData,
    	    	'in1' => $trustKey,
    	    	'in2' => $this->siteName
    	    ))->out;

    	    Zend_Debug::dump($this->siteName);

    	    return $response;
		}
		else return false;
	}

	public function validateDomain( $groupId, $domain) {
		if(!empty($this->client)){
			$response = $this->client->validateDomain(array(
					'in0' => $groupId,
					'in1' => $domain
			))->out;
			return $response->dataObject;
		}
		else return false;
	}

	public function getSitesThatSupportSLO($envName){
		if(!empty($this->client)){
			$response = $this->client->getSitesThatSupportSLO(array(
					'in0' => $envName
			))->out;
			return $response->dataObject;
		}
		else return false;

	}
	
	public function generateJasperSSOTrustKey($username, $sitename) {
		if(!empty($this->client)){
			$response = $this->client->generateJasperSSOTrustKey(array(
					'in0' => $username,
					'in1' => $sitename
			))->out;
			return $response->dataObject;
		}
		else return false;
	}
}
