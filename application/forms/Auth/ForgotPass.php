<?php
class Form_Forgot_Pass extends Zend_Form {
	public function init() {
		$this->setMethod('post');
		$this->addElement(
		    'text', 'email', array(
		        'label' => 'EMail',
		        'required' => true,
		        'filters' => array('StringTrim'),
		));
		
		$this->addElement(
		    'submit', 'submit', array(
		        'label' => 'Send Email',
		        'ignore' => true
		));
	}
}