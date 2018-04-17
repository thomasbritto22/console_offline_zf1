<?php
require_once ('_AimService.php');

class PermissionAIMSoapModel extends AimServiceSoapModel {
	
	function PermissionAIMSoapModel() {
		$this->init();
	}
	
	/**
	* --- IS SITE ADMIN ---
	* Finds out if a user has AIM admin permissions by
	* asking the AIM service to check for us.
	* @param unknown_type $userId
	* @param unknown_type $siteId
	*/
	public function isUserSiteAdmin($userId, $siteId) {
	    if(!empty($this->client)){
		    $response = $this->client->isUserSiteAdmin(array(
		    	'in0' => $userId,
		    	'in1' => $this->siteId
		    ))->out;
		    if($response->success == true || $response->success == "true") {
		        return $response->dataObject;
		    }
		    return false;
		}
		else return "false";
	}
	
}
