<?php
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Console_SessionHelper
 * 
 * Session Helper class to use zend session in customize way, clubs use of memcache also
 * @package Console
 *
 * @author naveen.jaiswal
 */
class Console_SessionHelper extends Zend_Session_Namespace{
    
    public $sess;
    
    protected $_memcache;
    protected $_translationSM;
    protected $_sessionDataVarsArr = array('siteTranslations', 'siteLabels', 'siteErrors', 'customPublishedLabels', 'siteInstructions','components');
    
    /**
     * __construct() - Returns an instance object bound to a particular, isolated section
     * of the session, identified by $namespace name (defaulting to 'Default').
     * The optional argument $singleInstance will prevent construction of additional
     * instance objects acting as accessors to this $namespace.
     *
     * @param string $namespace       - programmatic name of the requested namespace
     * @param bool $singleInstance    - prevent creation of additional accessor instance objects for this namespace
     * @return object
     */
    public function __construct($namespace = 'Default', $singleInstance = false) {
        
        $this->sess =  parent::__construct($namespace, $singleInstance);
        $this->_memcache = Zend_Registry::get('memcache');
        return $this->sess;
    }
    
    /**
     * Overridden
     * 
     * get certain set of items($this->_sessionDataVarsArr) from memcache
     * __get() - method to get a variable in this object's current namespace
     *
     * @param string $name - programmatic name of a key, in a <key,value> pair in the current namespace
     * @return mixed
     */
    public function & __get($name)
    {
        if (in_array($name, $this->_sessionDataVarsArr) && $this->_memcache->cacheEnabled() == true) {
            
            $cacheKey = implode('_', array($this->siteId, $this->siteConfigs['DefaultLanguage'], $name));
            switch ($name) {
                case 'siteTranslations':
                    $value = $this->getSiteTranslations();
                    break;
                case 'siteLabels':
                    $value = $this->_memcache->getItemFromCache($cacheKey);
                    
                    if($value === false){
                        $siteTranslations = $this->getSiteTranslations();
                        list($value) = $this->getSiteTransItems($siteTranslations);
                        $this->_memcache->putItemToCache($value, $cacheKey);
                    }
                    break;
                case 'siteErrors':
                    $value = $this->_memcache->getItemFromCache($cacheKey);
                    
                    if($value === false){
                        $siteTranslations = $this->getSiteTranslations();
                        list(, $value) = $this->getSiteTransItems($siteTranslations);
                        $this->_memcache->putItemToCache($value, $cacheKey);
                    }
                    break;
                case 'customPublishedLabels':
                    $value = $this->_memcache->getItemFromCache($cacheKey);
                    
                    if($value === false){
                        $siteTranslations = $this->getSiteTranslations();
                        list(, , $value) = $this->getSiteTransItems($siteTranslations);
                        $this->_memcache->putItemToCache($value, $cacheKey);
                    }
                    break;
                case 'siteInstructions':
                    $value = $this->_memcache->getItemFromCache($cacheKey);
                    
                    if($value === false){
                        $siteTranslations = $this->getSiteTranslations();
                        list(, , , $value) = $this->getSiteTransItems($siteTranslations);
                        $this->_memcache->putItemToCache($value, $cacheKey);
                    }
                    break;
                case 'components':
                    $componentService = new ComponentSoapModel();
                    $value = $this->_memcache->getItemsFromCache($componentService, 'getAllComponents', array(), array($name), false);
                    break;
                default :
                    $value = null;
            }
            return $value;
        } else {
            return parent::__get($name);
        }
    }
    
    /**
     * Overridden
     * 
     * set certain set of items($this->_sessionDataVarsArr) to memcache
     * __set() - method to set a variable/value in this object's namespace
     *
     * @param string $name - programmatic name of a key, in a <key,value> pair in the current namespace
     * @param mixed $value - value in the <key,value> pair to assign to the $name key
     * @throws Zend_Session_Exception
     * @return true
     */
    public function __set($name, $value)
    {
        if (in_array($name, $this->_sessionDataVarsArr) && $this->_memcache->cacheEnabled() == true){
            
            $cacheKey = implode('_', array($this->siteId, $this->siteConfigs['DefaultLanguage'], $name));
            switch ($name) {
                case 'siteTranslations':
                    $cacheKey = implode('_', array($this->siteId, $this->siteConfigs['DefaultLanguage']));
                    break;
                case 'components':
                    $cacheKey = $name;
                    break;
                default :
                    ;
            }
            $this->_memcache->putItemToCache($value, $cacheKey);
        } else {
            
            parent::__set($name, $value);
        }
    }
    
    /**
     * --- Sanitize Session Data ---
     * Runs through the session data, and reformats it to match the partner-defined label
     * @param mixed &$data - The data to sanitize
     * @param Array $keys - The data we will sanitize $data with
     * @return array - just debug data & can be ignored
     *
     * TODO: rewrite so that the expectation isn't $keys === $this->sess->siteTranslations
     */
    public function sanitizeSessData(&$data, $keys) {
        //echo $this->siteConfigs['ConfigsDefaultLanguage'];exit;
	$debug = array();
        $delimiter = '%';
        if (!empty($data)) {
            if (count($keys) > 0) {
                foreach ($keys as $j => $key) {
                    $debug[$i] = array($data[$i]);
                    $data = preg_replace('/' . $delimiter . $keys[$j]->translationKey . $delimiter . '/', $keys[$j]->translationValue, $data);
                }
            }
        }
        return $debug;
    }
    
    /**
     * Get site translations from memcahce/webservice
     * @return type
     */
    public function getSiteTranslations() {
        $params = $cacheKeyArr = array($this->siteId, $this->siteConfigs['DefaultLanguage']);
        $translationSM = new TranslationSoapModel();
        return $this->_memcache->getItemsFromCache($translationSM, 'getTranslationsBySiteIdLang', $params, $cacheKeyArr, false);
    }
    
    /**
     * loops through siteTranslations and prepare data for siteErrors, labels, customLabels & instructions
     * @param type $siteTranslations
     * 
     * @return array list
     */
    public function getSiteTransItems($siteTranslations = array()) {
        
        if (count($siteTranslations) > 0) {
            foreach ($siteTranslations as $t) {
                switch ($t->translationKeyType) {
                    case 'Label':
                        $siteLabels[$t->translationKey] = htmlspecialchars($t->translationValue);
                        break;
                    case 'Error':
                        $siteErrors[$t->translationKey] = htmlspecialchars($t->translationValue);
                        break;
                    case 'Instruction':
                        $siteInstructions[$t->translationKey] = htmlspecialchars($t->translationValue);
                        break;
                }
            }
        }

        // get the site labels from LCEC and
        // add them to $siteLabels inside of the session
        $LCECSiteSM = new SiteSoapModel();
        $params = $cacheKeyArr = array($this->siteName, $this->siteConfigs['DefaultLanguage']);
        $LCECSiteLabels = $this->_memcache->getItemsFromCache($LCECSiteSM, 'getCustomLabels', $params, $cacheKeyArr );

        foreach ($LCECSiteLabels as $l) {
            if (isset($l->columnName)) {
                //$this->sess->siteLabels[$l->columnName] = $l->displayName;
                $customPublishedLabels[$l->columnName] = $l->displayName;
            }
        }

        $this->sanitizeSessData($siteLabels, $this->siteTranslations);
        $this->sanitizeSessData($siteErrors, $this->siteTranslations);
        $this->sanitizeSessData($customPublishedLabels, $this->siteTranslations);
        $this->sanitizeSessData($siteInstructions, $this->siteTranslations);
        
        return array($siteLabels, $siteErrors, $customPublishedLabels, $siteInstructions);
    }
    
    /**
    * --- Parse Info Messages ---
    * filters out the info messages from a section and puts them into their own bucket
    * @param mixed &$sessVar - session variables holding the message
    * @return void
    */
   public function parseInfo(&$sessVar) {
       
        $spaceThreshold = 4;
        if (!empty($sessVar)) {
            foreach ($sessVar as $i => $msg) {
                $dump = array();
                if (preg_match('/\(ci/i', $msg, $dump) ||
                        count(explode(chr(32), $msg)) > $spaceThreshold
                ) {
                    $this->siteInfo[$i] = $msg;
                    //    			unset($sessVar[$i]);
                }
            }
        }
    }

}
