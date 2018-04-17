<?php
require_once ('_LrnService.php');
class UserProfileServiceSoapModel extends LrnServiceSoapModel {

	function UserProfileServiceSoapModel() {
		$this->init();
	}

	public function getUserProfileDetails( $userId, $lang ) {
		if(!empty($this->client)){
			$response = $this->client->getUserProfileDetails(array(
					'in0' => $userId,
					'in1' => $this->siteId,
					'in2' => $lang
			))->out;
			return $response->dataObject;
		}
		else return false;
	}
	
	public function updateUserProfileDetails( $userSettings ) {
		if(!empty($this->client)){
			$response = $this->client->updateUserProfileDetails(array(
					'in0' => $userSettings
			))->out;
			return $response;
		}
		else return false;
	}
	
	public function getUserSelfRegistrationProfileDetails($lang)
	{
	   if(!empty($this->client)){
	      $response = $this->client->getUserSelfRegistrationProfileDetails(array(
	               'in0' => $this->siteId,
	               'in1' => $lang
	      ))->out;
	      
	      if($response->success && isset($response->dataObject->companyUsersColumnDTOList->CompanyUsersColumnDTO))
	      {
	         if(is_array($response->dataObject->companyUsersColumnDTOList->CompanyUsersColumnDTO))
	         {
	            return $response->dataObject->companyUsersColumnDTOList->CompanyUsersColumnDTO;
	         }
	         else
	         {
	            return array($response->dataObject->companyUsersColumnDTOList->CompanyUsersColumnDTO);
	         }
	      }
	   }
	   else
	   {
	      return false;
	   }
	}

}