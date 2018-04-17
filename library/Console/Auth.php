<?php 
/**
 * Zend_Auth wrapper class
 * This class will be responsible for custoam Constole functionality
 * if needed for auth.
 * 
 */

class Console_Auth extends Zend_Auth {
	// initially this class will be empty only to be used when
	// we would like to include some custom AUTH methods.
	public static function getInstance() {
		$auth = parent::getInstance();
		$sess = new Console_SessionHelper(SESSION_GLOBAL_NAMESPACE);
		$auth->setStorage(new Zend_Auth_Storage_Session(APPLICATION_NAME_URI . '_'. $sess->siteName));
		
		return $auth;
	}
}

?>
