<?php
class Default_Form_Auth_Login extends Zend_Form {
	public function init() {
		$this->setMethod('post');
		
		$this->addElement(
		    'text', 'authName', array(
		        'label' => 'Username',
		        'required' => true,
		        'filters' => array('StringTrim'),
		));
		
		$this->addElement(
		    'password', 'authPass', array(
		        'label' => 'Password',
		        'required' => true,
		));
		
		$this->addElement(
		    'submit', 'authSubmit', array(
		        'label' => 'Login',
		        'ignore' => true
		));
	}
}