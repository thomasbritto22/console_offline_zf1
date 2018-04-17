<?php

/**
 * Handle site features
 *
 * This plugin will figure out what site user is on and get all site configs
 */
require_once ("../application/soapModels/LRNService/Site.php");
require_once ("../application/soapModels/LRNService/User.php");

class Site_Plugin extends Zend_Controller_Plugin_Abstract {

    private $defaults = array(
        "WELCOME_MESSAGE" => '',
    );
    protected $_memcache = null;

    public function preDispatch(Zend_Controller_Request_Abstract $request) {
        $sess = new Console_SessionHelper(SESSION_GLOBAL_NAMESPACE);
        $site_name = $request->getParam("q_site");

        if( !empty( $site_name) ) {
            if ( !empty( $sess->siteName ) ) {
                if(  $site_name != $sess->siteName ) {
                    $sess->unsetAll();
                    $sess->siteName = $site_name;
                }
            } else {
                $sess->siteName = $site_name;
            }
        }
        
        // get all the site specific settings and add them to the session
        if (empty($sess->siteId) || !$sess->siteConfigs || $sess->siteConfigs['DefaultGroup'] != $sess->siteName) {
            $sess->siteConfigs = array();
            $this->_memcache = Zend_Registry::get('memcache');
            $catalystSiteService = new ConsoleSiteSoapModel();
            $params = $cacheKeyArr = array($sess->siteName);
            $siteDataObj = $this->_memcache->getItemsFromCache($catalystSiteService, 'getParentSite', $params, $cacheKeyArr);
            $sess->siteId = $siteDataObj->id;
            $sess->parentSiteName = $siteDataObj->parentSiteName;
            $sess->parentSiteId = $siteDataObj->parentSiteId;
        }
         header('Access-Control-Allow-Origin: *');  
    }

}
