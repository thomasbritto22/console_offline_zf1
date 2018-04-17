<?php
/**
* Handle Page/feature access
*
*
*/

class Auth_Plugin extends Zend_Controller_Plugin_Abstract {
	// The Zend ACL
	private $_acl;

	public function __construct(Zend_Acl $acl) {
		$this->_acl = $acl;
	}

	public function preDispatch(Zend_Controller_Request_Abstract $request) {
		// Default Role - see model/RamAcl.php for the deifintion of the roles
		$role = 'guest';

		// start authentication
		$auth = Console_Auth::getInstance();
		$sess = new Console_SessionHelper(SESSION_GLOBAL_NAMESPACE);
		// see if this user is logged in and has a role
		if (($auth->hasIdentity()) && (@$auth->getStorage()->read()->role)) {
			$role = $auth->getStorage()->read()->role;
		}
		$resource = $request->getControllerName();
		$action = $request->getActionName();
                error_log("AuthPlugin=>role:".$role."resource:".$resource."action:".$action.var_export($auth->getStorage()->read(),1));
//echo "identity=>",$auth->hasIdentity(),"<br>Role:",$auth->getStorage()->read()->role,"<br>";exit;
		// check if this role has access to the requested resource
		if(!$this->_acl->isAllowed($role, $resource, $action)) {
		    //store the request URL for direct to that URL after login
		    $sess->userRequestedURL = $_SERVER['REQUEST_URI'];
//                echo "<pre>",$role,"<br>",$resource,"<br>",$action,"<br>ACL:",$this->_acl->isAllowed($role, $resource, $action);exit; 
		   
		    if ((!$auth->hasIdentity()) || $role == 'guest' ) {
		    	// user has not logged in so show them the login page
		    	//also allowed access to recource center download page without login
		    	if(($resource != 'resourcecenter' && $resource != 'files') || ($resource == 'resourcecenter' && $action != 'download')
		    	|| ($resource == 'files' && $action != 'transcode')){
		    		$request->setControllerName('admin')->setActionName('offlineerror');
		    	}
		    } else {
		    	// user is already logged in and trying to access a function they can't
		    	// TODO: send them to an error page instead of login
		    	//$request->setControllerName('error')->setActionName('denied');
		    	$request->setControllerName('admin')->setActionName('offlineerror');
		    }
		}
	}
}

?>
