<?php
require_once ('_LrnService.php');

class AccessControlServiceSoapModel extends LrnServiceSoapModel {
	
	function AccessControlServiceSoapModel() {
		$this->init();
	}
	
	public function getLegacyApplicationAccess( $userId ) {
	    if(!empty($this->client)){
    		$response = $this->client->getLegacyApplications(array(
    			'in0' => $userId,
    			'in1' => $this->siteId
    		))->out;
    		return $response->dataObject;
	    }
	    else return false;
	}
	
}
