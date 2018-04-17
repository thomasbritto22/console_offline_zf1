<?php
require_once ("../application/soapModels/CatalystService/AdminSwitch.php");
/**
 * Action Helper for Admin Features
 *
 * @uses Zend_Controller_Action_Helper_Abstract
 */
class Helpers_Admin extends Zend_Controller_Action_Helper_Abstract {
	private $_siteId = null;
	private $_sess = null;
	private $_adminSM = null;

	/**
	 * Constructor: initialize plugin loader
	 *
	 * @return void
	 */
	public function __construct() {
		$this->_adminSM = new AdminSwitchSoapModel();
	}

	public function getSiteLanguages() {
		
		$languageListTemp = array();
		$statusLangList = array();
		
		if($this->_adminSM->getEnabledSiteLanguages() != null && count($this->_adminSM->getEnabledSiteLanguages() > 0)) {
			$languageListTemp = $this->_adminSM->getEnabledSiteLanguages();
		}
		
		if(!empty($languageListTemp)){
			foreach($languageListTemp as $key => $val)
				$statusLangList[$val->language] = $val;
		}
		$languageList = array();
		$languageList = $this->buildlangObj($this->_sess->siteConfigs['availableLang'],$statusLangList);
		
		return $languageList;
	}

	private function buildlangObj($siteAvailLangList,$statusLangList) {
		$languageList = array();
		$tempLangs = array();
		foreach($siteAvailLangList as $lang)
			$tempLangs[$lang->enName] = $lang;
		ksort($tempLangs);//print_r($tempLangs);
		$siteAvailLangList = array_values($tempLangs);
		
		if (!empty($siteAvailLangList)) {
			foreach ($siteAvailLangList as $lang){
				// create a new dto lang object and set the value
				$langObject = new stdClass;
				$langObject->enabled = 0;
				$langObject->id	  = null;
				if(array_key_exists($lang->language,$statusLangList)){
					$langObject->enabled = $statusLangList[$lang->language]->enabled;
					$langObject->id = $statusLangList[$lang->language]->id;
				}
				$langObject->language	  = $lang->language;
				$langObject->languageName	  = $lang->enName;
				$langObject->siteId	  = $this->_siteId;
				$languageList[] = $langObject;
			}
		}
		return $languageList;
	}

	public function saveSiteLangStatus($enabledLangList) {
		$siteLanguages = array();
		$languagesData = array();
		$siteLanguages = $this->getSiteLanguages();
		
		if(isset($siteLanguages) &&  count($siteLanguages > 0)) {
			foreach($siteLanguages as $lang){
				if(in_array($lang->language, $enabledLangList))
					$lang->enabled = 1;
				else
					$lang->enabled = 0;
			}
			$languagesData = $this->_adminSM->saveEnabledSiteLanguages($siteLanguages);

		}
		
		return $languagesData;
	}

	/**
	 * Strategy pattern: call helper as broker method
	 *
	 * @param  string $siteId
	 * @return HTML_Output
	 */
	public function direct($sess) {
		$this->_siteId = $sess->siteId;
		$this->_sess = $sess;
	}
}
?>