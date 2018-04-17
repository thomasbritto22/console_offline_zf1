<?php
require_once ('_CatalystService.php');
class UserProfileCustomizationServiceSoapModel extends CatalystServiceSoapModel {

	public function UserProfileCustomizationServiceSoapModel() {
		$this->init();
	}
	
	public function getUserColumnInstructions($lang)
	{
	   if(!empty($this->client)){
	      $response = $this->client->getUserColumnInstructions (array(
	               'in0' => $this->sess->siteId,
	               'in1' => $lang
	      ))->out;
	      
	      if($response->success && isset($response->dataObject->userColumnInstructionDTOList->UserColumnInstructionDTO))
	      {
	         if(is_array($response->dataObject->userColumnInstructionDTOList->UserColumnInstructionDTO))
	         {
	            return $response->dataObject->userColumnInstructionDTOList->UserColumnInstructionDTO;
	         }
	         else
	         {
	            return array($response->dataObject->userColumnInstructionDTOList->UserColumnInstructionDTO);
	         }
	      }
	   }
	   else
	   {
	      return false;
	   }
	}

        public function getPublishedUserColumnInstructions($lang)
	{
	   if(!empty($this->client)){
	      $response = $this->client->getPublishedUserColumnInstructions(array(
	               'in0' => $this->sess->siteId,
	               'in1' => $lang
	      ))->out;
	      
	      if($response->success && isset($response->dataObject->userColumnInstructionDTOList->UserColumnInstructionDTO))
	      {
	         if(is_array($response->dataObject->userColumnInstructionDTOList->UserColumnInstructionDTO))
	         {
	            return $response->dataObject->userColumnInstructionDTOList->UserColumnInstructionDTO;
	         }
	         else
	         {
	            return array($response->dataObject->userColumnInstructionDTOList->UserColumnInstructionDTO);
	         }
	      }
	   }
	   else
	   {
	      return false;
	   }
	}

        
	public function saveUserSelfRegistration($userFieldSettings)
	{
	   if(!empty($this->client)){
	      $response = $this->client->saveUserSelfRegistration(array(
	               'in0' => $userFieldSettings
	      ))->out;
	      
	      if($response->success && isset($response->dataObject->userColumnInstructionDTOList->UserColumnInstructionDTO))
	      {
	         if(is_array($response->dataObject->userColumnInstructionDTOList->UserColumnInstructionDTO))
	         {
	            return $response->dataObject->userColumnInstructionDTOList->UserColumnInstructionDTO;
	         }
	         else
	         {
	            return array($response->dataObject->userColumnInstructionDTOList->UserColumnInstructionDTO);
	         }
	      }
	   }

	   return false;
	}
	
	public function publishUserSelfRegistrationProfile($lang)
	{
	   if(!empty($this->client)){
	      $response = $this->client->publishUserSelfRegistrationProfile(array(
	               'in0' => $this->sess->siteId,
	               'in1' => $lang
	      ))->out;
	      
	      if($response->success && isset($response->dataObject->userColumnInstructionDTOList->UserColumnInstructionDTO))
	      {
	         if(is_array($response->dataObject->userColumnInstructionDTOList->UserColumnInstructionDTO))
	         {
	            return $response->dataObject->userColumnInstructionDTOList->UserColumnInstructionDTO;
	         }
	         else
	         {
	            return array($response->dataObject->userColumnInstructionDTOList->UserColumnInstructionDTO);
	         }
	      }
	   }
	   
	   return false; 
	}

}