<?php
class LcecPassthruControllerTest extends ControllerTestCase
{
   public function setUp()
   {
      parent::setUp();
      
      $this->login('admin1', '123123');
      $this->dispatch('/admin/home');
      $this->assertController('admin');
      $this->assertAction('home');
   }
   
   public function testIndexAction()
   {
//       $uploadButtonText = "upload image";
//       $replaceButtonText = "replace image";
      
//       $this->resetResponse();
//       $this->dispatch('/admin/home');
      
//       // fetch content of the page
//       $html = $this->getResponse()->getBody();
      
//       // parse page content, find the hash value prefilled to the hidden element
//       $dom = new Zend_Dom_Query($html);
//       $uploadImageButtons = $dom->query('button[data-type="img"].getFile');
      
//       //assert to see it is really the admin page
//       $this->assertQueryContentContains('h3','Program Branding');

//       foreach ($uploadImageButtons as $button) {
//          if ("video_tourthumbnail" != $button->getAttribute('id')){
//             if ("" == $button->getAttribute('data-existed')){
//                $this->assertEquals($button->nodeValue, $uploadButtonText);
//             }
//             else
//             {
//                $this->assertEquals($button->nodeValue, $replaceButtonText);
//             }  
//          }
//       }
   }
}