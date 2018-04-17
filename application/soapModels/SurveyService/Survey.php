<?php
require_once ('_SurveyService.php');

class SurveySoapModel extends SurveySrvSoapModel {
	
	function SurveySoapModel() {
		$this->init();
	}
	
	public function getSurveyDetail( $surveyId ) {
		$response = $this->client->getSurveyDetail(array('in0' => $surveyId))->out;
		return $response;
	}
	
}
