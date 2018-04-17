<?php

require_once ("../application/soapModels/CatalystService/Component.php");

/**
 * Action Helper for Welcome Screen
 *
 * @uses Zend_Controller_Action_Helper_Abstract
 */
class Helpers_Header extends Zend_Controller_Action_Helper_Abstract
{
	private $_siteId = null;
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
	 * --- BASE IMAGE URL ---
	 * This builds the base image url in regards to qa7
	 *
	 * @return string
	 */
	public function baseImgUrl() {
		$qa = '';
		if(strpos($this->getRequest()->getHttpHost(), '.dev3') ||
				strpos($this->getRequest()->getHttpHost(), '.qa'))
			$qa = '.qa7';
	
		return $this->getRequest()->getScheme() . '://' . $this->_siteName . '-console' . $qa . '.lrn.com';
	}
	
	/**
	 * --- BUILD ALL ELEMENTS ---
	 * This builds all the welcome screen elements
	 *
	 * @return string
	 */
	public function buildAllElements() {
		$this->_headItems = $this->getAllHeaderItems();
		
		return array(
			'banner' => $this->buildBanner()
		);
	}
	
	/**
	 * --- BUILD BACKGROUND IMAGE ---
	 * This builds the background image CSS
	 *
	 * @return string
	 */
	public function buildBanner() {
	    if(empty($this->_headItems)) {
			$componentSM = new ComponentSoapModel();
                        
                        $cacheKeyArray = $params = array('Header', 'Banner');//
                        $componentList = $this->cache->getItemsFromCache($componentSM, 'getComponentsBySection', $params, $cacheKeyArray);
			
			if(!empty($componentList) && $componentList !== (array)$componentList) {
				$componentList = (array)$componentList;
			}
			
			$bannerImg = '';
			
			// loop through all components received and
			// add to carouselItems based on groupId
			foreach((array)$componentList as $c) :
				switch($c->componentTypeId) :
					case 'customfile': //custom_file
						$bannerImg = $c->value;
						break;
				endswitch;
			endforeach;
		}
		else {
			foreach($this->_headItems['Banner'] as $item) {
				$bannerImg = $item['image'];
			}
		}
		 
		if(!empty($bannerImg) > 0) {
			return "header h1 { background: url($bannerImg) no-repeat scroll center 0px transparent; text-indent: -9999px; display: block; height: 100%; left: 0; position: absolute; width: 100%; z-index: 1; } header nav { position: relative; z-index: 2; }";
		}
		else {
			return null; //"#header h1 { background: url(/images/branding/default-catalyst.png) no-repeat scroll left top transparent; text-indent: -9999px; }";
		}
	}
	
	/**
	 * --- GET ALL HEADER ITEMS ---
	 *
	 * Gets the VIP Items from the db
	 * and adds them to the _vipItems array
	 *
	 * @param
	 */
	public function getAllHeaderItems() {
		static $headItems = null;
	
		if(count($headItems) <= 0 && !empty($this->_siteId)) {
			$componentSM = new ComponentSoapModel();
                        
                        $cacheKeyArray = $params = array('Header');//
                        $componentList = $this->cache->getItemsFromCache($componentSM, 'getComponentsBySection', $params, $cacheKeyArray);
				
			if(!empty($componentList) && $componentList !== (array)$componentList) {
				$componentList = array($componentList);
			}
			
			//Zend_Debug::Dump($componentList); exit();
				
			$headItems = array();
				
			// loop through all components received and
			// add to _wsItems based on subsection then groupId
			foreach((array)$componentList as $c) {
				switch($c->componentType) {
					case 'customfile': //customfile
						$headItems[$c->subSection][$c->groupId]['image'] = $this->_baseImgUrl . $c->customFileDTO->path;
						break;
					case 'title': //title
						$headItems[$c->subSection][$c->groupId]['title'] = $c->value;
						break;
					case 'text': //text
						$headItems[$c->subSection][$c->groupId]['text'] = $c->value;
						break;
					case 'rc_type': //resource center type
						$headItems[$c->subSection][$c->groupId]['rc_type'] = $c->value;
						break;
					case 'video': //video
						$headItems[$c->subSection][$c->groupId]['video'] = $c->value;
						break;
				}
			}
		}
		
		return $headItems;
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
		$this->_siteName = $sess->siteName;

		$this->_baseImgUrl = $this->baseImgUrl();
		
		return $this->buildAllElements();
	}
}
