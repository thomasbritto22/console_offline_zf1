<?php

require_once ("../application/soapModels/CatalystService/Component.php");
require_once ("../application/soapModels/CatalystService/UserSetting.php");

/**
 * Action Helper for My Queue
 *
 * @uses Zend_Controller_Action_Helper_Abstract
 */
class Helpers_MyQueue extends Zend_Controller_Action_Helper_Abstract
{
	private $_siteId = null;
	private $_mqSettings = null;
        protected $cache = null;

	/**
	 * Constructor: initialize plugin loader
	 *
	 * @return void
	 */
	public function __construct() {
		$this->cache = Zend_Registry::get('memcache');
	}
	
	/**
	 * --- BUILD ALL ELEMENTS ---
	 * This builds all the welcome screen elements
	 *
	 * @return string
	 */
	public function buildAllElements() {
		$this->_mqSettings = $this->getAllMyQueueSettings();
		
		return array(
			'layout' => $this->getMyQueueLayout()
		);
	}
	
	/**
	 * --- GET MY QUEUE LAYOUT ---
	 * This gets the value for the default
	 * My Queue layout overriden by the value
	 * chosen by the individual user
	 *
	 * @return string
	 */
	public function getMyQueueLayout() {
		$layout = array();
		
	    if(empty($this->_mqSettings)) {
			$componentSM = new ComponentSoapModel();
                        $cacheKeyArray = $params = array('login', 'layout');//
                        $componentList = $this->cache->getItemsFromCache($componentSM, 'getComponentsBySection', $params, $cacheKeyArray);
			
			if(!empty($componentList) && $componentList !== (array)$componentList) {
				$componentList = (array)$componentList;
			}
			
			// loop through all components received and
			// add to carouselItems based on groupId
			foreach((array)$componentList as $c) :
				switch($c->componentType) :
					case 'text': //text
						$layout = $c->value;
						break;
				endswitch;
			endforeach;
		}
		else if(isset($this->_mqSettings['layout'])) {
			foreach($this->_mqSettings['layout'] as $item) {
				$layout = $item['text'];
			}
		}
		
		$userSettingSM = new UserSettingSoapModel();
		
		$userSettingList = $userSettingSM->getUserSettingsByUserId($this->_sess->user->userId);
		
		if(isset($userSettingList['my_queue_layout'])) {
			$layout = $userSettingList['my_queue_layout']->value;
		}
		
		//Zend_Debug::Dump($layout); exit();
		 
		return $layout;
	}
	
	/**
	 * --- GET ALL MY QUEUE SETTINGS ---
	 *
	 * Gets all of the settings in relation to My Queue
	 *
	 * @param
	 */
	public function getAllMyQueueSettings() {
		static $mqSettings = null;
		
		if(count($mqSettings) <= 0 && !empty($this->_siteId)) {
			$componentSM = new ComponentSoapModel();
                        $cacheKeyArray = $params = array('my_queue');//
                        $componentList = $this->cache->getItemsFromCache($componentSM, 'getComponentsBySection', $params, $cacheKeyArray);
			
			if(!empty($componentList) && $componentList !== (array)$componentList) {
				$componentList = array($componentList);
			}
			
			$mqSettings = array();
			
			// loop through all components received and
			// add to _wsItems based on subsection then groupId
			foreach((array)$componentList as $c) {

				switch($c->componentType) {
					case 'customfile': //customfile
						$mqSettings[$c->subSection][$c->groupId]['image'] = $this->_baseImgUrl . $c->customFileDTO->path;
						break;
					case 'title': //title
						$mqSettings[$c->subSection][$c->groupId]['title'] = $c->value;
						break;
					case 'text': //text
						$mqSettings[$c->subSection][$c->groupId]['text'] = $c->value;
						break;
				}
			}
		}
		
		//Zend_Debug::Dump($wsItems);
	
		return $mqSettings;
	}
	
	/**
	 * --- SET SITE ID ---
	 *
	 * Sets the classes site ID
	 *
	 * @param string $siteId
	 */
	public function setSiteId($siteId) {
		$_siteId = $siteId;
	}

	/**
	 * Strategy pattern: call helper as broker method
	 *
	 * @param  string $siteId
	 * @return HTML_Output
	 */
	public function direct($sess)
	{
		$this->_sess = $sess;
		$this->_siteId = $sess->siteId;
		
		return $this->buildAllElements();
	}
}