<?php
require APPLICATION_PATH."/controllers/helpers/SelfRegistration.php";
require "Zend/Controller/Request/HttpTestCase.php";
require "Zend/Controller/Response/Cli.php";

class SelfRegistrationHelperTest extends ControllerTestCase
{  
   public function setUp()
   {
      parent::setUp();
      define("SOAP_CATALYST_SERVICE_URL", "http://10.103.30.15:8080/catalystservice/");
      define("SOAP_LRN_SERVICE_URL", "http://10.103.30.15:8080/lrnservice/");
   }
   
   public function testGetSelfRegistrationData(){
      $sess = new stdClass();
      $sess->siteId = '7545';
      
      $selfRegistHelperObj = new Helpers_SelfRegistration();
      $applicationController = new ApplicationController(new Zend_Controller_Request_HttpTestCase(), new Zend_Controller_Response_Cli());
      $selfRegistHelperObj->direct($sess, $applicationController);
      
      $response = $selfRegistHelperObj->getSelfRegistrationData('en');
      
      $this->assertEquals(
         empty($response), false
      );
      
      $this->assertEquals(
         isset($response['components']), true
      );
      
      $this->assertEquals(
         isset($response['fieldLists']), true
      );
      
      $this->assertEquals(
         isset($response['labels']), true
      );
      
      $this->assertEquals(
         count($response), 3
      );
   }
   
   public function testPublishedSelfRegistration(){
      $sess = new stdClass();
      $sess->siteId = '7545';
      
      $selfRegistHelperObj = new Helpers_SelfRegistration();
      $applicationController = new ApplicationController(new Zend_Controller_Request_HttpTestCase(), new Zend_Controller_Response_Cli());
      $selfRegistHelperObj->direct($sess, $applicationController);
      
      //make sure the self-register form is edit mode
      //$this->testEditSelfRegistration();
      
      $response = $selfRegistHelperObj->publishSelfRegistration('en');
      
      $this->assertNotEquals(
         $response, false
      );
   }
   
   /*
    * this edit test only work when there is empty record on DB for that particular language
    */
   public function testEditSelfRegistration(){
      $sess = new stdClass();
      $sess->siteId = '7545';
      
      $mockData = array(
                   array
                       (
                           'id' => '',
                           'fieldName' => 'Login_name',
                           'value' => '<p>Please enter only the first initial of your First Name follow by your entire Last Name (e.g.: <strong>J</strong>ohn <strong>Doe</strong> --&gt; <strong>jdoe</strong>).123</p>',
                           'dataGroup' => 'fieldLists'
                       ),
                   Array
                       (
                           'id' => '',
                           'fieldName' => 'FirstName',
                           'value' => 'Please enter your First Name that is on your UTC Employee Badge.',
                           'dataGroup' => 'fieldLists'
                       ),
                   Array
                       (
                           'id' => '',
                           'fieldName' => 'MiddleName',
                           'value' => 'This field is optional.&nbsp; You may provide nor not provide your Midddle Initial.',
                           'dataGroup' => 'fieldLists'
                       ),
                   Array
                       (
                           'id' => '',
                           'fieldName' => 'LastName',
                           'value' => 'Please enter your Last Name that is on your UTC Employee Badge.',
                           'dataGroup' => 'fieldLists'
                       ),
                   Array
                       (
                           'id' => '',
                           'fieldName' => 'Email',
                           'value' => 'Pleasemake sure your domain reflect "@utcsr.com" (e.g.: <a href="mailto:jdoe@utcsr.com">jdoe<strong>@utcsr.com</strong></a>).',
                           'dataGroup' => 'fieldLists'
                       ),
                   Array
                       (
                           'id' => '',
                           'fieldName' => 'City',
                           'value' => '',
                           'dataGroup' => 'fieldLists'
                       ),
                   Array
                       (
                           'id' => '',
                           'fieldName' => 'HCity',
                           'value' => '',
                           'dataGroup' => 'fieldLists'
                       ),
                   Array
                       (
                           'id' => '',
                           'fieldName' => 'Division',
                           'value' => '',
                           'dataGroup' => 'fieldLists',
                       ),
                   Array
                       (
                           'id' => '',
                           'fieldName' => 'SuperFirstName',
                           'value' => 'Please enter your "Organization Identifier" ONLY if you know it. If you don\'t or if you are unsure what it is, please leave the field blank.',
                           'dataGroup' => 'fieldLists'
                       ),
                   Array
                       (
                           'id' => '',
                           'fieldName' => 'HState',
                           'value' => 'Please select a Job Function.',
                           'dataGroup' => 'fieldLists'
                       ),
                   Array
                       (
                           'id' => '',
                           'fieldName' => 'SuperMiddleName',
                           'value' => '',
                           'dataGroup' => 'fieldLists'
                       ),
                   Array
                       (
                           'id' => '',
                           'fieldName' => 'SuperLastName',
                           'value' => '',
                           'dataGroup' => 'fieldLists'
                       ),
                   Array
                       (
                           'id' => '',
                           'fieldName' => 'CostCenter',
                           'value' => '',
                           'dataGroup' => 'fieldLists'
                       ),
                   Array
                       (
                           'id' => '',
                           'fieldName' => 'HPhone',
                           'value' => 'Please enter your "Department ID" ONLY if you know it. If you don\'t or if you are unsure what it is, please leave the field blank.',
                           'dataGroup' => 'fieldLists'
                       ),
                   Array
                       (
                           'id' => '',
                           'fieldName' => 'HZip',
                           'value' => '',
                           'dataGroup' => 'fieldLists'
                       ),
                   Array
                       (
                           'id' => '',
                           'fieldName' => 'HAddress_1',
                           'value' => '',
                           'dataGroup' => 'fieldLists'
                       ),
                   Array
                       (
                           'id' => '',
                           'fieldName' => 'HAddress_2',
                           'value' => 'Please enter your "Badge" ONLY if you know it. If you don\'t or if you are unsure what it is, please leave the field blank.',
                           'dataGroup' => 'fieldLists'
                       ),
                   Array
                       (
                           'id' => '',
                           'fieldName' => 'EmpID',
                           'value' => '',
                           'dataGroup' => 'fieldLists'
                       ),
                   Array
                       (
                           'id' => '',
                           'fieldName' => 'HCountry',
                           'value' => 'Reminder: Your "<strong>Hire Date</strong>" can also be found on your "<a href="http:www.lrn.com" target="_blank"><em>Welcome</em></a>" package given to you by HR.',
                           'dataGroup' => 'fieldLists'
                       ),
                   Array
                       (
                           'id' => '',
                           'fieldName' => 'Title',
                           'value' => '',
                           'dataGroup' => 'fieldLists'
                       ),
                   Array
                       (
                           'id' => '',
                           'fieldName' => 'Address_1',
                           'value' => '',
                           'dataGroup' => 'fieldLists'
                       ),
                   Array
                       (
                           'id' => '',
                           'fieldName' => 'Language',
                           'value' => 'Please enter your "preference" language in which you will be taking your modules in (if available).',
                           'dataGroup' => 'fieldLists'
                       ),
                   Array
                       (
                           'id' => '',
                           'fieldName' => 'userRegistrationCaptcha',
                           'value' => 'on',
                           'dataGroup' => 'fieldLists'
                       ),
                   Array
                       (
                           'id' => '',
                           'fieldName' => 'userRegistrationBottomMessage',
                           'value' => '<p>Please check each field with the asterisk (*) to ensure you have supplied the necessary information in order to create your account. You will not be able to click the "<strong>register</strong>" button until all the mandatory fields are completed. Thank you.</p><p>&nbsp;</p>',
                           'dataGroup' => 'fieldLists'
                       ),
                  Array
                       (
                           'id' => '',
                           'fieldName' => 'userRegistrationCongratsMessage',
                           'value' => '<strong>Congratulation!<br /></strong>You have successfully created an account on UTCSR. &nbsp;Please log into <a href="../">https://utcsr-console.qa7.lrn.com</a> using you new "User Name" and "Password". If you run into any problem logging into UTCSR Catalyst, please contact your site Administrator or you may email to <a href="mailto:support@lrn.com">support@lrn.com</a>.',
                           'dataGroup' => 'fieldLists'
                       ),
                   Array
                       (
                           'id' => '',
                           'fieldName' => 'userRegistrationTopMessage',
                           'value' => 'You have landed on the "<em><strong>Self Registration</strong></em>" page.&nbsp; On this page, you will self-create an account to access the&nbsp;<strong>UTC Catalyst</strong> site to complete your assigned modules. Please be sure to follow the instructions provided next to each field if the instruction is made available. Thank you.',
                           'dataGroup' => 'fieldLists'
                       )
               
               );
      
      $selfRegistHelperObj = new Helpers_SelfRegistration();
      $applicationController = new ApplicationController(new Zend_Controller_Request_HttpTestCase(), new Zend_Controller_Response_Cli());
      $selfRegistHelperObj->direct($sess, $applicationController);
      
      $selfRegistHelperObj->saveSelfRegistrationData('jaJP', $mockData);
   }
}