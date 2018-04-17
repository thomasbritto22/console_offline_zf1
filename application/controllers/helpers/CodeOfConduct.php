<?php

require_once ("../application/soapModels/CatalystService/Component.php");

/**
 * Action Helper for Code of Conduct
 *
 * @uses Zend_Controller_Action_Helper_Abstract
 */
class Helpers_CodeOfConduct extends Zend_Controller_Action_Helper_Abstract
{
	private $_siteId = null;
	private $_ccItems = null;
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
		$this->_ccItems = $this->getAllCodeOfConductItems();
		
		return array(
			'link' => $this->buildLink(),
		    'text' => $this->getBlurb(),
		    'toggle' => $this->getToggle()
		);
	}
	
	/**
	 * --- GET BLURB ---
	 * This gets the blurb for the code of conduct
	 *
	 * @return string
	 */
	public function getBlurb() {
	    $blurb = '';
	    
	    if(empty($this->_ccItems)) {
	        $componentSM = new ComponentSoapModel();
                $cacheKeyArray = $params = array('code_of_conduct');//
                $componentList = $this->cache->getItemsFromCache($componentSM, 'getComponentsBySection', $params, $cacheKeyArray);
	        	
	        if(!empty($componentList) && $componentList !== (array)$componentList) {
	            $componentList = array($componentList);
	        }
	        	
	        // loop through all components received and
	        // add to carouselItems based on groupId
	        foreach((array)$componentList as $c) :
    	        switch($c->componentType) :
        	        case 'text': //text
        	            $blurb = $c->value;
        	        break;
    	        endswitch;
	        endforeach;
	    }
	    else if(isset($this->_ccItems['code_of_conduct'])) {
	        $blurb = $this->_ccItems['code_of_conduct']['text'];
	    }
	    	
	    return $blurb;
	}
	
	/**
	 * --- BUILD LINK ---
	 * This builds the link to the code of conduct
	 *
	 * @return string
	 */
	public function buildLink() {
		$link = '';
		
	    if(empty($this->_ccItems)) {
			$componentSM = new ComponentSoapModel();
                        $cacheKeyArray = $params = array('code_of_conduct');//
                        $componentList = $this->cache->getItemsFromCache($componentSM, 'getComponentsBySection', $params, $cacheKeyArray);
			
			if(!empty($componentList) && $componentList !== (array)$componentList) {
				$componentList = array($componentList);
			}
			
			// loop through all components received and
			// add to carouselItems based on groupId
			foreach((array)$componentList as $c) :
				switch($c->componentType) :
					case 'customfile': //customfile
						$link = $c->value;
						break;
				endswitch;
			endforeach;
		}
		else if(isset($this->_ccItems['code_of_conduct'])) {
				$link = $this->_ccItems['code_of_conduct']['link'];
		}
		 
		return $link;
	}
	
	/**
	 * --- GET TOGGLE ---
	 * This gets the toggle for the code of conduct
	 *
	 * @return string
	 */
	public function getToggle() {
	    $toggle = '';
	     
	    if(empty($this->_ccItems)) {
	        $componentSM = new ComponentSoapModel();
                $cacheKeyArray = $params = array('code_of_conduct');//
                $componentList = $this->cache->getItemsFromCache($componentSM, 'getComponentsBySection', $params, $cacheKeyArray);
	
	        if(!empty($componentList) && $componentList !== (array)$componentList) {
	            $componentList = array($componentList);
	        }
	
	        // loop through all components received and
	        // add to carouselItems based on groupId
	        foreach((array)$componentList as $c) :
    	        switch($c->componentType) :
        	        case 'text': //text
        	            $toggle = $c->value;
        	        break;
    	        endswitch;
	        endforeach;
	    }
	    else if(isset($this->_ccItems['code_of_conduct'])) {
	        $toggle = $this->_ccItems['code_of_conduct']['toggle'];
	    }
	
	    return $toggle;
	}
	
	/**
	 * --- GET ALL CODE OF CONDUCT ITEMS ---
	 *
	 * Gets the Code of Conduct Items from the db
	 * and adds them to the _ccItems array
	 *
	 * @param
	 */
	public function getAllCodeOfConductItems() {
		static $ccItems = null;
		
		if(count($ccItems) <= 0 && !empty($this->_siteId)) {
			$componentSM = new ComponentSoapModel();
                        $cacheKeyArray = $params = array('code_of_conduct');//
                        $componentList = $this->cache->getItemsFromCache($componentSM, 'getComponentsBySection', $cacheKeyArray, $cacheKeyArray);
			
			
			if(!empty($componentList) && $componentList !== (array)$componentList) {
				$componentList = array($componentList);
			}
			
			$ccItems = array();
			
			// loop through all components received and
			// add to _wsItems based on subsection then groupId
			foreach((array)$componentList as $c) {
				
				switch($c->componentType) {
					case 'customfile': //customfile
						$ccItems[$c->section]['image'] = $c->customFileDTO->path;
						break;
					case 'title': //title
						$ccItems[$c->section]['title'] = $c->value;
						break;
					case 'text': //text
						$ccItems[$c->section]['text'] = $c->value;
						break;
					case 'url': //url
				        $ccItems[$c->section]['link'] = $c->value;
				        break;
					case 'toggle': //toggle
					    $ccItems[$c->section]['toggle'] = $c->value;
					    break;
				}
			}
		}
	
		return $ccItems;
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
		
		return $this->buildAllElements();
	}
}
