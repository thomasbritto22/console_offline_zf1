<?php
require_once ('_LrnService.php');

class JasperCertServiceSoapModel extends LrnServiceSoapModel {

	function JasperCertServiceSoapModel() {
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
	
	public function getJasperGetParam($systemId){
	   if(!empty($this->client)){
	      $response = $this->client->getJasperGetParam(array(
	               'in0' => $this->sess->user->userId,
	               'in1' => $this->siteId,
	               'in2' => $this->siteName,
	               'in3' => $systemId,
	               'in4' => $systemId,  //courseId,
	      		   'in5' => $this->sess->user->creationDate
	      ))->out;

	      if(isset($response->dataObject->jasperGetParamDTOList) && !empty($response->dataObject->jasperGetParamDTOList)){
	         
	         if (isset($response->dataObject->jasperGetParamDTOList) && !is_array($response->dataObject->jasperGetParamDTOList->JasperGetParamDTO)){
	            $response->dataObject->jasperGetParamDTOList->JasperGetParamDTO = array($response->dataObject->jasperGetParamDTOList->JasperGetParamDTO);
	         }
	         
	         if (isset($response->dataObject->returnedForCorrectionDTO->jasperReturnedQuestionDTOList->JasperReturnedQuestionDTO)
	            && !is_array($response->dataObject->returnedForCorrectionDTO->jasperReturnedQuestionDTOList->JasperReturnedQuestionDTO)
	            && !empty($response->dataObject->returnedForCorrectionDTO->jasperReturnedQuestionDTOList->JasperReturnedQuestionDTO)){
	            
	            $response->dataObject->returnedForCorrectionDTO->jasperReturnedQuestionDTOList->JasperReturnedQuestionDTO = array($response->dataObject->returnedForCorrectionDTO->jasperReturnedQuestionDTOList->JasperReturnedQuestionDTO);
	         }
	         
	         if (isset($response->dataObject->returnedForCorrectionDTO->filesDTOList)
	            && !empty($response->dataObject->returnedForCorrectionDTO->filesDTOList)
	            && !is_array($response->dataObject->returnedForCorrectionDTO->filesDTOList)){
	            $response->dataObject->returnedForCorrectionDTO->filesDTOList = array($response->dataObject->returnedForCorrectionDTO->filesDTOList->FilesDTO);
	         }
	         
	         return $response->dataObject;
	      }
	   }
	    
	   return false;
	}
	
	public function getCompletionCertificateForUserCompanySystemId($systemId){
	   if(!empty($this->client)){
	      $response = $this->client->getCompletionCertificateForUserCompanySystemId(array(
	               'in0' => $this->sess->user->userId,
	               'in1' => $this->siteName,
	               'in2' => $systemId
	      ))->out;

	      if(isset($response->dataObject) && !empty($response->dataObject->completionCertificateDTO)){
	         return $response->dataObject->completionCertificateDTO->CompletionCertificateDTO = array();
	      }
	   }
	    
	   return false;
	}
	
	/**
	 * Call the WSDL for Custom Course Certificate
	 *
	 * @param string $systemId
	 * @return string|boolean
	 */
	public function getCustomCertificationDataInfo( $systemId ) {
	
		$cleanResponse = '';
		if(!empty($this->client)){
	
			$response = $this->client->getJasperCertificateDataFromSystemId(array(
					'in0' => $this->siteId,
					'in1' => $systemId
			))->out;
	
			if(!empty($response->dataObject) && $response->dataObject != ''){
	
				$cleanResponse = $response->dataObject;
	
				return $cleanResponse;
			}
	
			return false;
	
		}
		return false;
	}
	
	/**
	 * Jasper Completion
	 * 
	 * @param array $params
	 * @return object|boolean
	 */
	public function getJasperCompletion($params) {
		
		$cleanResponse = '';
		if(!empty($this->client)){
			
			$response = $this->client->saveJasperCertificationData(array(
					'in0' => $params
	
			))->out; 
 
			if ($response->success) {
				
				if (! empty ( $response->dataObject ) && $response->dataObject != '') {
					
					$cleanResponse = $response->dataObject;
					
					return $cleanResponse;
				}
				
			} else {
				// There is an error
				$cleanResponse = $response->error->message;
				
				return $cleanResponse;
			}
	
			return false;
	
		}
		return false;
	}
	
	/**
	 * Upload Attached files for Jasper Completion
	 * 
	 * @param array $params
	 * @return string|boolean
	 */
	public function getUploadJasperCompletionFileInfo($params) {
		
		$cleanResponse = '';
		if(!empty($this->client)){
	
			$response = $this->client->uploadJasperCompletionFileData(array(
					'in0' => $params
	
			))->out;
			
			if ($response->success) {
				
				if (! empty ( $response->dataObject ) && $response->dataObject != '') {
					
					$cleanResponse = $response->dataObject;
					
					return $cleanResponse;
				}
				
			} else {
				// There is an error
				$cleanResponse = $response->error->message;
				
				// TBD: Need exception/error log file
				
				return false;
			}
	
			return false;
	
		}
		return false;
	}
	
	public function getUnencryptedJasperCompletionFile($fileId){	   
	   if(!empty($this->client)){
	      $response = $this->client->getUnencryptedJasperCompletionFile(array(
	               'in0' => $fileId
	      ))->out;
	      
	      if ($response->success) {
	         if (!empty($response->dataObject) && $response->dataObject != '') {
	            return $response->dataObject;
	         }
	      }
	   }
	   
	   return false;
	}
}