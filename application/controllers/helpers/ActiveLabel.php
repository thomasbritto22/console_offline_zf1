<?
require_once ("../application/soapModels/CatalystService/Translation.php");

/**
 * Action Helper for Active Labels
 *
 * @uses Zend_Controller_Action_Helper_Abstract
 */
class Helpers_ActiveLabel extends Zend_Controller_Action_Helper_Abstract {
	private $_siteId = null;
	private $_translate = null;
	
	/**
	 * Constructor: initialize plugin loader
	 *
	 * @return void
	 */
	public function __construct() {
		$this->_translate = new TranslationSoapModel();
	}
	
	/**
	 * 
	 * Building get All the Label By Language and site
	 *
	 * @return string
	 */
	
	public function getLabelRecords($lang)
	{
		$labels = $this->_translate->getActiveTranslationLabels($this->_siteId, isset($lang)? $lang : DEFAULT_LANGUAGE);
	 
		if (false !== $labels && is_array($labels))
		{
			$labelRecords = array();
			
			foreach ($labels as $label)
			{
			   if ($label->protect != 1){
					$labelRecords[] = array(
							'defaultField' => !is_null($label->defaultTranslationValue) ? $label->defaultTranslationValue : '',
							'suggestTranlation' => !is_null($label->suggestedTranslationValue) ? $label->suggestedTranslationValue : '',
							'customEng' => !is_null($label->customEnglishTranslationValue) ? $label->customEnglishTranslationValue : '',
							'customOtherLang' => !is_null($label->translationValue) ? $label->translationValue : '',
							'translationKeyId' => !is_null($label->translationKeyId) ? $label->translationKeyId : '',
							'translationKey' => !is_null($label->translationKey) ? $label->translationKey : '',
							'translationId'  => !is_null($label->translationId) && !empty($label->translationId) ? $label->translationId : '',
							'protect' => !is_null($label->protect) && !empty($label->protect) ? $label->protect : '',
						);
				}
			}
			
			return $labelRecords;
			
		}else{
		   return false;
		}
	}
	
	public function getLabelByLang($lang)
	{
	   /*
	    * Trying to build the Json data string
	   */
	   $jsonStr = '{"aaData":[]}';
	   
	   $records = $this->getLabelRecords($lang);
	   
	   if(false !== $records){
	      $jsonArr['aaData'] = $records;
	      $jsonStr = json_encode($jsonArr);
	   }
	   
	   return $jsonStr; 
	}
	
	public function saveCustomLabel($customValues)
	{
		if (isset($customValues) && is_array($customValues) ){
			$sitting = array();
			
			foreach($customValues as $label)
			{
				$sitting[] = $this->buildSaveLabelObj($label);
			}
			
			$response = $this->_translate->saveTranslation($sitting);
			
			if (isset($response->success) && true === $response->success)
			{	
				$dataJson = $this->serviceResponseJsonHandler($response);
				return '{"success":true,' .($dataJson ? '"data":' .$dataJson : '"data":{}'). '}';
			}
		}
		
		return '{"success":false}';
	}
	
	private function buildSaveLabelObj($label)
	{
		if (isset($label) && !empty($label)) {
			// create a new dto label object and set the value
			$labelObject = new stdClass;
			$labelObject->siteId = $this->_siteId;
			$labelObject->language = $label['lang'];
			$labelObject->translationKey = $label['translationKey'];
			$labelObject->translationId = $label['translationId'];
			$labelObject->translationValue = $label['value'];
			return $labelObject;
		}
	}
	
	private function serviceResponseJsonHandler($response)
	{
		if (isset($response->dataObject->translationDTOList->TranslationDTO))
		{
			if (count($response->dataObject->translationDTOList->TranslationDTO) <= 1)
			{
				return '[' .json_encode($response->dataObject->translationDTOList->TranslationDTO). ']';
			}
			else
			{
				return json_encode($response->dataObject->translationDTOList->TranslationDTO);
			}
		}
		
		return false;
	}
	
	/**
	 * Strategy pattern: call helper as broker method
	 *
	 */
	public function direct($siteId)
	{
		$this->_siteId = $siteId;
	}
}
?>