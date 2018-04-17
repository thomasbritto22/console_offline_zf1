<?php
require_once('Zend/Soap/Client.php');
/**
 * --- CATALYST SOAP MODEL ---
 * This soap model is the super class that all soap models
 * for catalyst services will extend
 * @author seema.akre
 *
 */
class CatalystServiceSoapModel {
	
	protected $client;
	protected $sess;
	protected $siteId;
	protected $rootEntityId;
	protected $loggedInUserId;
	protected $siteName;
        protected $_memcache;
	public $testAction;
	
	
	function CatalystServiceSoapModel() {
	}
	/**
    * --- INITALIZE ---
    * Initializes the soap client for catalyst-services.
	*
    */
	protected function init () {
		$serviceName = $this->lcfirst(str_replace("SoapModel", "",get_class($this)));
		$this->client = new Zend_Soap_Client(SOAP_CATALYST_SERVICE_URL . $serviceName .".srv",
		                array(  'soap_version' => SOAP_1_1,
		                        'wsdl' => SOAP_CATALYST_SERVICE_URL . $serviceName . ".srv?wsdl",
		                        
		                ));
		$this->sess = new Console_SessionHelper(SESSION_GLOBAL_NAMESPACE);
		$this->siteId = @$this->sess->siteId;
		$this->siteName = @$this->sess->siteName;
                $this->_memcache = Zend_Registry::get('memcache');
	}

	// TODO: Need clean up
	public function testSoapCall ($call,$params) {
		return $this->client->$call($params)->out;
	}

        private function lcfirst($string) {
            return substr_replace($string, strtolower(substr($string, 0, 1)), 0, 1);
        }
} ?>
