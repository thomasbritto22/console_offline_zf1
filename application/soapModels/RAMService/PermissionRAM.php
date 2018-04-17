<?php
require_once ('_RamService.php');

class PermissionRAMSoapModel extends RamServiceSoapModel {

	function PermissionRAMSoapModel() {
		$this->init();
	}

	/**
	 * --- IS SITE ADMIN ---
	 * Finds out if a user has RAM admin permissions by
	 * asking the RAM service to check for us.
	 * @param unknown_type $userId
	 * @param unknown_type $siteId
	 */
	public function isUserSiteAdmin($userId, $siteId, $siteRootEntityId) {
		$responseServ = new stdClass();
		$responseServ->response = false;
		if(!$this->client->error) {
			try{
				$response = $this->client->isUserSiteAdmin(array(
				'in0' => $userId,
	    		'in1' => $siteId,
	    		'in2' => $siteRootEntityId
			   	 ))->out;
			    if($response->success == true || $response->success == "true") {
			    	if(isset($response->dataObject))
			        	$responseServ->response = $response->dataObject;
			    }
			}catch(Exception $e){
				$responseServ->error = true ;
				$responseServ->errorMsg = "\n\nException: " . $e->getMessage() . "\n\n";
			}
		}else {
			$responseServ->error = true;
			$responseServ->errorMsg = $this->client->errorMsg;
		}
		return $responseServ;
	}

	public function getUserTODOs( $siteId, $userId) {
		$responseServ = new stdClass();
		$responseServ->response = null;
		if(!$this->client->error) {
			try{
			    $response = $this->client->getUserTODOs(array(
			    	'in0' => $siteId,
			    	'in1' => 1,
			    	'in2' => $userId
			    ))->out;
				if($response->success == true || $response->success == "true") {
			        if(isset($response->dataObject))
			        	$responseServ->response = $response->dataObject;
			    }
			}catch(Exception $e){
				$responseServ->error = true ;
				$responseServ->errorMsg = "\n\nException: " . $e->getMessage() . "\n\n";
			}
		}else {
			$responseServ->error = true;
			$responseServ->errorMsg = $this->client->errorMsg;
		}
		return $responseServ;
	}
}
