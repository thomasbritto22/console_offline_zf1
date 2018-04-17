<?php

require_once ('_LrnService.php');

class UserServiceSoapModel extends LrnServiceSoapModel {

    function UserServiceSoapModel() {
        $this->init();
    }

    public function authenticate($userName, $password) {
        if (!strpos($userName, '/lrn')) {
            $siteName = $this->siteName;
        } else {
            $siteName = 'lrn';
            $userName = substr_replace($userName, "", strpos($userName, '/lrn'));
        }
        $response = $this->client->authenticateLockout(array(
                    'in0' => $userName,
                    'in1' => $password,
                    'in2' => $siteName,
                    'in3' => $_SERVER['REMOTE_ADDR']
                ))->out;
        return $response->dataObject;
    }

    public function getAuthenticatedUserDetails($userId) {
        $response = $this->client->getUserById(array(
                    'in0' => $userId
                ))->out;
        return $response->dataObject;
    }

    public function forgotPasswordEmail($email, $username, $url, $usernameLabel, $passwordLabel) {
        $response = $this->client->forgotPasswordEmailWithLabels(array(
                    'in0' => $email,
                    'in1' => $username,
                    'in2' => $this->siteName,
                    'in3' => $url,
                    'in4' => $usernameLabel,
                    'in5' => $passwordLabel
                ))->out;
        return $response;
    }

    public function getUserByUsernameCompany($username) {
        $response = $this->client->getUserByUsernameCompany(array(
                    'in0' => $username,
                    'in1' => $this->siteName
                ))->out;
        return $response;
    }

    public function checkPasswordRecoverKey($key) {
        $response = $this->client->checkPasswordRecoverKey(array(
                    'in0' => $key
                ))->out;
        return $response;
    }

    public function forgotPasswordWrite($username, $key, $newpassword) {
        $response = $this->client->forgotPasswordWrite(array(
                    'in0' => $username,
                    'in1' => $this->siteName,
                    'in2' => $key,
                    'in3' => $newpassword
                ))->out;
        return $response;
    }

    public function updatePassword($userId, $oldpassword, $newpassword) {
        $response = $this->client->updatePassword(array(
                    'in0' => $userId,
                    'in1' => $oldpassword,
                    'in2' => $newpassword
                ))->out;
        return $response;
    }

    public function getCustomLabelsByUserIdAndComp($userId, $company) {
        if (!empty($this->client)) {
            $response = $this->client->getCustomLabelsByUserIdAndCompany(array(
                        'in0' => $userId,
                        'in1' => $this->siteName
                    ))->out;

            if (isset($response->dataObject->userLabelList->UserLabelDTO)) {
                $tempArr = array();

                foreach ($response->dataObject->userLabelList->UserLabelDTO as $u) {
                    $tempArr[$u->columnName] = $u;
                }

                return $tempArr;
            } else if (isset($response->dataObject->userLabelList)) {
                if (empty($response->dataObject->userLabelList)) {
                    return (array) null;
                }
                return (array) $response->dataObject->customLabelDTOList;
            } else {
                return $response->dataObject;
            }
        }

        return false;
    }

    public function getPasswordRegex() {

        $response = $this->client->getRegexForPassword(array(
                    'in0' => $this->siteName
                ))->out;
        return $response->dataObject;
    }

    public function setUserModuleLangPref($id, $lang, $moduleId, $userId) {
        $response = $this->client->setUserModuleLangPref(array(
            'in0' => array(
                'id' => $id,
                'language' => $lang,
                'moduleId' => $moduleId,
                'siteId' => $this->siteId,
                'userId' => $userId
            )
        ));
        //die(print_r($response,1)."\r\n".print_r(func_get_args(),1));
        return $response->out;
    }

    public function getUserModuleLangPref($userId, $moduleId) {
        $response = $this->client->getUserModuleLangPref(array(
            'in0' => $userId,
            'in1' => $this->siteId,
            'in2' => $moduleId
        ));
        return $response->out->dataObject;
    }

    public function hasSiteCustomizerAccess($userId, $company) {
        $response = $this->client->hasSiteCustomizerAccess(array(
            'in0' => $userId,
            'in1' => $company
        ));
        return $response->out->dataObject;
    }

    public function insertSelfRegistrationUser($userInfo) {
        if ($this->client) {
            $response = $this->client->insertSelfRegistrationUser(array(
                        'in0' => $userInfo
                    ))->out;
            return $response;
        }
        return false;
    }

    public function userForLCECSession($userId) {

        if (!empty($this->client)) {
            $response = $this->client->getUserForLCECSession(array(
                        'in0' => $userId,
                        'in1' => $this->siteName
                    ))->out;
            return $response->dataObject;
        } else
            return false;
    }

    public function dashBoardManagerViewAll($userId, $siteId) {

        if (!empty($this->client)) {
            $response = $this->client->isDashBoardManagerViewAll(array(
                        'in0' => $userId,
                        'in1' => $this->siteId
                    ))->out;
            return $response->dataObject;
        } else
            return false;
    }

    public function dashBoardManagerConfigure($userId, $siteId) {

        if (!empty($this->client)) {
            $response = $this->client->isDashBoardManagerConfigure(array(
                        'in0' => $userId,
                        'in1' => $this->siteId
                    ))->out;
            return $response->dataObject;
        } else
            return false;
    }

    public function getDashboardManagerPermissions($company, $userId) {

        if (!empty($this->client)) {
            $response = $this->client->getDashboardManagerPermissions(array(
                        'in0' => $this->siteName,
                        'in1' => $userId
                    ))->out;

            $dashboardPermission = array();
            foreach ((array) $response->DashboardPermissionDTO as $dashboardManagerPermission) {

                if (strtolower($dashboardManagerPermission->permissionName) === strtolower($this->siteName . "DashboardManagerconfigure")) {
                    $dashboardPermission['configure'] = $dashboardManagerPermission->permissionValue;
                }
                if (strtolower($dashboardManagerPermission->permissionName) === strtolower($this->siteName . "DashboardManagerview")) {
                    $dashboardPermission['view'] = $dashboardManagerPermission->permissionValue;
                }
                if (strtolower($dashboardManagerPermission->permissionName) === strtolower($this->siteName . "CatalystDashboard1")) {
                    $dashboardPermission['proxy'] = $dashboardManagerPermission->permissionValue;
                }
            }

            return $dashboardPermission;
        } else
            return false;
    }

    public function getVirtualCatalystPermissions($company, $userId) {

        if (!empty($this->client)) {
            $response = $this->client->getVirtualCatalystPermissions(array(
                        'in0' => $company,
                        'in1' => $userId
                    ))->out;
            $vcPermission = 0;
            if(count($response->PermissionResponseDTO) > 1) {
                foreach ((array) $response->PermissionResponseDTO as $emPermissionArr) {
                    if (strtolower($emPermissionArr->appPermission) === strtolower("VirtualCatalyst") && strtolower($emPermissionArr->feature) === strtolower("Configure")) {
                        $vcPermission = 1;
                    }
                }
            } else {
                if (strtolower($response->PermissionResponseDTO->appPermission) === strtolower("VirtualCatalyst") && strtolower($response->PermissionResponseDTO->feature) === strtolower("Configure")) {
                    $vcPermission = 1;
                }
            }
            return $vcPermission;
        } else
            return false;
    }

    public function getExportManagerPermissions($company, $userId) {

        if (!empty($this->client)) {
            $response = $this->client->getExportManagerPermissions(array(
                        'in0' => $company,
                        'in1' => $userId
                    ))->out;
            $emPermission = 0;
            if(count($response->PermissionResponseDTO) > 1) {
                foreach ((array) $response->PermissionResponseDTO as $emPermissionArr) {
                    if (strtolower($emPermissionArr->appPermission) === strtolower("ExportCourse") && strtolower($emPermissionArr->feature) === strtolower("admin_export")) {
                        $emPermission = 1;
                    }
                }
            } else {
                if (strtolower($response->PermissionResponseDTO->appPermission) === strtolower("ExportCourse") && strtolower($response->PermissionResponseDTO->feature) === strtolower("admin_export")) {
                    $emPermission = 1;
                }
            }
            return $emPermission;
        } else
            return false;
    }

}
