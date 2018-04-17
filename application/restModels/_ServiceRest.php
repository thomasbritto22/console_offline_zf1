<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of _lcecService
 *
 * @author manoj.mane
 */
class ServiceRestModel {
    
    protected $client;
    function ServiceRestModel(){
        
    }
    
    protected function init () {

        try {
            $this->client = new Zend_Http_Client();
        }
        catch (Exception $e) {
            echo "\nException: " . $e->getMessage() . "\n";
        }
    }
    
    protected function initiateCurlRequest($params){
        $this->client->setHeaders($params["headers"]);
        $this->client->setUri($params["url"]);
        $this->client->setMethod($params["method"]);
        $this->client->setRawData($params["data"]);
        return $this->client->request();
    }
    
}
