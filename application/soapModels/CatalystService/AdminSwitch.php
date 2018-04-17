<?
include_once('_CatalystService.php');

/**
 * --- ADMIN SWITCH SOAP MODEL ---
 * Extends Catalyst Service to get and set admin switches
 * for a site. 
 * @author seema.akre
 */
class AdminSwitchSoapModel extends CatalystServiceSoapModel {
 	
 	/**
     * --- INITALIZE ---
     * Initializes the Catalyst Service model... fairly self explanitory.
     */
    public function AdminSwitchSoapModel(){
        $this->init();
    }
    
	/**
     * --- GET VALUE FOR SWITCHES  ---
     * Requests the list of switch values 
     * for a particular site.
     * @param long $siteId
     * @param array $switchNames
     */	 
	public function getSwitches($siteId, $switchNames) {
		$response = $this->client->getSwitches(array(
            'in0'=>$siteId, 
            'in1'=>$switchNames
        ))->out;
        return $response;
	}
	
	/**
     * --- SET VALUE FOR SWITCHES  ---
     * Requests the list of switch values 
     * for a particular site.
     * @param long $siteId
     * @param array $switchNames
     */
	public function setSwitches($siteId, $switchNames, $switchValues) {
		$response = $this->client->saveSwitches(array(
            'in0'=>$siteId, 
            'in1'=>$switchNames,
		    'in2'=>$switchValues
        ))->out;
        return $response;
	}
	

	/**
	 * Get enabled site languages
	 */
	public function getEnabledSiteLanguages(){
	if($this->client){
		$response = $this->client->getEnabledSiteLanguages(array(
				'in0' => $this->sess->siteId
		))->out;
		
		if($response->success && !empty($response->dataObject->siteLanguageList))
		{
			$cleanResponse = $response->dataObject->siteLanguageList->SiteLanguageDTO;
			return $cleanResponse;
		}
	
		return null;
	}
	return false;
	}
	
	/**
	 * Get enabled site languages
	 */
	public function saveEnabledSiteLanguages($siteLanguages){
		if($this->client){
			$response = $this->client->saveEnabledSiteLanguages(array(
					'in0' => $siteLanguages
			))->out;		
			if($response->success && !empty($response->dataObject->siteLanguageList))
			{
				//$cleanResponse = $response->dataObject->siteLanguageList->SiteLanguageDTO;
				return $response;
			}
	
			return null;
		}
		return false;
	}
	
}