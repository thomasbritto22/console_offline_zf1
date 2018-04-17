<?
include_once('_CatalystService.php');

/**
 * --- USER SETTING SOAP MODEL ---
 * Used to get and store settings saved for each specific user
 */
class UserSettingSoapModel extends CatalystServiceSoapModel {
 	
 	/**
     * --- INITALIZE ---
     * Initializes the Catalyst Service model... fairly self explanitory.
     */
    public function UserSettingSoapModel(){
        $this->init();
    }
    
    /**
     * --- DELETE TRANSLATION ---
     * Sends data to the service for deleting from the database.
     */
    public function deleteUserSetting($settings){
    	if($this->client){
    		$response = $this->client->deleteUserSetting(array(
    				'in0'=>$settings
    		))->out;
    		return $response;
    	}
    	return false;
    }
    
	/**
     * --- GET ALL SETTING TYPES  ---
     * Gets a list of setting types.
     */
	public function getAllSettingTypes() {
	    if($this->client){
    		$response = $this->client->getAllSettingTypes()->out;
    		return $response->dataObject;
	    }
	    return false;
	}
	
	/**
	 * --- GET USER SETTINGS BY USER ID  ---
	 * Gets a list of site translation items by site ID and language.
	 */
	public function getUserSettingsByUserId($userId) {
		if($this->client){
			$response = $this->client->getUserSettingsByUserId(array(
				'in0' => $userId
			))->out;
			
			if(isset($response->dataObject->userSettingsList->UserSettingDTO)) {
				$settingsDTO = $response->dataObject->userSettingsList->UserSettingDTO;
				
				if($settingsDTO === (array)$settingsDTO) {
					$temp = array();
					foreach($settingsDTO as $k => $v) {
						$temp[$v->settingTypeName] = $v;
					}
					
					$settingDTO = $temp;
				}
				else {
					$settingDTO = array($settingsDTO->settingTypeName => $settingsDTO);
				}
				
				return $settingDTO;
			}
			else if(isset($response->dataObject->userSettingsList)) {
				return array($response->dataObject->userSettingsList);
			}
			else {
				return $response->dataObject;
			}
		}
		return false;
	}
	
	/**
	 * --- GET USER SETTINGS BY USER ID, SITE ID  ---
	 * Gets a list of user settings by user id and site id.
	 */
	public function getUserSettingsByUserIdSiteId($userId, $siteId) {
		if($this->client){
			$response = $this->client->getUserSettingsByUserIdSiteId(array(
					'in0' => $userId,
					'in1' => $siteId
			))->out;
			
			if(isset($response->dataObject->translationDTOList->TranslationDTO)) {
				return $response->dataObject->translationDTOList->TranslationDTO;
			}
			else if(isset($response->dataObject->translationDTOList)) {
				return array($response->dataObject->translationDTOList);
			}
			else {
				return $response->dataObject;
			}
		}
		return false;
	}
	
	/**
	 * --- SAVE USER SETTINGS ---
	 * Sends data to the service for saving to database.
	 */
	public function saveUserSettings($settings){
	    if($this->client){
	        $response = $this->client->saveUserSettings(array(
	            'in0'=>$settings
	        ))->out;
	        return $response;
	    }
	    return false;
	}
}