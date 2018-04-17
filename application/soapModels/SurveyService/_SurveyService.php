<?php
require_once('Zend/Soap/Client.php');
class SurveySrvSoapModel {
	
	protected $client;
	protected $sess;
	protected $siteId;
	protected $rootEntityId;
	protected $loggedInUserId;
	protected $siteName;
	public $testAction;
	
	
	function SurveySrvSoapModel() {
	}
	
	protected function init () {
		$serviceName = $this->lcfirst(str_replace("SoapModel", "",get_class($this)));
		$this->client = new Zend_Soap_Client(SOAP_SURVEY_SERVICE_URL . $serviceName .".srv", 
		                array(  'soap_version' => SOAP_1_1,
		                        'wsdl' => SOAP_SURVEY_SERVICE_URL . $serviceName . ".srv?wsdl",
		                        
		                ));
		$this->sess = new Console_SessionHelper(SESSION_GLOBAL_NAMESPACE);
		$this->siteId = @$this->sess->siteId;
		$this->siteName = @$this->sess->siteName;
	}

	// TODO: Need clean up
	public function testSoapCall ($call,$params) {
		return $this->client->$call($params)->out;
	}

    private function lcfirst($string) {
        return substr_replace($string, strtolower(substr($string, 0, 1)), 0, 1);
    }
} ?>
