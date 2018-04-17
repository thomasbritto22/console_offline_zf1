<?
/**
 * Action Helper for Language Selection
 *
 * @uses Zend_Controller_Action_Helper_Abstract
 */
class Helpers_LanguageSelection extends Zend_Controller_Action_Helper_Abstract {

    public $langMap;
    private $_sess;

    /**
     * Constructor: initialize plugin loader
     *
     * @return void
     */
    public function __construct($config=""){
    	$this->langMap = Zend_Registry::get('LangMap');

        // if any config values are passed in, override defaults
        if(!empty($config)) {
            foreach($config as $k => $c) {
                $this->_config[$k] = $c;
            }
        }
    }

    public function buildLanguageSelection(){
        // set up the view so that it can display the breadcrumb
        $this->_actionController->view->langMap = $this->langMap;

        /**
         * We only show the dropdown if the site is internationalized.
         * According to site build documentation, there are three values to be checked:
         *
         * 'ProfileColumn' should be set to "Language"
         * 'ProfileDefaultColumn' should not be null (default value is 'en')
         * 'DefaultLanguage' should not be null (default value is 'en')
         *
         * Just FYI:
         * 'DefaultLanguage' is the sites default language
         * 'ProfileColumn*' deals with setting up users' profiles
         */

        // set up an easy way to check that the site is internationalized.
        $isValid_profileColumn = ($this->_sess->siteConfigs['ProfileColumn'] == 'Language');
        $isValid_profileColumnDefault = !empty($this->_sess->siteConfigs['ProfileColumnDefault']);
        $isValid_defaultLanguage = !empty($this->_sess->siteConfigs['DefaultLanguage']);
        $configsDefaultLanguage = !empty($this->_sess->siteConfigs['DefaultLanguage']);
        // find out which languages this site is available in
        $langAvailable = array();
        if(isset($this->_sess->siteConfigs['enabledLang']) && count($this->_sess->siteConfigs['enabledLang'])>0)
           $langAvailable = $this->_sess->siteConfigs['enabledLang'];


        // find out what the default language is
        if(isset($_COOKIE['siteSetLanguage'.$this->_sess->siteName]) && !empty($_COOKIE['siteSetLanguage'.$this->_sess->siteName]))
        {
           list($exp, $val) = explode('|', $_COOKIE['siteSetLanguage'.$this->_sess->siteName], 2);
           $defaultLang = $val;
        }
        else
        {
           $defaultLang = $configsDefaultLanguage != '' ? $configsDefaultLanguage:DEFAULT_LANGUAGE;
        }

        $langAvail = false;
        if(isset($langAvailable) && count($langAvailable)>0) {
           foreach($langAvailable as $l){
              if($l->language == $defaultLang)
                 $langAvail = true;
           }
        }

        if(!$langAvail)
           $defaultLang = $configsDefaultLanguage != '' ? $configsDefaultLanguage:DEFAULT_LANGUAGE;

        // run all the checks and proceed as necessary.
        if($isValid_profileColumn && $isValid_profileColumnDefault && $isValid_defaultLanguage && !empty($langAvailable))
        {
        	$tempLangs = array();
        	foreach($langAvailable as $lang)
        		$tempLangs[$lang->label] = $lang;
        	ksort($tempLangs);//print_r(array_values($tempLangs));exit;
        	$this->_actionController->view->availableLanguagesArr = array_values($tempLangs);
           $this->_actionController->view->languageDropdownStatus = true;
           $this->_actionController->view->defaultLang = $defaultLang;

           return $this->_control = $this->prepareLanguageDropDown(array_values($tempLangs));
        }
        else
        {
           $this->_actionController->view->languageDropdownStatus = false;

           return '';
        }
    }

    /**
     * Strategy pattern: call helper as broker method
     *
     * @param  array $config
     * @return ResourceCenter
     */
    public function direct($session){
       $this->_sess = $session;
       $this->__construct();
       return $this->buildLanguageSelection();
    }
    
    /**
     * Function to prepare dropdown for language selection
     *
     * @param  array $availableLanguagesArr
     * @return $languageDropDown
     */
    public function prepareLanguageDropDown($availableLanguagesArr){
    
        $languageDropDown .= '<select id="languageSelect">';
        
	foreach($availableLanguagesArr as $l){
            if(isset($l->language)){
                $selected = '';
                if($l->language == $this->_actionController->view->siteDefLang){
                    $selected = 'selected="selected"';
                }
                $languageDropDown .= '<option value="' . $l->language .'"' . $selected . '>' . $this->_actionController->view->escape($l->label) . '</option>';
            }
	}
        
        $languageDropDown .= '</select>';
        
        return $languageDropDown;
    }
}
?>