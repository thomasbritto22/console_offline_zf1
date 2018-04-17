<?
include_once('_CatalystService.php');

/**
 * --- COURSE CUSTOMIZATION SOAP MODEL ---
 * Extends Catalyst Service to get and save course configuration
 * for a site.
 */
class CourseCustomizationSoapModel extends CatalystServiceSoapModel {

 	/**
     * --- INITALIZE ---
     * Initializes the Catalyst Service model.
     */
    public function CourseCustomizationSoapModel(){
        $this->init();
    }

    /**
     * --- GET VISIBILITY TYPES  ---
     * Requests the list of visibility types of courses
     * for a site.
     */
    public function getAllCourseVisibilityTypes() {
    	$response = $this->client->getAllCourseVisibilityTypes(array(
    			'in0'=>$siteId
    	))->out;
    	if (isset($response->dataObject->courseVisibilityTypeListDTO->CourseVisibilityTypeDTO)){
    		return $response->dataObject->courseVisibilityTypeListDTO->CourseVisibilityTypeDTO;
    	}
    	return false;
    }



	/**
     * --- GET LIST OF COURSES  ---
     * Requests the list of courses and data
     * for a particular site.
     * @param long $siteId
     */
	public function getCourseCustomizationBySiteId($siteId) {
		$response = $this->client->getCourseCustomizationBySiteId(array(
            'in0'=>$siteId
        ))->out;
		$cleanResponse = array();
		if (isset($response->dataObject->courseCustomizationDTOList->CourseCustomizationDTO)){
			//this is fault back solution when there is only one object passed from service
			if(!is_array($response->dataObject->courseCustomizationDTOList->CourseCustomizationDTO))
			{
				$response->dataObject->courseCustomizationDTOList->CourseCustomizationDTO =  array($response->dataObject->courseCustomizationDTOList->CourseCustomizationDTO->systemId => $response->dataObject->courseCustomizationDTOList->CourseCustomizationDTO);
			}

			foreach($response->dataObject->courseCustomizationDTOList->CourseCustomizationDTO as $dto){
					if(!isset($cleanResponse[$dto->systemId])){
						$cleanResponse[$dto->systemId] = array();
						$cleanResponse[$dto->systemId] = $dto;
					} else {
						if($dto->status->id == 0)
							$cleanResponse[$dto->systemId] = $dto;
					}
				}//print_r($cleanResponse);exit;
			return $cleanResponse;
		}
        return $cleanResponse;
	}

	/**
	 * --- SAVE COURSE CUSTOMIZED DATA  ---
	 * Save the customized course data entered by the admin
	 * @param object CourseCustomizationDTO
	 */
	public function saveCourseCustomization($saveObj){
		$response = $this->client->saveCourseCustomization(array(
				'in0'=>$saveObj
		))->out;
		if(isset($response->dataObject))
			return $response->dataObject;
		else
			return false;
	}

	/**
	 * --- PUBLISH COURSE CUSTOMIZED DATA  ---
	 * Published the customized course data that was saved by the admin
	 * @param long $siteId
	 * @param long $systemId
	 * @param long $courseCustomizationId
	 */
	public function  publishCourseCustomization($siteId, $systemId, $courseCustomizationId){
		$response = $this->client->publishCourseCustomization(array(
				'in0'=>$siteId,
				'in1'=>$systemId,
				'in2'=>$courseCustomizationId
		))->out;
		if(isset($response->dataObject))
			return $response->dataObject;
		else
			return false;
	}

	/**
	 * --- DELETE COURSE CUSTOMIZED DATA  ---
	 * Delete the customized course data that was saved by the admin
	 * @param long $siteId
	 * @param long $systemId
	 */
	public function  deleteCourseCustomizationBySystemId($siteId, $systemId){
		$response = $this->client->deleteCourseCustomizationBySystemId(array(
				'in0'=>$siteId,
				'in1'=>$systemId
		))->out;
		if(isset($response->dataObject) && $response->dataObject == 1)
			return $response->dataObject;
		else
			return false;
	}

	/**
	 * --- DELETE COURSE CUSTOMIZED DATA  ---
	 * Delete the customized course data that was saved by the admin
	 * @param long $siteId
	 * @param list $systemIds
	 */
	public function getActiveCourseCustomizationBySiteIdSystemIdList($siteId, $systemIds){
		$response = $this->client->getActiveCourseCustomizationBySiteIdSystemIdList(array(
				'in0'=>$siteId,
				'in1'=>$systemIds
		))->out;
		if (isset($response->dataObject->courseCustomizationDTOList->CourseCustomizationDTO)){
			$cleanResponse = array();

			//this is fault back solution when there is only one object passed from service
			if(!is_array($response->dataObject->courseCustomizationDTOList->CourseCustomizationDTO))
			{
				$response->dataObject->courseCustomizationDTOList->CourseCustomizationDTO =  array($response->dataObject->courseCustomizationDTOList->CourseCustomizationDTO->systemId => $response->dataObject->courseCustomizationDTOList->CourseCustomizationDTO);
			}

			foreach($response->dataObject->courseCustomizationDTOList->CourseCustomizationDTO as $dto){
				if(!isset($cleanResponse[$dto->systemId]))
					$cleanResponse[$dto->systemId] = array();
				$cleanResponse[$dto->systemId] = $dto;
			}
			return $cleanResponse;
		}
		return false;
	}

}