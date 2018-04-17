<?php
class XSS extends Zend_Controller_Plugin_Abstract {
	/* The list of standard filters which needs to used for sanitize */
	protected $_filters = array(
		'HTMLPurifier'
	);

	/* List of pages which needs to excluded from sanitize, this should used only 
	 * in cases where it is necessary
	 */
	protected $_excludePages = array(
			'/auth/dologin',
	        '/auth/dochangepassword',
	        '/auth/doresetpassword',
	        '/profile/updatepassword',
	        '/sso/consume',
	        '/samlsso/consume'
	);

	/* List of pages which requires any specific filters to be used apart from standard filters, if it requires 
	 * to use standard filters as well, than it needs to be declared it here separately
	 */
	protected $_pageRules = array(
	);
        
	public function preDispatch(Zend_Controller_Request_Abstract $request) {
	    $controller = $request->getControllerName();
	    $action = $request->getActionName();
		$path = '/'.$controller.'/'.$action;
		
		$params = $request->getParams();
                
                $isPost = false;
                if( $request->isPost() ) {
                    $isPost = true;
                }
                
		if( !in_array( $path, $this->_excludePages ) ) {
			$filters = $this->_filters;
			if( in_array( $path, $this->_pageRules ) ) {
				//assign filters from pageRules
				$filters = $this->_pageRules[$path];
			}
			unset( $params['module'], $params['controller'], $params['action'] );
			if( count( $params ) > 0 ) {
				foreach ($filters as $filter) {
					switch ( $filter ) {
						case 'HTMLPurifier':
							/* Get each value recursively and sanitize it preserving the array format.
							 */ 
							array_walk_recursive($params, function(&$val, $key, $isPost ) {
								if( !is_object( $val )) {
                                                                    $special_chars = array("&amp;","&lt;","&gt;");
                                                                    $symbols = array("&","<",">");
                                                                    $xssFilter = new Console_Filter_XSS();
                                                                    $val = $xssFilter->filter( $val );
                                                                    $val = str_replace($special_chars,$symbols,$val);
                                                                     if( !$isPost ) {
                                                                        $val = urlencode($val);
                                                                    }
								}
							}, $isPost);
							
							break; 
						default:						   
							break;							
					}
				}//foreach ends

				//set the sanitize request params before request dispatch
				$request->setParams( $params );
				foreach( $params as $paramKey => $paramVal ) {
                                    $_REQUEST[ $paramKey ] = $paramVal;
                                }
				/* This is an extra care, if GLOBAL variables are being used */
				if( $isPost ) {
					foreach( $params as $paramKey => $paramVal ) {
						$_POST[ $paramKey ] = $paramVal;
					}
				} else {
					foreach( $params as $paramKey => $paramVal ) {
						$_GET[ $paramKey ] = $paramVal;
					}
				}
			}
		}
                /* Sanitize Cookies */
                foreach( $_COOKIE as &$val){
                    $xssFilter = new Console_Filter_XSS();
                    $val = $xssFilter->filter( $val );  
                }
	}
}