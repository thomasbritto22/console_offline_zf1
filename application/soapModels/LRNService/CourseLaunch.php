<?php
require_once ('_LrnService.php');

class CourseLaunchServiceSoapModel extends LrnServiceSoapModel {
	
	function CourseLaunchServiceSoapModel() {
		$this->init();
	}
	
	/**
	 * get course launch sess info for a user for a site
	 * @param int userId
     * @param str siteName
	 */	
	function getAiccSessionByUserCompany(){
		if(!empty($this->client)){
			$response = $this->client->getAiccSessionByUserCompany(array(
					'in0' => $this->sess->user->userId,
					'in1' => $this->siteName
			))->out;	
			
			$cleanResponse = '';
			if(!empty($response->dataObject->id)){
				$cleanResponse = $response->dataObject->id;
			}	
		
			return $cleanResponse;
		}
		else return '';
	}
	
	/**
     * --- GET course_xml and page_config for a course  --
     * @param char $systemId
     * @param char $xmlType
     */	 
	public function getCourseXml($systemId,$xmlType) {
		$cleanResponse = '';
		if(!empty($this->client)){
			$response = $this->client->getCourseXml(array(
				'in0' => $this->siteId,
	            'in1'=> $systemId
	        ))->out;
			
			if(!empty($response->dataObject) && $response->dataObject->$xmlType != '')
				$cleanResponse = $response->dataObject->$xmlType;	
		}
		
        return $cleanResponse;
	}
	
	/**
	 * --- GET properties for a course  --
	 * @param char $systemId
	 */
	public function getCourseLookupAndEditionFromSystemId($systemId) {
		$cleanResponse = '';
		if(!empty($this->client)){
			$response = $this->client->getCourseLookupAndEditionFromSystemId(array(
					'in0'=>$systemId
			))->out;
			
			if(!empty($response->dataObject) && $response->dataObject->courseLookupEditionDTOList->CourseLookupEditionDTO != '')
				$cleanResponse = $response->dataObject->courseLookupEditionDTOList->CourseLookupEditionDTO;
		}
		return $cleanResponse;
	}
	
        /**
	 * --- GET properties for a course  --
	 * @param char $systemId
	 */
	public function getCourseLookupAndEditionFromSiteIdSystemId($systemId) {
		$cleanResponse = '';
		if(!empty($this->client)){
			$response = $this->client->getCourseLookupAndEditionFromSiteIdSystemId(array(
					'in0' => $this->siteId,
                                        'in1'=> $systemId
			))->out;
			
			if(!empty($response->dataObject) && $response->dataObject->courseLookupEditionDTOList->CourseLookupEditionDTO != '')
				$cleanResponse = $response->dataObject->courseLookupEditionDTOList->CourseLookupEditionDTO;
		}
		return $cleanResponse;
	}
        
	public function getSiteBaseCatalogConfigs($baseCatalogId,$systemId){
		$cleanResponse = '';
		if(!empty($this->client)){
			$response = $this->client->getSiteBaseCatalogConfigs(array(
					'in0'=> $this->sess->user->userId,
					'in1'=> $this->siteId,
					'in2'=> $this->siteName,
					'in3' => $baseCatalogId,
					'in4' => $systemId
			))->out;
			if(!empty($response->dataObject) && $response->dataObject->siteBaseCatalogConfigDTOList->SiteBaseCatalogConfigDTO != ''){
				if(!is_array($response->dataObject->siteBaseCatalogConfigDTOList->SiteBaseCatalogConfigDTO)){
					 $cleanResponse = array($response->dataObject->siteBaseCatalogConfigDTOList->SiteBaseCatalogConfigDTO);
				}else{
					$cleanResponse = $response->dataObject->siteBaseCatalogConfigDTOList->SiteBaseCatalogConfigDTO;
				}
				
				return $cleanResponse;
			}

		}
		
		return false;
	}
	
	public function getParamConsole($systemId){
		$cleanResponse = '';
		if(!empty($this->client)){
			$response = $this->client->getParamConsole(array(
					'in0' => $this->sess->user->userId,
					'in1' => $this->siteName,
					'in2' => $this->siteId,
					'in3' => $systemId,
					'in4' => $this->sess->user->creationDate,					
			))->out;
			
// 			echo "/* this is from getParam call";
// 			print_r(array(
// 					'in0' => $this->sess->user->userId,
// 					'in1' => $this->sess->siteName,
// 					'in2' => $this->sess->siteId,
// 					'in3' => $systemId,
// 					'in4' => $this->sess->user->creationDate,					
// 			));
			
// 			print_r($response);
// 			echo "end getParam call*/";
			
			if(!empty($response->dataObject)){
				$cleanResponse = $response->dataObject;
			}
		}
		return $cleanResponse;
	}
	
	public function getCourseBUlletinByCompanyCourse($systemId){
		$cleanResponse = '';
		if(!empty($this->client)){
			$response = $this->client->getCourseBUlletinByCompanyCourse(array(
					'in0' => $this->siteName,
					'in1' => $systemId
			))->out;
				
			if(!empty($response->dataObject) && $response->dataObject->courseBulletinDtoList->CourseBulletinDTO != ''){
				if(!is_array($response->dataObject->courseBulletinDtoList->CourseBulletinDTO)) 
					 $cleanResponse = array($response->dataObject->courseBulletinDtoList->CourseBulletinDTO);
				else
					$cleanResponse = $response->dataObject->courseBulletinDtoList->CourseBulletinDTO;
			}
		}
		return $cleanResponse;
	}
	
	/**
	 * Get the image from the Service
	 * @param integer $imageId
	 * @return multitype:array |boolean
	 */
	public function getCourseBulletinImage($imageId){
		
		$cleanResponse = '';
		if(!empty($this->client)){
			$response = $this->client->getCourseBulletinImage(array(
					'in0' => $imageId,
					
			))->out;
	
			if(!empty($response->dataObject) && $response->dataObject->image!= ''){
				if(!is_array($response->dataObject))
					$cleanResponse = array($response->dataObject);
				else
					$cleanResponse = $response->dataObject;
				
				// Since we are going to get only one image
				return $cleanResponse[0];
			}
		}
		
		return false;
	}
	
	
	public function getCourseEventsActionTypes(){
		$cleanResponse = '';
		if(!empty($this->client)){
			$response = $this->client->getCourseEventsActionTypes(array())->out;
		
			if(!empty($response->dataObject) && $response->dataObject->courseEventsActionTypes->string != ''){
				if(!is_array($response->dataObject->courseEventsActionTypes->string))
					$cleanResponse = array($response->dataObject->courseEventsActionTypes->string);
				else
					$cleanResponse = $response->dataObject->courseEventsActionTypes->string;
			}
		}
		return $cleanResponse;
	}
	
	public function getAllCourseStatus(){
		$cleanResponse = '';
		if(!empty($this->client)){
			$response = $this->client->getAllCourseStatus(array())->out;			
			if(!empty($response->dataObject) && $response->dataObject->courseStatusList->CourseStatusCodes != ''){
				if(!is_array($response->dataObject->courseStatusList->CourseStatusCodes))
					$cleanResponse = array($response->dataObject->courseStatusList->CourseStatusCodes);
				else
					$cleanResponse = $response->dataObject->courseStatusList->CourseStatusCodes;
			}
		}
		return $cleanResponse;
	}
	
	/**
	 * Getting Custom Sections Info
	 * Such as Contact Info, Policy Info, and so on.
	 *
	 * @param integer $systemId
	 * @return Ambigous <string, multitype:NULL >
	 */
	public function getCustomSectionsInfo($systemId){
	
		$cleanResponse = '';
		if(!empty($this->client)){
				
			$response = $this->client->getCustomSectionsInfo(array(
					'in0' => $this->siteName,
					'in1' => $systemId
			))->out;
				
			if(!empty($response->dataObject) && $response->dataObject->customSectionsDTOList->CustomSectionsDTO != ''){			
				if(!is_array($response->dataObject->customSectionsDTOList->CustomSectionsDTO))
					$cleanResponse = array($response->dataObject->customSectionsDTOList->CustomSectionsDTO);
				else
					$cleanResponse = $response->dataObject->customSectionsDTOList->CustomSectionsDTO;
			}
			
			return $cleanResponse;
		}
		return false;
	}
	
	public function getCourseVersion($systemId){
	   if(!empty($this->client)){
	      $response = $this->client->getCourseVersion(array(
					'in0' => $this->siteId,
					'in1' => $systemId
		  ))->out;
	      
	      if(!empty($response->dataObject)){
	         return $response->dataObject;
	      }
	   }
	   
	   return false;
	}
	
	/**
	 * Get the custom file info for course
	 * @param array $params
	 * @return boolean
	 */
	public function getCourseCustomFilesInfo($params) {
		
		if(!empty($this->client)){
			$response = $this->client->getCustomFiles(array(
					'in0' => $this->siteName,
					'in1' => $params['filename']
			))->out;
				 
			if(!empty($response->dataObject)){
				return $response->dataObject;
			}
		}
		
		return false;
	}
	
}
