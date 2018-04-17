<?php
/**
*
* Access Control Extension
* This class will set up the access control list
*
**/

class Console_Acl extends Zend_Acl {
    public function __construct() {

        // -- INITIAL RESOURCES --
        // ** PLEASE KEEP THIS LIST ALPHABETICALLY ORDERED **
        // first ordering by top level then inherited pages
        // leave one blank line between each top level

        // account lockout
        $this->add(new Zend_Acl_Resource('accountlockout'));

        // admin
        $this->add(new Zend_Acl_Resource('admin'));

        // auth pages
        $this->add(new Zend_Acl_Resource('auth'));
        $this->add(new Zend_Acl_Resource('login', 'auth'));
        $this->add(new Zend_Acl_Resource('forgotPassForm', 'auth'));
        $this->add(new Zend_Acl_Resource('forgotPassLogin', 'auth'));
        $this->add(new Zend_Acl_Resource('resetPassword', 'auth'));
        $this->add(new Zend_Acl_Resource('updatedata', 'auth'));

        // ajax request controller pages
        $this->add(new Zend_Acl_Resource('ajax'));

        // ram passthru
        $this->add(new Zend_Acl_Resource('assessment'));

        // Amazon Web Service Test
        $this->add(new Zend_Acl_Resource('aws'));

        // course catalog
        $this->add(new Zend_Acl_Resource('catalog'));

         // course dashboard
        $this->add(new Zend_Acl_Resource('viewdashboard'));

        //XXX channel is an alternate to 'learn'. It deals
        //XXX specifically with examining the contents of a channel.
        $this->add(new Zend_Acl_Resource('channel'));

        // Salesforce Chatter setup page
        $this->add(new Zend_Acl_Resource('chatter'));

        // for home page
        $this->add(new Zend_Acl_Resource('console'));

        // couse launch
        //$this->add(new Zend_Acl_Resource('course'));
        
        // couse launch
        $this->add(new Zend_Acl_Resource('app'));
        
        // error pages
        $this->add(new Zend_Acl_Resource('error'));

        // for retrieving data for the feeds action - history etc.
        // deprecated 2012.02.22 in favor of 'notifications'
        $this->add(new Zend_Acl_Resource('feeds'));

        // for the file repository
        $this->add(new Zend_Acl_Resource('files'));

        // index page, a.k.a 'MyQueue'
        $this->add(new Zend_Acl_Resource('index'));

        // for retrieving data for the learn action - course list, course preview etc.
        //XXX learn might be a better choice for more LCEC specific tasks (taking courses, etc)
        $this->add(new Zend_Acl_Resource('learn'));

        // logging out
        $this->add(new Zend_Acl_Resource('logout'));

        //XXX need comments to describe use
        $this->add(new Zend_Acl_Resource('manage'));

        //XXX need comments to describe use
        $this->add(new Zend_Acl_Resource('message'));

        // notifications displays user history and has
        // other feeds (social media, etc) as well.
        $this->add(new Zend_Acl_Resource('notifications'));

        // twitter oauth pages
        $this->add(new Zend_Acl_Resource('oauth'));
        $this->add(new Zend_Acl_Resource('authenticate', 'oauth'));
        $this->add(new Zend_Acl_Resource('callback', 'oauth'));
        $this->add(new Zend_Acl_Resource('tweet', 'oauth'));

        // profile is where non-admin users modify their settings
        $this->add(new Zend_Acl_Resource('profile'));
        
        // resource center
        $this->add(new Zend_Acl_Resource('resourcecenter'));
        
        // early REST API
        $this->add(new Zend_Acl_Resource('rest'));

        // reviews and ratings
        $this->add(new Zend_Acl_Resource('reviews'));

        // for saml
        $this->add(new Zend_Acl_Resource('samlsso'));

        // aim passthru
        $this->add(new Zend_Acl_Resource('survey'));

        // for slo/sso
        $this->add(new Zend_Acl_Resource('sso'));
        
        //for samlredirect
        $this->add(new Zend_Acl_Resource('samlredirect'));
        
        //for My Status
        $this->add(new Zend_Acl_Resource('mystatus'));
        
        //for Export Manager
        $this->add(new Zend_Acl_Resource('exportmanager'));
        
        //for Virtual Catalyst
        $this->add(new Zend_Acl_Resource('virtualcatalyst'));
        
         //for Virtual Catalyst
        $this->add(new Zend_Acl_Resource('catalystoffline'));
        
        // -- CREATE ROLES AND PERMISSIONS --
        // Roles will only stop users from getting to a function they
        // don't have permission to. A secondary access rule will be
        // to check if users have access at a certain level but that
        // will be within the app.

        // guest role is the default role for any visitor of the site
        // more specifically non logged in users will be guests

        $this->addRole(new Zend_Acl_Role('guest'));
        $this->addRole(new Zend_Acl_Role('user'),'guest');
        $this->addRole(new Zend_Acl_Role('admin'),'user');
        $this->addRole(new Zend_Acl_Role('lcecadmin'),'user');
        $this->addRole(new Zend_Acl_Role('dashboardadmin'),'user');
        $this->addRole(new Zend_Acl_Role('vcadmin'),'user');
        $this->addRole(new Zend_Acl_Role('emadmin'),'user');
        $this->addRole(new Zend_Acl_Role('dashboardvcadmin'),'user');
        $this->addRole(new Zend_Acl_Role('dashboardvcemadmin'),'user');
        $this->addRole(new Zend_Acl_Role('vcemadmin'),'user');

        // any new pages built should be included in this section
        // or else users can't see them.

        // GUEST PERMISSIONS
        // Guest may only view content
        $parents = array();
        $this->allow('guest', 'auth');
        $this->allow('guest', 'error');
        $this->allow('guest', 'oauth');
        $this->allow('guest', 'rest');
        $this->allow('guest', 'samlsso');
        $this->allow('guest', 'sso');
        $this->allow('user', 'sso');

        // USER PERMISSIONS
        // User inherits view privilege from guest, but also needs additional
        // privileges
        $this->allow('user', 'accountlockout');
        $this->allow('user', 'assessment');
        $this->allow('user', 'auth');
        $this->allow('user', 'catalog');
        $this->allow('user', 'channel');
        $this->allow('user', 'chatter');
        $this->allow('user', 'console');
        $this->allow('user', 'app');
        $this->allow('user', 'error');
        $this->allow('user', 'files');
        $this->allow('user', 'index');
        $this->allow('user', 'learn');
        $this->allow('user', 'logout');
        $this->allow('user', 'manage');
        $this->allow('user', 'message');
        $this->allow('user', 'notifications');
        $this->allow('user', 'profile');
        $this->allow('user', 'resourcecenter');
        $this->allow('user', 'reviews');
        $this->allow('user', 'survey');
        $this->allow('user', 'samlredirect');
        $this->allow('user', 'viewdashboard');
        $this->allow('user', 'mystatus');
        $this->allow('user', 'exportmanager');
        $this->allow('user', 'virtualcatalyst');
        $this->allow('user', 'catalystoffline');
        
        // SITE ADMIN PERMISSIONS
        // Administrator inherits nothing, but is allowed all privileges
        $this->allow('admin');

        //LCEC admin permissions
        $this->allow('lcecadmin', 'admin', array('legacy','slosites', 'dashboardmanager', 'virtualcatalyst','catalystoffline', 'exportmanager'));
        
        // Dashboard manager permission
         $this->allow('dashboardadmin', 'admin',  array('dashboardmanager'));
        // Virtual Catalyst permission
         $this->allow('vcadmin', 'admin',  array('virtualcatalyst','catalystoffline'));
         $this->allow('emadmin', 'admin',  array('exportmanager'));
         $this->allow('dashboardvcadmin', 'admin',  array('virtualcatalyst', 'dashboardmanager','catalystoffline'));
         $this->allow('dashboardvcemadmin', 'admin',  array('virtualcatalyst', 'dashboardmanager', 'exportmanager','catalystoffline'));
         $this->allow('vcemadmin', 'admin',  array('virtualcatalyst', 'exportmanager','catalystoffline'));
    }
}

?>
