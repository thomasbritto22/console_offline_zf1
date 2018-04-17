<?
include_once('_CatalystService.php');

/**
 * --- TRANSLATION SOAP MODEL ---
 * Used to get and store the following: site labels, error messages, etc.
 */
class TranslationSoapModel extends CatalystServiceSoapModel {
 	
 	/**
     * --- INITALIZE ---
     * Initializes the Catalyst Service model... fairly self explanitory.
     */
    public function TranslationSoapModel(){
        $this->init();
    }
    
	/**
     * --- GET ALL TRANSLATION KEY TYPES  ---
     * Gets a list of translation key types.
     */
	public function getAllTranslationKeyTypes() {
	    if($this->client){
    		$response = $this->client->getAllTranslationKeyTypes()->out;
    		return $response->dataObject;
	    }
	    return false;
	}
	
	/**
	 * --- GET TRANSLATIONS BY SITE ID, LANG  ---
	 * Gets a list of site translation items by site ID and language.
	 */
	public function getTranslationsBySiteIdLang($siteId, $lang) {
		if($this->client){
			$response = $this->client->getTranslationsBySiteIdLang(array(
				'in0' => $siteId,
				'in1' => $lang
			))->out;
			
			if(isset($response->dataObject->translationDTOList->TranslationDTO)) {
				return $response->dataObject->translationDTOList->TranslationDTO;
			}
			else if(isset($response->dataObject->translationDTOList)) {
				return (array)$response->dataObject->translationDTOList;
			}
			else {
				return $response->dataObject;
			}
		}
		return false;
	}
	
	/**
	 * --- GET TRANSLATIONS BY SITE ID, TYPE, LANG  ---
	 * Gets a list of site translation items by site ID and language.
	 */
	public function getTranslationsBySiteIdTypeLang($siteId, $type, $lang) {
		if($this->client){
			$response = $this->client->getTranslationsBySiteIdTypeLang(array(
					'in0' => $siteId,
					'in1' => $type,
					'in2' => $lang
			))->out;
			
			if(isset($response->dataObject->translationDTOList->TranslationDTO)) {
				return $response->dataObject->translationDTOList->TranslationDTO;
			}
			else if(isset($response->dataObject->translationDTOList)) {
				return (array)$response->dataObject->translationDTOList;
			}
			else {
				return $response->dataObject;
			}
		}
		return false;
	}
	
	/**
	 * --- GET TRANSLATIONS BY SITE ID, type as instruction, LANG  ---
	 * Gets a list of site translation items by site ID and language for site instructions.
	 */
	public function getTranslationsPassInstrBySiteIdLang($siteId, $lang) {
		if($this->client){
			$response = $this->client->getTranslationsBySiteIdInstrTypeLang(array(
					'in0' => $siteId,
					'in1' => $lang
			))->out;
			
			if(isset($response) && !empty($response))
			{
				$response->data = array(
						"translationId" => (isset($response->dataObject->translationDTOList->TranslationDTO->translationId) ? $response->dataObject->translationDTOList->TranslationDTO->translationId : ''),
						"passInstr"	=> (isset($response->dataObject->translationDTOList->TranslationDTO->translationValue) ? $response->dataObject->translationDTOList->TranslationDTO->translationValue : ''),
					);
				return $response;
			}
		}
		return false;
	}
	
	/**
	 * --- SAVE TRANSLATION ---
	 * Sends data to the service for saving to database.
	 */
	public function saveTranslation($settings){
		if($this->client){
			$response = $this->client->saveTranslation(array(
					'in0'=>$settings
			))->out;
				
			if(isset($response) && !empty($response))
			{
				return $response;
			}
		}
		return false;
	}
	
	/**
	 * --- DELETE TRANSLATION ---
	 * Sends data to the service for saving to database.
	 */
	public function deleteTranslation($settings){
		if($this->client){
			$response = $this->client->deleteTranslation(array(
					'in0'=>$settings
			))->out;
			return $response;
		}
		return false;
	}
	
	/*
	 * To get the Active Label which is belong to the site and to the specific language
	 */
	public function getActiveTranslationLabels($siteId, $langCode)
	{
		if($this->client){
			$response = $this->client->getActiveTranslationLabels(
				array(
					'in0' => $siteId,
					'in1' => $langCode,
				))->out;
				
				if (isset($response->dataObject->activeLabelTranslationDTOList->ActiveTranslationLabelDTO))
				{
					return (array) $response->dataObject->activeLabelTranslationDTOList->ActiveTranslationLabelDTO;
				}
		}
		return false;
	}
	public function getAllLanguages(){
		if($this->client){
			return $this->client->getAllLanguages()->out->dataObject->languagesList->LanguageDTO;
		}
		return false;
	}
	
	/**
	 * Getting word translation for courses
	 * 
	 * @param string $keyword
	 * @param string $lang
	 * @return boolean|string
	 */
	public function getTranslationsByKeyLang($keyword,$lang){
		
		if($this->client){
			$response = $this->client->getTranslationsByKeyLang(array(
					'in0' => $keyword,
					'in1' => $lang
			))->out;
				
			if (isset($response->dataObject->translationDTOList->TranslationDTO))
			{
					return $response->dataObject->translationDTOList->TranslationDTO;
			}
		}
		return false;
	}
}