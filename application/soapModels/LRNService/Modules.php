<?php
require_once ('_LrnService.php');

class ModulesServiceSoapModel extends LrnServiceSoapModel {

	function ModulesServiceSoapModel() {
		$this->init();
	}

	public function getModuleBySystemId($systemId) {
	    if(!empty($this->client)){
	        $response = $this->client->getModuleBySystemId(array(
	        	'in0' => $systemId
	        ))->out;
	        return $response->dataObject;
	    }
	    else return false;
	}

	public function getUserModulesStatusCounts(){
		if(!empty($this->client)){
			$response = $this->client->getUserModulesStatusCounts(array(
					'in0' => $this->sess->user->userId,
					'in1' => $this->siteId
			))->out;

			// only return this object, if we have the modules
			if(!empty($response->dataObject)) return $response->dataObject;
			else return false;
		}
		else return false;
	}
        
        public function getMyQueueUserModulesStatusCounts(){
		if(!empty($this->client)){
			$response = $this->client->getMyQueueUserModulesStatusCounts(array(
					'in0' => $this->siteId,
					'in1' => $this->siteName,
                                        'in2' => $this->sess->user->userId,
			))->out;

			// only return this object, if we have the modules
			if(!empty($response->dataObject )) return $response->dataObject ;
			else return false;
		}
		else return false;
	}

	public function getUserAssignedModules(){
		if(!empty($this->client)){
	        $response = $this->client->getUserAssignedModules(array(
	        	'in0' => $this->siteId,
    			'in1' => $this->sess->user->userId,
	        	'in2' => $this->siteName,
	        	'in3' => $this->sess->siteConfigs['Media'],
	        	'in4' => $this->sess->siteConfigs['legacyHostLCEC'],
	        	'in5' => $this->sess->user->creationDate
	        ))->out;

	        // only return this object, if we have the modules
	        if(!empty($response->dataObject->modules)) return $response->dataObject;
	        else return false;
	    }
	    else return false;
	}
        
        public function getMyQueueModules( $showCompCourses ){
		if(!empty($this->client)){
	        $response = $this->client->getMyQueueModules(array(
	        	'in0' => $this->siteId,
    			'in1' => $this->siteName,
	        	'in2' => $this->sess->user->userId,
	        	'in3' => $showCompCourses
	        ))->out;
                
                return $response->dataObject;
	    }
	    else return false;
	}
        
	public function getCompletedModulesForOpenCampaigns(){
		if(!empty($this->client)){
			$response = $this->client->getCompletedModulesForOpenCampaigns(array(
					'in0' => $this->sess->user->userId,
					'in1' => $this->siteId
			))->out;
			// only return this object, if we have the modules
			if(!empty($response->dataObject->modules)) return $response->dataObject;
			else return false;
		}
		else return false;
	}

    public function getUserAssignedCurriculums() {
        if(!empty($this->client)){
    		$response = $this->client->getUserCurriculums(array(
    			'in0' => $this->siteId,
    			'in1' => $this->sess->user->userId,
    		))->out;
    		return $response->dataObject;
        }
        else return false;
	}

	public function getModulesTaken() {
	    if(!empty($this->client)){
    	    $response = $this->client->getModulesTaken(array(
    			'in0' => $this->sess->user->userId,
    			'in1' => $this->siteName,
    			'in2' => $this->siteId
    		))->out;

    	    // we only need the certificates dto, we do not need
    	    // the company name or user ID, we already know those.
    	    $cleanResponse = array();
    	    if(!empty($response->dataObject->completionCertificates->CompletionCertificateDTO)){
    	        $cleanResponse = $response->dataObject->completionCertificates->CompletionCertificateDTO;
    	    }

    	    if(!is_array($cleanResponse)) $cleanResponse = array($cleanResponse);

    		return $cleanResponse;
	    }
	    else return false;
	}

		public function getModulesTakenByCurriculumId($curriculumId) {
	    if(!empty($this->client)){
    	    $response = $this->client->getModulesTakenByCurriculumId(array(
    			'in0' => $this->sess->user->userId,
    			'in1' => $this->siteName,
    			'in2' => $this->siteId,
    			'in3' => $curriculumId
    		))->out;

    	    // we only need the certificates dto, we do not need
    	    // the company name or user ID, we already know those.
    	    $cleanResponse = array();
    	    if(!empty($response->dataObject->completionCertificates->CompletionCertificateDTO)){
    	        $cleanResponse = $response->dataObject->completionCertificates->CompletionCertificateDTO;
    	    }

    	    if(!is_array($cleanResponse)) $cleanResponse = array($cleanResponse);

    		return $cleanResponse;
	    }
	    else return false;
	}

	public function getModulesInCurriculum($curriculumId) {
	    if(!empty($this->client)){
    		$response = $this->client->getModulesByCurriculumId(array(
    			'in0' => $this->siteId,
    			'in1' => $this->sess->user->userId,
    			'in2' => $curriculumId
    		))->out;
    		return $response->dataObject;
	    }
	    else return false;
	}

	public function getUserPendingReviews($status) {
	    if(!empty($this->client)){
    		$response = $this->client->getPendingReviews(array(
    			'in0' => $this->siteId,
    			'in1' => $this->sess->user->userId,
    			'in2' => $status
    		))->out;
    		return $response->dataObject;
	    }
	    else return false;
	}

	public function hasPendingReviews($status) {
	    if(!empty($this->client)){
    		$response = $this->client->hasPendingReviews(array(
    			'in0' => $this->siteId,
    			'in1' => $this->sess->user->userId,
    			'in2' => $status,
    			'in3' => $this->siteName
    		))->out;
    		return $response->dataObject;
	    }
	    else return false;
	}

	public function getCompletionStatus($moduleList) {
	    if(!empty($this->client)){
    		$response = $this->client->getCompletionStatus(array(
    			'in0' => $this->siteId,
    			'in1' => $this->sess->user->userId,
    			'in2' => $moduleList,
    			'in3' => $this->siteName
    		))->out;
    		return $response->dataObject;
	    }
	    else return false;
	}

    public function getReturnedCertification() {
        if(!empty($this->client)){
            $response = $this->client->getReturnedCertificates(array(
    			'in0' => $this->siteId,
    			'in1' => $this->sess->user->userId,
    			'in2' => $this->siteName
    		))->out;

            // only return this object, if we have returned certs
	        if(!empty($response->dataObject->anyType)) return $response->dataObject->anyType;
	        else return false;
        }
        else return false;
	}

	public function getModulePreview($curriculumId, $systemId){
	    if(!empty($this->client)){
	        $response = $this->client->getModulePreview(array(
	        	'in0' => $this->siteId,
    			'in1' => $this->sess->user->userId,
	        	'in2' => $curriculumId,
	        	'in3' => $systemId,
	        	'in4' => $this->siteName,
	        	'in5' => $this->sess->siteConfigs['legacyHostLCEC'],
	        	'in6' => $this->sess->user->creationDate
	        ))->out;
	        return $response->dataObject;
	    }
	    else return false;
	}
	
	public function checkCourseInSiteCampaign($systemId){
		if(!empty($this->client)){
			$response = $this->client->checkCourseInSiteCampaign(array(
					'in0' => $this->siteId,
					'in1' => $systemId
			))->out;
			
			return $response;
		}
		else return false;
	}

	public function getModulePreviewForTwitter($curriculumId, $systemId, $siteId, $userId){
		if(!empty($this->client)){
			$response = $this->client->getModulePreview(array(
					'in0' => $siteId,
					'in1' => $userId,
					'in2' => $curriculumId,
					'in3' => $systemId,
					'in4' => null,
					'in5' => null,
					'in6' => null
			))->out;
			return $response->dataObject;
		}
		else return false;
	}
	
	public function getCompletionCertificateStatus($certificateId){
	   if(!empty($this->client)){
	      $response = $this->client->getCompletionCertificateStatus(array(
	               'in0' => $certificateId
	      ))->out;
	     
	      if (isset($response->success) && true == $response->success && isset($response->dataObject) && 'RET' !== $response->dataObject){
	         return true;
	      }
	   }else{
	      return false;
	   }
	}
}
