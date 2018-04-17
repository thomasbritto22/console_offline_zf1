<?php
include_once('_CatalystService.php');

/**
 * --- USER SETTING SOAP MODEL ---
 * Used to get and store settings saved for each specific user
 */
class ConsoleSiteSoapModel extends CatalystServiceSoapModel {
 	
 	/**
     * --- INITALIZE ---
     * Initializes the Catalyst Service model... fairly self explanitory.
     */
    public function ConsoleSiteSoapModel(){
        $this->init();
    }

    public function getSiteSetting($settingName){
       if($this->client){
     		$response = $this->client->getSiteSetting(array(
     		         'in0'=> $this->sess->siteId,
     		         'in1'=> $settingName
     		))->out;
     		
     		if (isset($response->dataObject) && !empty($response->dataObject)){
     		   return $response->dataObject;
     		}
       }
       return false;
    }    
        
    public function getAllSiteSettings($siteId) {
       if(!empty($this->client)){
          $response = $this->client->getAllSiteSettings(array(
                   'in0' => $siteId
          ))->out;

          // clean up the response for easier parsing
          // DO NOT OMIT ANY DATA!!
          $cleanResponse = array();
          if(!is_array($response->dataObject->anyType))
              $response->dataObject->anyType = array($response->dataObject->anyType);
          
          if(!empty($response->dataObject->anyType)){
              
             foreach($response->dataObject->anyType as $c){
              
                $cleanResponse[$c->name] = $c->value;
             }
          }
         
          return $cleanResponse;
       }
       else return false;
    }
    
    /**
     * 
     * @param type $siteName
     * @return boolean||std class object
     */
    public function getParentSite($siteName) {
       if(!empty($this->client)){
          $response = $this->client->getParentSite(array(
                   'in0' => $siteName
          ))->out;

          if(!is_array($response->dataObject))
              $response->dataObject = array($response->dataObject);
          
          return $response->dataObject[0];
       }
       else return false;
    }
}