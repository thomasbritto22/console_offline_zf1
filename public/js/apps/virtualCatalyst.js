try {
    var syncStatusTable = '';
    var saveData = false;
    var accessCodeVal = '', notificationEmailVal = '';

    $(document).ready(function () {

        $(document).on("click", "#btnFileDownload", function () {
            if ($("#btnFileDownload").hasClass('active')) {
                $.ajax({
                    url: "/api/virtual-catalyst/download-app",
                    type: "POST",
                    data: '{"key": "downloadApp", "appOs": "win", "appOsBit": "x64"}',
                    contentType: "application/json",
                    beforeSend: function (xhr) {
                        $("#divFileDownload").addClass('ie8BtnInactive');
                        $("#btnFileDownload").addClass('disabled').attr('disabled', 'disabled');
                        $("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="/images/backgrounds/ajax-loader.gif"  width=50 height=50/></span>Downloading file...</p>');
                        $("#messageModal").dialog({
                            resizable: false,
                            minHeight: 150,
                            width: 150,
                            closeOnEscape: false,
                            open: function (event, ui) {
//                                 $( "#dialog" ).dialog();
                                $(".ui-dialog-titlebar-close", ui.dialog).show();
                                $(".ui-dialog-titlebar", ui.dialog).show();
//                                $("#ui-dialog-title-dialog").hide();
//                                $(".ui-dialog-titlebar").removeClass('ui-widget-header');
                                $("#dialog .ui-dialog-titlebar").css({
                                    "background-color": "transparent",
                                    "border": "0px none"
                                });
                            },
                            close: function (event, ui) {
                                xhr.abort();
                            }
                        });
                    }
                }).done(function (msg) {
                    if (msg.dataObject !== undefined && msg.dataObject.file !== "") {
                        if ($("#messageModal").css('display') === 'block')
                            $("#messageModal").dialog("close");
                        $("#divFileDownload").removeClass('ie8BtnInactive');
                        $("#btnFileDownload").removeClass('disabled').removeClass('inactive').removeAttr('disabled').addClass('active');
                        var $url = "/resourcecenter/download?filepath=" + url.replace("/api", "") + "/custom_files/" + msg.dataObject.file + "&filename=" + msg.dataObject.file + "&type=zip";
//                        var $url = url.replace("/api","")+"/custom_files/" + msg.dataObject.file;
                        $.fileDownload($url)
//                        window.open($url, "_blank");
                        /*                                .done(function () {
                         $("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="/images/backgrounds/done.png"  width=50 height=50/></span>File is Available for Download,Please Save the Zip File.</p>');
                         $("#messageModal").dialog();
                         setTimeout(function () {
                         if ($("#messageModal").css('display') === 'block')
                         $("#messageModal").dialog("close");
                         }, 2000);
                         })
                         .fail(function () {
                         $("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="/images/backgrounds/error.png"  width=50 height=50/></span>Download has failed. Please try again.</p>');
                         $("#messageModal").dialog();
                         setTimeout(function () {
                         if ($("#messageModal").css('display') === 'block')
                         $("#messageModal").dialog("close");
                         }, 2000);
                         });
                         */
                        return false;
                    } else {
                        if ($("#messageModal").css('display') === 'block')
                            $("#messageModal").dialog("close");
                        $("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="/images/backgrounds/error.png"  width=50 height=50/></span>Download has failed. Please try again.</p>');
                        $("#messageModal").dialog();
                        $("#dialog .ui-dialog-titlebar").css({
                            "background-color": "transparent",
                            "border": "0px none"
                        });
                        setTimeout(function () {
                            if ($("#messageModal").css('display') === 'block')
                                $("#messageModal").dialog("close");
                        }, 2000);
                    }
                }).fail(function () {
                    if ($("#messageModal").css('display') === 'block')
                        $("#messageModal").dialog("close");
                    $("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="/images/backgrounds/error.png"  width=50 height=50/></span>Download canceled</p>');
                    $("#messageModal").dialog();
                    $("#dialog .ui-dialog-titlebar").css({
                        "background-color": "transparent",
                        "border": "0px none"
                    });
                    setTimeout(function () {
                        if ($("#messageModal").css('display') === 'block')
                            $("#messageModal").dialog("close");
                    }, 80000);
                    setTimeout(function () {
                        $("#divFileDownload").removeClass('ie8BtnInactive');
                        $("#btnFileDownload").removeClass('disabled').removeClass('inactive').removeAttr('disabled').addClass('active');
                    }, 3000);
                });
            }
        });
        $.ajax({
            url: "/api/virtual-catalyst/setting?key=getSetting",
            type: "GET",
            contentType: "application/json",
            beforeSend: function (xhr) {
                $("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="/images/backgrounds/ajax-loader.gif"  width="50" height="50/" /></span>Loading</p>');
                $("#messageModal").dialog({
                    resizable: false,
                    minHeight: 150,
                    width: 150,
                    closeOnEscape: false,
                    open: function (event, ui) {
                        $(".ui-dialog-titlebar-close", ui.dialog).hide();
                        $(".ui-dialog-titlebar", ui.dialog).hide();
                    }
                });
            }
        }).done(function (response) {
            //to check if user is using IE
            var ie = (function () {
                var undef, v = 3, div = document.createElement('div');

                while (
                        div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
                        div.getElementsByTagName('i')[0]
                        )
                    ;

                return v > 4 ? v : undef;

            }());
            var accessCodeVal;
            $("#txtAccessCode").attr("oldtext", '');
            $("#txtNotificationEmail").attr("oldtext", '');
            for (var i = 0; i < response.content.length; i++) {
                if (response.content[i].settingName == "vc_access_code") {
                    accessCodeVal = response.content[i].settingValue;
                    $("#txtAccessCode").val(accessCodeVal);
                    $("#txtAccessCode").attr("oldtext", accessCodeVal);
                    $("#txtAccessCode").removeClass('placeholder');
                    if (ie) {
                        if(accessCodeVal == "" || accessCodeVal == null){
                            $("#txtAccessCode").val($("#txtAccessCode").attr("placeholder"));
                            $("#txtAccessCode").addClass('placeholder');
                        }
                    }
                }
                if (response.content[i].settingName == "vc_admin_emails") {
                    notificationEmailVal = response.content[i].settingValue;
                    $("#txtNotificationEmail").val(notificationEmailVal);
//                    if($("#txtNotificationEmail").attr("oldtext") != $("#txtNotificationEmail").attr("placeholder"))
                    $("#txtNotificationEmail").attr("oldtext", notificationEmailVal);
                    $("#txtNotificationEmail").removeClass('placeholder');
                    if (ie) {
                        if(notificationEmailVal == "" || notificationEmailVal == null){
                            $("#txtNotificationEmail").val($("#txtNotificationEmail").attr("placeholder"));
                            $("#txtNotificationEmail").addClass('placeholder');
                        }
                    }
                }
            }
            $("#btnAccessCodeSubmit").addClass('disabled').attr('disabled', 'disabled');
            $("#btnAccessCodeReset").addClass('disabled').attr('disabled', 'disabled');
            $("#btnNotifyEmailSubmit").addClass('disabled').attr('disabled', 'disabled');
            $("#btnNotifyEmailSubmitReset").addClass('disabled').attr('disabled', 'disabled');
            if ($("#messageModal").css('display') === 'block')
                $("#messageModal").dialog("close");
            if (accessCodeVal) {
                $("#divFileDownload").removeClass('ie8BtnInactive');
                $("#btnFileDownload").removeClass('disabled').removeClass('inactive').removeAttr('disabled').addClass('active');
            }
        });
        /*******************Sync status table start********************************************/
        Lrn.Application.Admin.prototype.populateSyncStatusTab = function () {
            var dataReq = "key=syncStatus";//"siteId=" + siteId + ;
            $.ajax({
                url: "/api/virtual-catalyst/sync-manager",
                type: "GET",
                data: dataReq,
                contentType: "application/json",
                beforeSend: function (xhr) {
//                            $('#vcAdminTable').html("");
                    $('#vcAdminTable tbody').empty();
                    $("#vcAdminTable_paginate").css({'display': 'none'});
                    $("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="/images/backgrounds/ajax-loader.gif"  width=50 height=50/></span>Loading</p>');
                    $("#messageModal").dialog();
                }
            }).done(function (data) {
                var dataObj = [];
                var rowArray = [];
                if (data.status === 200 && data.error_msg === "success") {
                    dataObj = data.content;
                    for (x = 0; x <= dataObj.length - 1; x++) {
                        rowArray.push({
                            "Sync date": timeConverter(dataObj[x].dateSynched),
                            "# of completions synced": dataObj[x].totalCompleted,
                            "Notification e-mail sent": dataObj[x].emailSentTo,
                            "Synced by": dataObj[x].uploadedBy
                        });
                    }

                    $('#vcAdminTable tbody tr').each(function () {
                        var sTitle;
                        var nTds = $('td', this);
                        var sBrowser = $(nTds[3]).text();

                        this.setAttribute('title', sBrowser);
                    });
                    syncStatusTable = $('#vcAdminTable').DataTable({
                        data: rowArray,
                        info: false,
                        destroy: true,
                        pagingType: "full_numbers_no_ellipses",
                        pageLength: 10,
                        searching: false,
                        order: [[0, "desc"]],
                        lengthMenu: [
                            [10, 20, 30, 40, 50],
                            [10, 20, 30, 40, 50]
                        ],
                        language: {
                            "zeroRecords": "No records to display",
                            "emptyTable": "No records to display"
                        },
                        columns: [{"data": "Sync date", "orderDataType": "custom_date_sort", "type": "string"},
                            {"data": "# of completions synced"},
                            {"data": "Notification e-mail sent"},
                            {"data": "Synced by"}],
                        "fnDrawCallback": function (oSettings) {
                            var dataTableId = '#vcAdminTable';
                            $(dataTableId + '_previous').attr("class", "paginate_enabled_previous");
                            $(dataTableId + '_next').attr("class", "paginate_enabled_next");
                            $(dataTableId + '_paginate > span').attr("style", "float:left");
                            $('tbody tr td').addClass('borderBottomThin contentTextIcons');
                            $('thead th').addClass('contentTextIcons');

                            var l = Math.ceil(oSettings.aoData.length / oSettings._iDisplayLength);
                            var page = Math.ceil(oSettings._iDisplayStart / oSettings._iDisplayLength);
                            $('.current').addClass('paginate_active');
                            $('.current').removeClass('paginate_button current');

                            if (page === 0 && l <= 0) {
                                $(dataTableId + '_paginate').hide();
                                $(dataTableId + '_previous').attr("class", "paginate_disabled_previous");
                                $(dataTableId + '_next').attr("class", "paginate_disabled_next");
                            } else if (page === 0) {
                                $(dataTableId + '_previous').attr("class", "paginate_disabled_previous");
                                if (page === l - 1) {
                                    $(dataTableId + '_next').attr("class", "paginate_disabled_next");
                                }

                                $(dataTableId + '_paginate').show();
                            } else if (page === l - 1) {
                                $(dataTableId + '_next').attr("class", "paginate_disabled_next");
                                $(dataTableId + '_paginate').show();
                            } else {
                                $(dataTableId + '_paginate').show();
                            }
                            if (oSettings.bSorted) {
                                var table = dataTableId;
                                $(table).find('th > span.fa').remove();
                                $(table).find('th.sorting').append('<span class="fa fa-sort"></span>');
                                if (oSettings.aaSorting[0][1] == 'asc') {
                                    $(table).find('th.sorting_asc').append('<span class="fa fa-caret-up"></span>');
                                }
                                if (oSettings.aaSorting[0][1] == 'desc') {
                                    $(table).find('th.sorting_desc').append('<span class="fa fa-caret-down"></span>');
                                }
                            }
                        },
                        aoColumnDefs: [
                            {width: '20%', targets: 0},
                            {width: '30%', targets: 1},
                            {width: '30%', targets: 2},
                            {width: '20%', targets: 3},
                            {aTargets: [2],
                                mRender: function (data) {
                                    return  data ? data.replace(/\,/g, ", ") : data;
                                }
                            }]

                    });

                    /* Apply the tooltips */
                    syncStatusTable.$('tr').tooltip({
                        "delay": 0,
                        "track": true,
                        "fade": 250

                    });

                } else {
                    if ($("#messageModal").css('display') === 'block')
                        $("#messageModal").dialog("close");
                    $("#messageModal").html('<p class="messageModalText">Data Load failed,Please try again!!</p>');
                    $("#messageModal").dialog();
                    setTimeout(function () {
                        $("#messageModal").dialog("close");
                    }, 2000);
                }
                if ($("#messageModal").css('display') === 'block')
                    $("#messageModal").dialog("close");
            }).fail(function () {
                if ($("#messageModal").css('display') === 'block')
                    $("#messageModal").dialog("close");
                $("#messageModal").html('<p class="messageModalText">Data Load failed,Please try again!!</p>');
                $("#messageModal").dialog();
                setTimeout(function () {
                    if ($("#messageModal").css('display') === 'block')
                        $("#messageModal").dialog("close");
                }, 2000);
            });
        };
        /*******************Sync status table end********************************************/
        Lrn.Application.Admin.prototype.sendServerRequest = function (data, mode) {
            var dataReq = {};
            var target;
            switch (mode) {
                case 'accessCode':
                    dataReq = {"key": "saveSetting", "settings": {"vc_access_code": data}, "siteName": company}
                    target = '#btnAccessCodeSubmit';
                    txtfieldSet = '#txtAccessCode';
                    break;
                case 'email':
                    dataReq = {"key": "saveSetting", "settings": {"vc_admin_emails": data}, "siteName": company}
                    target = '#btnNotifyEmailSubmit';
                    txtfieldSet = '#txtNotificationEmail';
                    break;
                case 'both':
                    dataReq = {"key": "saveSetting", "settings": {"vc_access_code": data[0], "vc_admin_emails": data[1]}, "siteName": company}
                    target = '#btnAccessCodeSubmit,#btnNotifyEmailSubmit';
                    txtfieldSet = '#txtAccessCode,#txtNotificationEmail';
                    break;
                default:
                    break;
            }

            $.ajax({
                url: "/api/virtual-catalyst/setting",
                type: "POST",
                data: JSON.stringify(dataReq),
                contentType: "application/json",
                beforeSend: function (xhr) {
                    $("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="/images/backgrounds/ajax-loader.gif"  width=50 height=50/></span>Saving</p>');
                    $("#messageModal").dialog();
                }
            }).done(function (msg) {
                saveData = false;
                if (msg.error_msg === "success" && msg.status === 200) {
                    switch (mode) {
                        case 'accessCode':
                            $("#txtAccessCode").attr("oldtext", $.trim(data));
                            $("#txtAccessCode").val($.trim(data));
                            $("#btnAccessCodeSubmit").addClass('disabled').attr('disabled', 'disabled');
                            $("#btnAccessCodeReset").addClass('disabled').attr('disabled', 'disabled');
                            if ($("#btnNotifyEmailSubmit").attr('disabled') == 'disabled') {
                                $("#saveAll").addClass('disabled').attr('disabled', 'disabled');
                                $("#cancelAll").addClass('disabled').attr('disabled', 'disabled');
                            }
                            $("#txtAccessCode").removeClass('placeholder');
                            break;
                        case 'email':
                            $("#txtNotificationEmail").attr("oldtext", $.trim(msg.content.settingValue));
                            $("#txtNotificationEmail").val($.trim(msg.content.settingValue));
                            $("#btnNotifyEmailSubmit").addClass('disabled').attr('disabled', 'disabled');
                            $("#btnNotifyEmailSubmitReset").addClass('disabled').attr('disabled', 'disabled');
                            if ($("#btnAccessCodeSubmit").attr('disabled') == 'disabled') {
                                $("#saveAll").addClass('disabled').attr('disabled', 'disabled');
                                $("#cancelAll").addClass('disabled').attr('disabled', 'disabled');
                            }
                            $("#txtAccessCode").removeClass('placeholder');
                            break;
                        case 'both':
                            $("#txtAccessCode").attr("oldtext", $.trim(data[0]));
                            $("#txtNotificationEmail").attr("oldtext", $.trim(data[1]));
                            $("#btnAccessCodeSubmit").addClass('disabled').attr('disabled', 'disabled');
                            $("#btnAccessCodeReset").addClass('disabled').attr('disabled', 'disabled');
                            $("#btnNotifyEmailSubmit").addClass('disabled').attr('disabled', 'disabled');
                            $("#btnNotifyEmailSubmitReset").addClass('disabled').attr('disabled', 'disabled');
                            $("#txtAccessCode").removeClass('placeholder');
                            break;
                        default:
                            break;
                    }
                    if ($("#messageModal").css('display') === 'block')
                        $("#messageModal").dialog("close");
                    $("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="/images/backgrounds/done.png"  width=50 height=50/></span>Saved</p>');
                    $("#messageModal").dialog();
                    setTimeout(function () {
                        if ($("#messageModal").css('display') === 'block') {
                            $("#messageModal").dialog("close");
                        }
                    }, 2000);
                    setTimeout(function () {
                        if (mode !== 'email') {
                            $("#divFileDownload").removeClass('ie8BtnInactive');
                            $("#btnFileDownload").removeClass('disabled').removeClass('inactive').removeAttr('disabled').addClass('active');
                        }
                    }, 3000);
                    $(target).addClass('disabled').attr('disabled', 'disabled');
//                    if (mode !== 'email') {
//                        $("#btnFileDownload").removeClass('disabled').removeClass('inactive').removeAttr('disabled').addClass('active');
//                    }
                    if ('profile' == $('#selTab').val() && $("#saveAll").hasClass("disabled")) {

                        //set back the self-reg to orinal mode
                        Lrn.Application.Admin.populateSyncStatusTab();
                    }
                } else {
                    if ($("#messageModal").css('display') === 'block')
                        $("#messageModal").dialog("close");
                    $("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="/images/backgrounds/error.png"  width=50 height=50/></span>Data Save failed,Please try again!!</p>');
                    $("#messageModal").dialog();
                    setTimeout(function () {
                        if ($("#messageModal").css('display') === 'block')
                            $("#messageModal").dialog("close");
                    }, 2000);
                }
            }).fail(function () {
                if ($("#messageModal").css('display') === 'block')
                    $("#messageModal").dialog("close");
                $("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="/images/backgrounds/error.png"  width=50 height=50/></span>Data Save failed,Please try again!!</p>');
                $("#messageModal").dialog();
                setTimeout(function () {
                    if ($("#messageModal").css('display') === 'block')
                        $("#messageModal").dialog("close");
                }, 2000);
            });

        }
        Lrn.Application.Admin.prototype.validateEmail = function (email) {
            var re = /^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)$/i;
//            var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }
        Lrn.Application.Admin.prototype.validateAccessCode = function () {
            var accessCode = $.trim($("#txtAccessCode").val());
            if ($("#messageModal").css('display') === 'block')
                $("#messageModal").dialog("close");
            var pattern = new RegExp("^[A-Za-z0-9\\s\+=~!@#$%^&*|:;\"\',\.\?\\[\\]\(\)\{\}_-]{1,100}$");
            if (accessCode == '' || accessCode == 'undefined' || accessCode == null || accessCode == $("#txtAccessCode").attr('placeholder')) {
                $("#errorAccessText").removeClass('hideErrorMsg').addClass('showErrorMsg').html('Please enter a valid access code.');
                $('#accCodeMsgErr').val('Yes');
//                $('#saveAll').addClass('disabled');
//                $('#saveAll').attr("disabled","disabled");
                if ($("#ui-accordion-1-header-0").hasClass("ui-accordion-header-active") === false)
                    $(".content1").trigger("click");
                return false;
            } else if (!pattern.test(accessCode)) {
                $("#errorAccessText").removeClass('hideErrorMsg').addClass('showErrorMsg').html('Please enter a valid access code.');
                $('#accCodeMsgErr').val('Yes');
//                $('#saveAll').addClass('disabled');
//                $('#saveAll').attr("disabled","disabled");
                if ($("#ui-accordion-1-header-0").hasClass("ui-accordion-header-active") === false)
                    $(".content1").trigger("click");
                return false;
            } else {
                $("#errorAccessText").removeClass('showErrorMsg').html('');
                return accessCode;
            }
        }
        Lrn.Application.Admin.prototype.validateEmailList = function () {
            if ($("#messageModal").css('display') === 'block')
                $("#messageModal").dialog("close");
//            var emailId = $.trim($("#txtNotificationEmail").val()).replace(/\,+$/, '');
            var emailId = $("#txtNotificationEmail").val();
//            if (emailId !== '') {
            /*                $("#errorMsgNotificationEmail").removeClass('hideErrorMsg').addClass('showErrorMsg').html('The e-mail address you entered is invalid. Please enter each e-mail address separated by comma.');
             $("#btnNotifyEmailSubmit").addClass('disabled').attr('disabled', 'disabled');
             $('#emailMsgErr').val('Yes');
             return false;
             } else {*/
            var flag = false;
            var emailList = emailId.split(",");
            emailList = jQuery.unique(emailList).sort();
            var x;
            var validEmailList = [];
            var k = 0;
            if (emailId !== "" && emailId !== $("#txtNotificationEmail").attr('placeholder')) {
                if (emailList.length > 0) {
                    for (x in emailList) {
                        if (!this.validateEmail($.trim(emailList[x]))) {
                            /*                        if (emailList.length === 1){
                             $("#errorMsgNotificationEmail").removeClass('hideErrorMsg').addClass('showErrorMsg').html('The e-mail address you entered is invalid. Please try again.');
                             $("#btnNotifyEmailSubmit").addClass('disabled').attr('disabled', 'disabled');
                             $('#emailMsgErr').val('Yes');
                             //                            $('#saveAll').addClass('disabled');
                             //                            $('#saveAll').attr("disabled","disabled");
                             }
                             else{*/
                            $("#errorMsgNotificationEmail").removeClass('hideErrorMsg').addClass('showErrorMsg').html('You entered an e-mail address that is invalid. Please try again and make sure multiple addresses are separated by a comma.');
                            $("#btnNotifyEmailSubmit").addClass('disabled').attr('disabled', 'disabled');
                            $('#emailMsgErr').val('Yes');
//                        }
                            if ($("#ui-accordion-2-header-0").hasClass("ui-accordion-header-active") === false)
                                $(".content2").trigger("click");
                            return false;
                            break;
                        } else {
                            validEmailList[k++] = $.trim(emailList[x]);
                        }
                    }
                }/* else {
                 $("#errorMsgNotificationEmail").removeClass('hideErrorMsg').addClass('showErrorMsg').html('The e-mail address you entered is invalid. Please enter each e-mail address separated by comma.');
                 $("#btnNotifyEmailSubmit").addClass('disabled').attr('disabled', 'disabled');
                 $('#emailMsgErr').val('Yes');
                 return false;
                 }*/
                if (flag) {
                    $("#errorMsgNotificationEmail").removeClass('hideErrorMsg').addClass('showErrorMsg').html('The e-mail address you entered is invalid. Please enter each e-mail address separated by comma.');
                    $("#btnNotifyEmailSubmit").addClass('disabled').attr('disabled', 'disabled');
                    $('#emailMsgErr').val('Yes');
//                $('#saveAll').addClass('disabled');
//                $('#saveAll').attr("disabled","disabled");
                    return false;
                }
            }
            $("#errorMsgNotificationEmail").removeClass('showErrorMsg').html('');
            var emailList = validEmailList.join(",");
            $("#txtNotificationEmail").val(emailList);
            return $.trim(emailList).replace(/\,+$/, '');
            /*            }
             else{
             $("#errorMsgNotificationEmail").removeClass('hideErrorMsg').addClass('showErrorMsg').html('The e-mail address you entered is invalid. Please try again.');
             $("#btnNotifyEmailSubmit").addClass('disabled').attr('disabled', 'disabled');
             $('#emailMsgErr').val('Yes');
             return false;
             }*/
        }
        $("#txtAccessCode").on('propertychange input', function () {
            saveData = true;
            $("#btnAccessCodeSubmit").removeClass('disabled').removeAttr('disabled');
            $("#btnAccessCodeReset").removeClass('disabled').removeAttr('disabled');
            $("#btnSaveAll").removeClass('disabled').removeAttr('disabled');
            $("#btnCancelAll").removeClass('disabled').removeAttr('disabled');
            $("#divFileDownload").addClass('ie8BtnInactive');
            $("#btnFileDownload").addClass('disabled').attr('disabled', 'disabled');
            /*            if ($.trim($("#txtAccessCode").val()) !== $("#txtAccessCode").attr('oldtext'))
             $("#btnAccessCodeSubmit").addClass('disabled').addAttr('disabled');*/
        });
        $("#btnAccessCodeReset").click(function () {
            if ($("#messageModal").css('display') === 'block')
                $("#messageModal").dialog("close");
            $("#accessResponse").removeClass('showErrorMsg').addClass('hideErrorMsg');
            $("#errorAccessText").removeClass('showErrorMsg').addClass('hideErrorMsg');
            $("#btnAccessCodeSubmit").addClass('disabled').attr('disabled', 'disabled');
            $("#btnAccessCodeReset").addClass('disabled').attr('disabled', 'disabled');
            if ($("#txtAccessCode").val()) {
                $("#divFileDownload").removeClass('ie8BtnInactive');
                $("#btnFileDownload").removeClass('disabled').removeClass('inactive').removeAttr('disabled').addClass('active');
            }
            $("#txtAccessCode").removeClass('placeholder');
            if ($("#btnNotifyEmailSubmit").attr('disabled') == 'disabled') {
                $("#btnSaveAll").addClass('disabled').attr('disabled', 'disabled');
                $("#btnCancelAll").addClass('disabled').attr('disabled', 'disabled');
            }
        });
        $("#txtNotificationEmail").on('propertychange input', function () {
            saveData = true;
            $("#btnNotifyEmailSubmit").removeClass('disabled').removeAttr('disabled');
            $("#btnNotifyEmailSubmitReset").removeClass('disabled').removeAttr('disabled');
            $("#btnSaveAll").removeClass('disabled').removeAttr('disabled');
            $("#btnCancelAll").removeClass('disabled').removeAttr('disabled');
        });
        $("#btnNotifyEmailSubmitReset").click(function () {
            if ($("#messageModal").css('display') === 'block')
                $("#messageModal").dialog("close");
            $("#accessResponse2").removeClass('showErrorMsg').addClass('hideErrorMsg');
            $("#errorMsgNotificationEmail").removeClass('showErrorMsg').addClass('hideErrorMsg');
            $("#btnNotifyEmailSubmit").addClass('disabled').attr('disabled', 'disabled');
            $("#btnNotifyEmailSubmitReset").addClass('disabled').attr('disabled', 'disabled');
            $("#txtAccessCode").removeClass('placeholder');
            if ($("#btnAccessCodeSubmit").attr('disabled') == 'disabled') {
                $("#btnSaveAll").addClass('disabled').attr('disabled', 'disabled');
                $("#btnCancelAll").addClass('disabled').attr('disabled', 'disabled');
            }
        });
        $("#entries").live('change', function () {
            var valSelected = $(this).val();
            $("select[name='vcAdminTable_length']").val(valSelected).change();
        });
    });
    $.fn.DataTable.ext.pager.full_numbers_no_ellipses = function (page, pages) {
        var numbers = [];
        var buttons = $.fn.DataTable.ext.pager.numbers_length;
        var half = Math.floor(buttons / 2);

        var _range = function (len, start) {
            var end;

            if (typeof start === "undefined") {
                start = 0;
                end = len;

            } else {
                end = start;
                start = len;
            }

            var out = [];
            for (var i = start; i < end; i++) {
                out.push(i);
            }

            return out;
        };


        if (pages <= buttons) {
            numbers = _range(0, pages);

        } else if (page <= half) {
            numbers = _range(0, buttons);

        } else if (page >= pages - 1 - half) {
            numbers = _range(pages - buttons, pages);

        } else {
            numbers = _range(page - half, page + half + 1);
        }

        numbers.DT_el = 'span';

        return ['first', 'previous', numbers, 'next', 'last'];
    };
    function timeConverter(UNIX_timestamp) {
        var t = new Date(UNIX_timestamp);
        var formatted = moment(t).format('MM/DD/YYYY HH:mm:ss');
        return formatted;
    }
    // convert date values to 0 for sorting
    function convertToUnixTimestamp(date) {
        if (date === 'N/A' || date === 'NA' || date === '')
            return 0;
        return (new Date(date).getTime() / 1000).toFixed(0);
    }

    // handle custom sort for date
    $.fn.dataTable.ext.order['custom_date_sort'] = function (settings, col)
    {
        return this.api().column(col, {order: 'index'}).nodes().map(function (td, i) {
            var content = convertToUnixTimestamp($(td).html());
            content = (isNaN(content)) ? 0 : content;
            return content;
        });
    };

} catch (e) {
    console.log("Error:" + e.toString());
}