<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of TestCase
 *
 * @author naveen.jaiswal
 */
abstract class TestCase extends PHPUnit_Framework_TestCase{
    
    public $application;

    /**
     * Function to setup the configuration for the application
     */
    public function setUp()
    {
        $this->application = new Zend_Application(
            APPLICATION_ENV,
            APPLICATION_PATH . '/configs/application.ini'
        );

        $this->bootstrap = array($this, 'appBootstrap');
        parent::setUp();
    }

    public function appBootstrap()
    {
        $this->application->bootstrap();
    }
}
