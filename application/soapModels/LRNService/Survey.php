<?php
require_once ('_LrnService.php');

class SurveyServiceSoapModel extends LrnServiceSoapModel {
	
	function SurveyServiceSoapModel() {
		$this->init();
	}
	
	public function saveUserSurveyModule( $userSurveyId, $siteId, $catalogId ) {
		if(!empty($this->client)){
		    $response = $this->client->saveUserSurveyModule(array(
		    	'in0' => $userSurveyId,
		    	'in1' => $this->siteId,
		    	'in2' => $catalogId
		    ))->out;
		    return $response->success;
		}
		else return false;
	}
	
}
