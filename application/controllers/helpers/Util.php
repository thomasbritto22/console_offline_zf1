<?php
/**
 * Action Helper for Utilitarian Purposes
 *
 * @uses Zend_Controller_Action_Helper_Abstract
 */
class Helpers_Util extends Zend_Controller_Action_Helper_Abstract {
    
    private $_sess = null;
    protected $cache = null;
    
    /**
     * Constructor: initialize plugin loader
     *
     * @return void
     */
    public function __construct(){
        $this->cache = Zend_Registry::get('memcache');
    }

    /**
     * --- CREATE BASE IMG URL ---
     * This creates the base link for file URLs
     * that have been uploaded through Catalyst
     *
     * @return string
     */
    public function getBaseFileUrl($siteName = null, $forceHttps = false) {
        $siteName = isset($siteName) ? $siteName : $this->_sess->siteName;
        
    	$qa = '';
		
		if( preg_match('/^.+(\.\w+)\.lrn\.com.*$/', $_SERVER['HTTP_HOST'], $matches) 
			&& !strpos($_SERVER['HTTP_HOST'], '.dev3') ) {
			$qa = $matches[1];
		}else if(strpos($_SERVER['HTTP_HOST'], '.dev3')){
			$qa = '.qa7';
		}
		
		/*
		 * This condition statement is to enforce the HTTPS protocol when there is HTTPS set and indicate that HTTPS is on
		 * Some servers don't have HTTPS variable set
		 */ 
    	if (isset($_SERVER['HTTPS']) && 'off' != $_SERVER['HTTPS']){
    		$forceHttps = true;
    	}
    	
		$url = $forceHttps===true ? 'https://' . $siteName . '-lcec' . $qa . '.lrn.com' : $this->getRequest()->getScheme() . '://' . $siteName . '-lcec' . $qa . '.lrn.com';
    	
		return $url;
    }
    
    /**
     * --- GET TOGGLE VALUE ---
     *
     * @return string
     */
    public function getComponentToggle($section, $subSection = '') {
        // first look in the session to see if we already have this value
        // if we do, return it.
        $componentToggles = new Console_SessionHelper('componentToggles');
        $componentToggles->$section = array();
        
        if(isset($this->_sess->componentToggles[$section][$subSection])){
            echo 'from sess';
            return $this->_sess->componentToggles[$section][$subSection];
        }
        else {
            // by default the value is off
            $toggleValue = 'off';
            
            // make a call to the service to get the value
            $componentSM = new ComponentSoapModel();
            $cacheKeyArray = $params = array($section, $subSection);//
            $componentList = $this->cache->getItemsFromCache($componentSM, 'getComponentsBySection', $params, $cacheKeyArray);
            
            // if we actually have a list, process, save and return the values
            if(!empty($componentList)){
                // make sure it's an array
                if(!is_array($componentList)) $componentList = array($componentList);
                
                // loop through and get the toggle values
                foreach($componentList as $c){
                    // we are going to get lots of component data but
                    // we only want the toggle value
                    if($c->componentType == 'toggle'){
                        // get/store all toggle values for this section/subSection
                        // into the session. we will reuse these.
                        $toggleValue = $c->value;
                        
                        // store this value in the session by section and subsection
                        $componentToggles->$section = array(
                            $subSection => $toggleValue
                        );
                        
                    }
                }
            }
            
            return $toggleValue;
        }
    }
    
    /**
     * Strategy pattern: call helper as broker method
     *
     * @param  array $config
     * @return ResourceCenter
     */
    public function direct($sess){
        $this->_sess = &$sess;
    }
}
?>
