<?php
require_once ('_RamService.php');

class SiteRAMSoapModel extends RamServiceSoapModel {

	function SiteRAMSoapModel() {
		$this->init();
	}

	/**
	 * --- GET SITE CONFIG  ---
	 * get the value of configName for a site
	 * using getSiteConfig function
	 * @param unknown_type $siteId
	 * @param unknown_type $configName
	 */
	public function getSiteConfig($siteId, $configName) { //print_r($this->client);exit;
		$responseServ = new stdClass();
		$responseServ->response = null;
		if(!$this->client->error) {
			try{
				$response = $this->client->getSiteConfig(array(
			    	'in0' => $siteId,
			    	'in1' => $configName
			    ))->out;
			    if($response->success == true || $response->success == "true") {
			    	if(isset($response->dataObject))
			        	$responseServ->response = $response->dataObject;
			    }
			}
			catch(Exception $e){
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
