<?php
require_once ('_SurveyService.php');

class AnswerSoapModel extends SurveySrvSoapModel {
	
	function AnswerSoapModel() {
		$this->init();
	}
	
    public function startSession( $surveyId, $userId ) {
		$response = $this->client->startSession(array(
			'in0' => $surveyId,
			'in1' => $userId
		))->out;
		return $response;
	}
	
    public function endSession( $surveyId ) {
		$response = $this->client->endSession(array(
			'in0' => $surveyId
		))->out;
		return $response;
	}
	
	public function answerSurveyQuestions( $surveyAnswer ) {
		$response = $this->client->answerSurveyQuestions(array(
			'in0' => $surveyAnswer
		))->out;
		return $response;
	}
	
}
