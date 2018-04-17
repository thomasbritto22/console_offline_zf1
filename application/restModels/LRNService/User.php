<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of lcec
 *
 * @author manoj.mane
 */
require_once ('../application/restModels/_ServiceRest.php');

class UserServiceRestModel extends ServiceRestModel {

    private $uri;
    function UserServiceRestModel() {
            $this->init();
            $this->uri = CATALYST_REST_SERVICE_URL."lcecrestservice/";
    }

    public function getVirtualCatalystPermissions($userId, $siteName) {
        $params = array();
        $params['url'] = $this->uri.__FUNCTION__;
        $params["headers"] = array('Accept: application/json','Content-Type: application/json');
        $params["method"] = Zend_Http_Client::POST;
        $params["data"] = Zend_Json::encode(array('company'=>$siteName,'userId'=>$userId));
        $response = $this->initiateCurlRequest($params);
        return Zend_Json::decode($response->getBody());
    }

}
