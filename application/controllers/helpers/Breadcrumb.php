<?
/**
 * Action Helper for Breadcrumb
 *
 * @uses Zend_Controller_Action_Helper_Abstract
 */
class Helpers_Breadcrumb extends Zend_Controller_Action_Helper_Abstract {

    /**
     * Constructor: initialize plugin loader
     *
     * @return void
     */
    public function __construct($config=""){
        // if any config values are passed in, override defaults
        if(!empty($config)) {
            foreach($config as $k => $c) {
                $this->_config[$k] = $c;
            }
        }
    }
    
    public function buildBreadcrumb(){
        
        // we really want from redirect URL, but
        // if it's not there (login page), then we
        // can use the REQUEST_URI becuase it's usable here.
        // otherwise, REDIRECT_URL is better.
        $locSource = isset($_SERVER['REDIRECT_URL']) ? $_SERVER['REDIRECT_URL'] : $_SERVER['REQUEST_URI'];
        
        // find the users current location in the system.
        $currentLoc = explode('/', substr($locSource, 1));
        
        // set up the view so that it can display the breadcrumb
        $this->_actionController->view->currentLoc = $currentLoc;
        return $this->_control = $this->_actionController->view->render('helpers/breadcrumb.phtml');
    }
    
    /**
     * Strategy pattern: call helper as broker method
     *
     * @param  array $config
     * @return ResourceCenter
     */
    public function direct(){
        $this->__construct();
        return $this->buildBreadcrumb();
    }
}
?>