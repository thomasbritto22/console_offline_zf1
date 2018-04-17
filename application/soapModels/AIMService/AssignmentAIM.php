<?php
require_once ('_AimService.php');

class AssignmentAIMSoapModel extends AimServiceSoapModel {
	
	function AssignmentAIMSoapModel() {
		$this->init();
	}
	
	public function getAssignedSurveys( $userId, $siteId, $userCreationDate ) {
		if(!empty($this->client)){
    	    $response = $this->client->getAssignedSurveys(array(
    	    	'in0' => $userId,
    	    	'in1' => $this->siteId,
    	    	'in2' => $userCreationDate
    	    ))->out;
    		return $response->dataObject;
		}
		else return false;
	}
	
}
