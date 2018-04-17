<?php
require_once ('_LrnService.php');

class SamlServiceSSoapModel extends LrnServiceSoapModel {

	function SamlServiceSSoapModel() {
		$this->init();
	}

	public function genResponse( $userName, $siteId  ) {
	    if(!empty($this->client)){
    	    //signingRequired and encryptionRequired are set to 1 so that encryption is implemented
    		$response = $this->client->genResponse(array(
    			'in0' => $userName,
    			'in1' => $this->siteId,
    			'in2' => 1,
    			'in3' => 1
    		))->out;
    		return $response->dataObject;
	    }
	    else return false;
	}

    public function consumeSaml($metadataUrl, $samlResponse) {
        if(!empty($this->client)){
	        $response = $this->client->consumeSaml(array(
	        	'in0' =>(string)$metadataUrl,
	        	'in1' => (string)$samlResponse,
	        	'in2' => '',
	        	'in3' => '',
	        	'in4' => false
	        ))->out;
            return $response;
	    }
	    else return false;
	}
}
