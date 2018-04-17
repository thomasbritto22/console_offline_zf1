<?php
require_once('Zend/Soap/Client.php');
class SamlServiceServerSoapModel {

	protected $client;
	protected $sess;
	protected $siteId;
	protected $rootEntityId;
	protected $loggedInUserId;
	protected $siteName;
	public $testAction;


	function SamlServiceServerSoapModel() {
	}

	protected function init () {
		// do some string manipulation to get our service name
		// TODO: we may want to consider altering our soap model
		// names to negate having to do this.
		$serviceName = $this->lcfirst(str_replace("SoapModel", "", get_class($this)));

		// now try to get the SOAP XML for this service
		try {
			$this->client = new Zend_Soap_Client(
					SOAP_SAML_SERVICE_URL . $serviceName .".srv",
					array(
							'soap_version' => SOAP_1_1,
							'wsdl' => SOAP_SAML_SERVICE_URL . $serviceName . ".srv?wsdl",
					)
			);

		}
		catch (Exception $e) {
			echo "\nException: " . $e->getMessage() . "\n";
		}

		$this->sess = new Console_SessionHelper(SESSION_GLOBAL_NAMESPACE);
		$this->siteId = @$this->sess->siteId;
		$this->siteName = @$this->sess->siteName;
	}

	// TODO: Need clean up
	public function testSoapCall ($call,$params) {
		if(!empty($this->client)){
			return $this->client->$call($params)->out;
		}
		else return false;
	}

	private function lcfirst($string) {
		return substr_replace($string, strtolower(substr($string, 0, 1)), 0, 1);
	}
}
?>