<?php

// Define time zone
date_default_timezone_set("America/Los_Angeles");
// Define path to application directory
defined('APPLICATION_PATH')
    || define('APPLICATION_PATH', realpath(dirname(__FILE__) . '/../application'));

// Define application environment
defined('APPLICATION_ENV')
    || define('APPLICATION_ENV', (getenv('APPLICATION_ENV') ? getenv('APPLICATION_ENV') : 'production'));

// Ensure library/ is on include_path
set_include_path(implode(PATH_SEPARATOR, array(
    realpath(APPLICATION_PATH . '/../library'),
    get_include_path(),
)));

/**
 * Handling fatal error
 *
 * @return void
 */
function fatalErrorHandler() {
    # Getting last error
    $error = error_get_last();
    # Checking if last error is a fatal error 
    if (($error['type'] === E_ERROR) || ($error['type'] === E_USER_ERROR)) {
    # Here we handle the error, displaying HTML, logging, ...
        
        error_log("Fatal Error=> ".var_export($error, 1));
        header("Location: /error.html");
        exit();
    }
}

# Registering shutdown function
register_shutdown_function('fatalErrorHandler');

// Set of include files we need to require for application to run correctly
/** Zend_Application */
require_once 'Zend/Application.php';
require_once 'Zend/Auth.php';
require_once 'Zend/Cache.php';
require_once 'Zend/Acl.php';
require_once 'Zend/Controller/Plugin/Abstract.php';
require_once 'Zend/Controller/Action.php';

require_once 'Zend/Filter/Interface.php';

require_once 'Console/Auth.php';
require_once 'Console/Memcache.php';
require_once 'Console/MemcacheHelper.php';
require_once 'Console/XSS.php';

require_once '../application/model/Acl.php';
require_once '../application/plugin/SSLPlugin.php';
require_once '../application/plugin/AuthPlugin.php';
require_once '../application/plugin/SamlInitiatePlugin.php';
require_once '../application/plugin/SitePlugin.php';
require_once '../application/plugin/XSS.php';
require_once '../application/plugin/CSRF.php';
require_once '../application/controllers/ApplicationController.php';
require_once '../library/Console/Debug.php';

// Create application, bootstrap, and run
$application = new Zend_Application(
    APPLICATION_ENV,
    APPLICATION_PATH . '/configs/application.ini'
);
ini_set('display_errors',0);

$application->bootstrap()->run();