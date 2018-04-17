<?php
class IndexControllerTest extends ControllerTestCase
{
    public function testIndexAction() {
        $this->dispatch('/');
        $this->assertController('auth');
        $this->assertAction('login');
    }

    public function testErrorURL() {
        $this->dispatch('/auth/forgotpassword');
        $this->assertController('auth');
        $this->assertAction('forgotpassword');
    }
}