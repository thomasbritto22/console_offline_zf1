<?php
require_once ('_LrnService.php');

class CourseUpdateServiceSoapModel extends LrnServiceSoapModel {
	
	function CourseUpdateServiceSoapModel() {
		$this->init();
	}
	
	//save new session id for user into the db
	function createAiccSession($cLSessData){
		if(!empty($this->client)){
			$response = $this->client->createAiccSession(array(
					'in0' => $cLSessData
			))->out;	
			
			$cleanResponse = false;
			if(!empty($response->success) && $response->success == 1){
				$cleanResponse = true;
			}			
			return $cleanResponse;
		}
		else return false;
	}
	
	function putParamConsole($courseUpdateObj, $userCreationDate){
		if(!empty($this->client)){
			$response = $this->client->putParamConsole(array(
					'in0' => $courseUpdateObj,
					'in1' => $this->siteId,
					'in2' => $userCreationDate
			))->out;

			$cleanResponse = false;
			if(!empty($response->success) && $response->success == 1){
				$cleanResponse = true;
			}
			return $cleanResponse;
		}
		else return false;
	}
	
	function addCourseSessionsEvent($sessionObj){
	   if(!empty($this->client)){
	      $response = $this->client->addCourseSessionsEvent(array(
	               'in0' => $sessionObj
	      ))->out;

	      if(!empty($response->success) && $response->success == 1){
	         return true;
	      }  
	   } 
	   
	   return false;
	}
	
}
