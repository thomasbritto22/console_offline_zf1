<?php
require_once('Zend/Soap/Client.php');
class LrnServiceSoapModel {

    protected $client;
    protected $sess;
    protected $siteId;
    protected $rootEntityId;
    protected $loggedInUserId;
    protected $siteName;
    public $testAction;


    function LrnServiceSoapModel() {
    }

    protected function init () {
        // do some string manipulation to get our service name
        // TODO: we may want to consider altering our soap model
        // names to negate having to do this.
        $serviceName = $this->lcfirst(str_replace("SoapModel", "", get_class($this)));

        // now try to get the SOAP XML for this service
        try {
            $this->client = new Zend_Soap_Client(
                SOAP_LRN_SERVICE_URL . $serviceName .".srv",
                array(
        	    	'soap_version' => SOAP_1_1,
        	        'wsdl' => SOAP_LRN_SERVICE_URL . $serviceName . ".srv?wsdl",
                )
            );
        }
        catch (Exception $e) {
            echo "\nException: " . $e->getMessage() . "\n";
        }

        $this->sess = new Console_SessionHelper(SESSION_GLOBAL_NAMESPACE);
        
        $siteId = $this->sess->siteId;
        if (!empty($this->sess->parentSiteId)) {
            $siteId = $this->sess->parentSiteId;
        }
        
        $siteName = $this->sess->siteName;
        if (!empty($this->sess->parentSiteName)) {
            $siteName = $this->sess->parentSiteName;
        }
        
        $this->siteId = $siteId;
        $this->siteName = $siteName;
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