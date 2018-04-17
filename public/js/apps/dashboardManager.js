var api_hierarchy = "hierarchy";
var api_campaign = "campaign";
var api_chart = "chart";
var api_drilldown = "drilldown";
var api_proxy = "proxy";

var replaceVal = "@@@";
var replaceAps = "%27";
var replaceQuestion = "%3F";

// drill one
var usercolumnrep = [];
var modulecolumnsum = [];

var usercolumnrepin = [];
var modulecolumnsumin = [];

//drill two
var usercolumnsumdet = [];
var modulecolumnsumdet = [];

var usercolumnsumdetin = [];
var modulecolumnsumdetin = [];
// get request parameters
var active = "";
var catalyst_dashboard_api = "";
var dashBoardId = "";
var responsep = [];
var UserIdentity;

function getRequestValues() {

    //catalyst_dashboard_api  = $("#catalyst_dashboard_api").val();
    dashBoardId = $("#dashboardId").val();
}
function getDashboardDetails() {
    //dashboard/dashboard?siteId=5851&userId=748901key=dashboardConfig
    // data: { siteId: siteId, userId: userId, key: 'dashboardConfig'},
    $.ajax({
        url: url + 'dashboard',
        dataType: 'json',
        cache: false,
        data: {key: 'dashboardConfig'},
        type: 'GET',
        success: function (response) {

            if (response.error_code == 200) {

                if (response.dashboardID != 0 && response.dashboardID != "") {
                    $("#dashboardId").val(response.dashboardID);
                    getRequestValues();
                    isDashboardIdNotNull();
                    getDashboardStatus();
                    onlyViewTabVisible();// only happens when when view tab is active
                }
                else {
                    isDashboardIdNull();
                    appendNullErrorMessage();
                }
            }
            else if (response.error_code == 402) {
                window.location.href = '/auth/logout';
            }
            else if (response.error_code == 401) {
                appendErrorMessage(response.error_code, response.error_msg);
            }
            else {
                isDashboardIdNull();
                //appendNullErrorMessage();
                customErrorMessage(response.error_code);
            }
        }
    });
}
function getDashboardStatus() {
    // data: { siteId: siteId, userId: userId, key: 'dashboardStatus'}
    $.ajax({
        url: url + 'dashboard',
        dataType: 'json',
        cache: false,
        data: {key: 'dashboardStatus'},
        type: 'GET',
        success: function (response) {
            if (response.error_code == 200) {
                if (response.active == 1) {
                    $("#flag_show_dash").val(response.active);
                    $("#my_dashtoggle").attr('checked', true);
                    $("#my_dashtoggle").closest('div').find('.slider').click();

                } else {
                    $("#flag_show_dash").val(0);
                    $("#my_dashtoggle").attr('checked', false);

                }
            }
            else if (response.error_code == 402) {
                window.location.href = '/auth/logout';
            }
            else if (response.error_code == 401) {
                appendErrorMessage(response.error_code, response.error_msg);
            }

        }
    });
}
function saveInitialConfiguration() {
    //webservice team will insert a record into table for admin first time only
    //this entry is only for users whos has dashboardConfigure permission
    //saveDashboard/siteId=5851/userId=14452130/active=1

    //var jsonPostData = '{"siteId" : '+siteId+' ,"userId": '+userId+' , "active" : 1}'; //correct format
    var jsonPostData = '{"active" : 1}'; //correct format
    $.ajax({
        headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json'
        },
        url: url + "dashboard",
        dataType: 'json',
        type: "POST",
        data: jsonPostData,
        success: function (response) {
            if (response.error_code == 200) {
                getDashboardDetails();
            }
            else if (response.error_code == 402) {
                window.location.href = '/auth/logout';
            }
            else if (response.error_code == 401) {
                appendErrorMessage(response.error_code, response.error_msg);
            }
            else {
                isDashboardIdNull();
                //appendNullErrorMessage();
                customErrorMessage(response.error_code);
            }
        }
    });
}
function saveDashboardStatus() { //onclick of on and off button call from root level js
    //showDashboard/siteId=5851/active=1/userId=14452130/dashBoardId=24
    //  var jsonPostData = '{"siteId" : '+siteId+' ,"active":'+active+', "userId":'+userId+' , "dashBoardId":'+dashBoardId+' }'; //correct format
    var active = $("#flag_show_dash").val();
    var jsonPostData = '{"active":' + active + ', "dashBoardId":' + dashBoardId + ' }'; //correct format

    $.ajax({
        headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json'
        },
        url: url + "dashboard",
        dataType: 'json',
        type: "POST",
        data: jsonPostData,
        success: function (response) {
            if (response.error_code == 200) {
                $("#flag_show_dash").val(active);
            }
            else if (response.error_code == 402) {
                window.location.href = '/auth/logout';
            }
            else if (response.error_code == 401) {
                appendErrorMessage(response.error_code, response.error_msg);
            }
            else {
                customErrorMessage(response.error_code);
            }
        }
    });
}
// accordion click bind function    
$(document)
        .ready(
                function () {
                    // console.log($("#textuser").val());
                    getRequestValues(); // seeting up values
                    saveInitialConfiguration(); // initial configuration for webservices
                    $("#configureView").click(function () {
                        $("#dashFilterGroup").hide();
                        $("#view_tab").val(0);
                    });
                    $("#proxySubmit").on("click", function () {
                        //console.log($("#textuser").val());
                        saveProxyInfo();
                    });
                    $("#drillSubmit").click(function () {
                        saveDrillInfo();
                    });

                    $("#chartSubmit").click(function () {
                        saveChart();
                    });
                    $("#campaignSubmit").click(function () {
                        saveCampaign();
                    });
                    $("#hierarchySubmit").click(function () {
                        saveHierarchy();
                    });

                    $("#excludeLink").click(function () {
                        openExcludeDialog();
                    });
                    $("#editLink").click(function () {
                        openExcludeDialog();
                    });
                    $("#graphView").click(function () {

                        var viewFlag = $("#view_tab").val();
                        if (viewFlag == 0) {
                            setDashboardDetails(); // when click on graph view
                        }
                        $("#view_tab").val(1);
                    });

                    $("#excludeCheck").click(function () {
                        $("#addExc").hide();
                        if ($("#excludeCheck").is(':checked')) {

                            $("#addExc").show();
                        }
                    });

                    // select all checkbox

                    $('#chkselecctall').click(function (event) { // on click
                        if (this.checked) { // check select status
                            $('.campcheckbox').each(function () { // loop through
                                // each checkbox
                                this.checked = true; // select all checkboxes
                                // with class
                                // "checkbox1"
                            });
                        } else {
                            $('.campcheckbox').each(function () { // loop through
                                // each checkbox
                                this.checked = false; // deselect all
                                // checkboxes with class
                                // "checkbox1"
                            });
                        }
                    });
                    // select all checkbox ends

                    $(".adminSectionHeader").bind(
                            "click",
                            function () {

                                var displayStyle = $(this).next()
                                        .css('display');
                                var apiName = $(this).data("api-name");
                                switch (apiName) {

                                    case api_hierarchy:
                                        if (apiName === api_hierarchy && displayStyle === "none") {
                                            callHierarchyApi();
                                        }
                                        break;
                                    case api_campaign:
                                        if (apiName === api_campaign && displayStyle === "none") {
                                            $("#jsonTable").html("");
                                            callCampaignApi();
                                        }
                                        break;
                                    case api_chart:
                                        if (apiName === api_chart && displayStyle === "none") {
                                            callChartApi();
                                        }
                                        break;
                                    case api_drilldown:
                                        if (apiName === api_drilldown && displayStyle === "none") {
                                            callDrillApi();
                                        }
                                        break;
                                    case api_proxy:
                                        if (apiName === api_proxy && displayStyle === "none") {
                                            callProxyApi();
                                        }
                                        break;
                                }

                            });


                    // add remove function
                    $('#groupbtn-add').click(
                            function () {
                                $('#groupselect-from option:selected').each(
                                        function () {
                                            $('#groupselect-to').append(
                                                    "<option title='" + $(this).text() + "' value='"
                                                    + $(this).val()
                                                    + "'>"
                                                    + $(this).text()
                                                    + "</option>");
                                            $(this).remove();
                                        });
                            });
                    $('#groupbtn-remove').click(
                            function () {
                                $('#groupselect-to option:selected').each(
                                        function () {
                                            $('#groupselect-from').append(
                                                    "<option title='" + $(this).text() + "' value='"
                                                    + $(this).val()
                                                    + "'>"
                                                    + $(this).text()
                                                    + "</option>");
                                            $(this).remove();
                                        });
                            });

                    $('#btn-add').click(
                            function () {
                                $('#select-from option:selected').each(
                                        function () {
                                            $('#select-to').append(
                                                    "<option title='" + $(this).text() + "'  value='"
                                                    + $(this).val()
                                                    + "'>"
                                                    + $(this).text()
                                                    + "</option>");
                                            $(this).remove();
                                        });
                            });
                    $('#btn-remove').click(
                            function () {
                                $('#select-to option:selected').each(
                                        function () {
                                            if ($.inArray($(this).val(), usercolumnrep) > -1 || $.inArray($(this).val(), usercolumnrepin) > -1) {
                                                $('#usercolumnrep').append("<option title='" + $(this).text() + "' value='" + $(this).val() + "'>" + $(this).text() + "</option>");
                                                $(this).remove();
                                            }
                                            if ($.inArray($(this).val(), modulecolumnsum) > -1 || $.inArray($(this).val(), modulecolumnsumin) > -1) {
                                                $('#modulecolumnsum').append("<option title='" + $(this).text() + "' value='" + $(this).val() + "'>" + $(this).text() + "</option>");
                                                $(this).remove();
                                            }
                                            //console.log($(this).val());
                                        });

                                //console.log(usercolumnrepin);
                                //console.log(modulecolumnsum);
                            });

                    $('#btn-add-view').click(
                            function () {
                                $('#viewselect-from option:selected').each(
                                        function () {
                                            $('#viewselect-to').append(
                                                    "<option title='" + $(this).text() + "' value='"
                                                    + $(this).val()
                                                    + "'>"
                                                    + $(this).text()
                                                    + "</option>");
                                            $(this).remove();
                                        });
                            });
                    $('#btn-remove-view').click(
                            function () {
                                $('#viewselect-to option:selected').each(
                                        function () {
                                            if ($.inArray($(this).val(), usercolumnsumdet) > -1 || $.inArray($(this).val(), usercolumnsumdetin) > -1) {
                                                $('#usercolumnsummary').append("<option title='" + $(this).text() + "' value='" + $(this).val() + "'>" + $(this).text() + "</option>");
                                                $(this).remove();
                                            }
                                            if ($.inArray($(this).val(), modulecolumnsumdet) > -1 || $.inArray($(this).val(), modulecolumnsumdetin) > -1) {
                                                $('#modulecolumnsummary').append("<option title='" + $(this).text() + "' value='" + $(this).val() + "'>" + $(this).text() + "</option>");
                                                $(this).remove();
                                            }
                                        });
                                //console.log(usercolumnsumdet);
                                //console.log(usercolumnsumdetin);

                            });
                    // dynamic placeholder for search box
                    $("#searchbox").attr('placeholder', 'Enter ' + UserIdentity + ' or name');

// ////////////////////////////////////////////////////////////////////// add
// remove function ends



// API Call Hierarchy
                    function callHierarchyApi() {

                        var hierarchyFlag = $("#flagHierarchy").val();
                        var api_show_hierarchy = $("#api_show_hierarchy").val();
                        var key_show_hierarchy = $("#key_show_hierarchy").val();
                        $("#hierrachyErr").html("");
                        //data: { siteId: siteId, dashBoardId: dashBoardId, key: 'hierarchyInfo'},

                        showLoader('hierarchy_loader', 'hierarchy_show');
                        if (hierarchyFlag == 0) {
                            $("#flagHierarchy").val(1);
                            $.ajax({
                                url: url + 'hierarchy',
                                dataType: 'json',
                                cache: false,
                                data: {dashBoardId: dashBoardId, key: 'hierarchyInfo'},
                                type: 'GET',
                                success: function (response) {

                                    if (response.error_code == 200) {
                                        //console.log(response);
                                        hideLoader('hierarchy_loader', 'hierarchy_show');
                                        setHierarchy(response);
                                        $("#flagHierarchy").val(0);
                                    }
                                    else if (response.error_code == 402) {
                                        window.location.href = '/auth/logout';
                                    }
                                    else if (response.error_code == 401) {
                                        appendErrorMessage(response.error_code, response.error_msg);
                                    }
                                    else {
                                        hideLoader('hierarchy_loader', 'hierarchy_show');
                                    }
                                }
                            });
                        }
                    }
                    function callCampaignApi() {
                        var campaignFlag = $("#flagCampaign").val();
                        showLoader('campaign_loader', 'campaign_show');
                        $("#campErr").html("");
                        //data: {siteId: siteId, dashBoardId: dashBoardId, key: 'campaignInfo'},

                        if (campaignFlag == 0) {
                            $.ajax({
                                url: url + 'campaign',
                                dataType: 'json',
                                cache: false,
                                data: {dashBoardId: dashBoardId, key: 'campaignInfo'},
                                success: function (response) {
                                    hideLoader('campaign_loader', 'campaign_show');
                                    if (response.error_code == 200) {
                                        setCampaign(response.campaign);
                                    }
                                    else if (response.error_code == 402) {
                                        window.location.href = '/auth/logout';
                                    }
                                    else if (response.error_code == 401) {
                                        appendErrorMessage(response.error_code, response.error_msg);
                                    }
                                    else {
                                        hideLoader('campaign_loader', 'campaign_show');
                                    }
                                }
                            });
                        }
                    }
                    function callChartApi() {
                        var chartFlag = $("#flagChart").val();
                        showLoader('chart_loader', 'chart_show');
                        //data: {siteId: siteId, dashBoardId: dashBoardId, key: 'chartConfig'},

                        if (chartFlag == 0) {
                            $.ajax({
                                url: url + 'chart',
                                dataType: 'json',
                                cache: false,
                                data: {dashBoardId: dashBoardId, key: 'chartConfig'},
                                success: function (response) {
                                    if (response.error_code == 200) {
                                        hideLoader('chart_loader', 'chart_show');
                                        setChart(response);
                                    }
                                    else if (response.error_code == 402) {
                                        window.location.href = '/auth/logout';
                                    }
                                    else if (response.error_code == 401) {
                                        appendErrorMessage(response.error_code, response.error_msg);
                                    }
                                    else {
                                        hideLoader('chart_loader', 'chart_show');
                                    }
                                }
                            });
                        }
                    }
                    function callDrillApi() {
                        var drillFlag = $("#flagDrill").val();
                        showLoader('drill_loader', 'drill_show');
                        //data: {siteId: siteId, dashBoardId: dashBoardId, key: 'drillDownConfig'}

                        if (drillFlag == 0) {
                            $.ajax({
                                url: url + 'drilldown',
                                dataType: 'json',
                                cache: false,
                                data: {dashBoardId: dashBoardId, key: 'drillDownConfig'},
                                success: function (response) {
                                    if (response.error_code == 200) {
                                        hideLoader('drill_loader', 'drill_show');
                                        setDrillList(response);
                                    }
                                    else if (response.error_code == 402) {
                                        window.location.href = '/auth/logout';
                                    }
                                    else if (response.error_code == 401) {
                                        appendErrorMessage(response.error_code, response.error_msg);
                                    }
                                    else {
                                        hideLoader('drill_loader', 'drill_show');
                                    }
                                }
                            });
                        }
                    }
                    callProxyApi = function () {
                        // api call for opening accordion
                        //clear search box when clicked on accordion
                        $('#searchbox').val('');
                        $('#proxy_show').hide();
                        // disable sorting for delete icon                       
                        // $("#proxyData thead tr :first-child").removeClass('sorting_asc');
                        showLoader('proxy_loader', 'proxyData');
                        $.ajax({
                            url: url + 'proxy',
                            dataType: 'json',
                            type: 'GET',
                            data: {key: 'getProxyAssignmentAndProxyPermissionUserList'},
                            cache: false,
                            success: function (response) {
                                if (response.status == 200) {
                                    hideLoader('proxy_loader', 'proxyData');
                                    //console.log(response.status);
                                    $('#proxy_show').show();
                                    responsep = response.proxy_assignment_permission_list;
                                    createDataTable(responsep);
                                }
                                //$('#proxyData_filter label input').attr('placeholder', 'Enter user ID or name');
                                else if (response.status == 402) {
                                    window.location.href = '/auth/logout';
                                }
                                else if (response.status == 401) {
                                    appendErrorMessage(response.status, response.status);
                                }
                                else if (response.status == 404) {

                                    hideLoader('proxy_loader', 'proxyData');
                                    $('#proxy_show').show();
                                    responsep = response.proxy_assignment_permission_list;
                                    createDataTable(responsep);
                                }
                            },
                        });
                    }
                    getProxyUsers = function () {
                        // api call for showing proxy users list
                       // $("#datatable_laoder").show();
                        $("#proxyData").hide();
                        $.ajax({
                            url: url + 'proxy',
                            dataType: 'json',
                            type: 'GET',
                            data: {key: 'getProxyAssignmentAndProxyPermissionUserList'},
                            cache: false,
                            success: function (response) {

                                $("#datatable_laoder").hide();
                                $("#proxyData").show();
                                if (response.status == 200) {
                                    responsep = response.proxy_assignment_permission_list;
                                    createDataTable(responsep);
                                }
                                else if (response.status == 402) {
                                    window.location.href = '/auth/logout';
                                }
                                else if (response.status == 401) {
                                    appendErrorMessage(response.status, response.status);
                                }
                                else if (response.status == 404) {
                                    responsep = response.proxy_assignment_permission_list;
                                    createDataTable(responsep);
                                }
                            },
                        });
                    }
                    // function to update proxy users
                    updateProxyUser = function (oldText, newText, assignid, proxyuserid, seqno) {

                        if (proxyuserid == null) {
                            proxyuserid = '';
                        }
                        var jsonPostData = '{"proxyLoginName" : "' + newText + '","key" : "saveProxyAssignmentAdminSection","assigneeUserId" : "' + assignid + '" ,"oldProxyUserId" : "' + proxyuserid + '" }';
                        //loader show
                        $("#" + seqno).show();
                        $("#editable" + seqno).hide();
                        $.ajax({
                            headers: {
                                'Accept': '*/*',
                                'Content-Type': 'application/json'
                            },
                            url: url + 'proxy',
                            dataType: 'json',
                            type: 'POST',
                            data: jsonPostData,
                            cache: false,
                            success: function (response) {
                                //console.log(response.status);
                                //loader hide
                                $("#" + seqno).hide();
                                $("#editable" + seqno).show();
                                if (response.status == 200) {
                                    $("#err" + seqno).hide();
                                    $("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' + CDN_IMG_URL + '/images/backgrounds/ajax-loader.gif"  width=50 height=50/></span>Saving</p>');
                                    $("#messageModal").dialog({
                                        resizable: false,
                                        minHeight: 150,
                                        width: 150,
                                        closeOnEscape: false,
                                        open: function (event, ui) {
                                            $(".ui-dialog-titlebar-close", $(this).parent()).hide();
                                            $(".ui-dialog-titlebar", $(this).parent()).hide();
                                        }
                                    });
                                    $("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' + CDN_IMG_URL + '/images/backgrounds/done.jpg"  width=50 height=50/></span>Saved</p>');
                                    setTimeout(function () {
                                        $("#messageModal").dialog("close");
                                    }, 1000);
                                    //$("#err"+seqno).html('User Saved').css('color','green'); 
                                    $("#editable" + seqno).data('lastsaved',newText);
                                    $("#err" + seqno).html('');
                                    //code to reload when  proxy user is added/edited                                   
                                    setTimeout(function () {
                                        $("#proxyData_paginate").hide();
                                        $("#datatable_laoder").show();
                                        $("#proxyData").hide();
                                        getProxyUsers();
                                    }, 1000);
                                }
                                else if (response.status == 321) {
                                    //validation for inactive user
                                    $("#err" + seqno).show();
                                    $("#editable" + seqno).removeClass("default");
                                    $("#editable" + seqno).addClass("cellEditing");
                                    $("#err" + seqno).html(UserIdentity + " is not active.").css('color', 'red');
                                    $("#editable" + seqno).removeAttr('readonly');
                                    $("#editable" + seqno).focus();
                                } else if (response.status == 322) {
                                    //validation for already assigned user
                                    $("#err" + seqno).show();
                                    $("#editable" + seqno).removeClass("default");
                                    $("#editable" + seqno).addClass("cellEditing");
                                    $("#err" + seqno).html(UserIdentity + " is already assigned to this user.").css('color', 'red');
                                    $("#editable" + seqno).removeAttr('readonly');
                                    $("#editable" + seqno).focus();
                                } else if (response.status == 323) {
                                    //validation for user not found
                                    $("#err" + seqno).show();
                                    $("#editable" + seqno).removeClass("default");
                                    $("#editable" + seqno).addClass("cellEditing");
                                    $("#err" + seqno).html(UserIdentity + " was not found.").css('color', 'red');
                                    $("#editable" + seqno).removeAttr('readonly');
                                    $("#editable" + seqno).focus();
                                }
                                else if (response.status == 402) {
                                    window.location.href = '/auth/logout';
                                }
                                else if (response.status == 401) {
                                    appendErrorMessage(response.status, response.status);
                                }
                                else if (response.status == 404) {

                                }
                            },
                        });
                    }
                    createDataTable = function (responsep) {
                        proxyDataTable = $('#proxyData').DataTable({ 
                            "bLengthChange": false,
                            "iDisplayLength": 10,
                            "bInfo": false,
                            "destroy": true,
                            "bAutoWidth": true,
                            "bProcessing": true,
                            "order": [[2, "asc"]],
                            "destroy": true,
                                    "language": {
                                        "emptyTable": "There are no records to display.",
                                        "zeroRecords": "No search results were found."
                                    },
                            "sDom": "flrtip",
                            "data": responsep, // <-- your array of objects
                            "fnDrawCallback": function () {
                                $("#proxyData thead tr :first-child").removeClass('sorting_asc');
                                $("#proxyData th").addClass("proxyText");
                                $("#proxyData td").removeClass("sorting_1");
                            },
                            "fnHeaderCallback": function (nHead, aasData, iStart, iEnd, aiDisplay) {
                                if (aiDisplay.length > 10) {
                                    $(".dataTables_paginate").show();
                                } else {
                                    $(".dataTables_paginate").hide();
                                }
                            },
                            "aoColumns": [
                                {
                                    mRender: function (response, type, row) {

                                        if (row.proxyLoginName != null) {
                                            return '<i class="fa fa-trash-o adminColor no-sort"  style="cursor:pointer" onclick="createModalProxy(' + row.proxyUserId + ',' + row.userId + ')"></i><i class="material-icons adminColor no-sort"  style="cursor:pointer" onclick="createModalProxy(' + row.proxyUserId + ',' + row.userId + ')">&#xE872;</i>'
                                        } else {
                                            //fix for ie11
                                            return '';
                                        }
                                    }, "bSortable": false
                                },
                                {"mData": "userLoginName", "title": UserIdentity, "sClass": "left"}, // <-- which values to use inside object
                                {"mData": "userDisplayName", "title": "Name", "sClass": "left"},
                                {"mData": "proxyLoginName", "title": "Assigned proxy " + UserIdentity, "sClass": "left"}, // <-- which values to use inside object
                                {"mData": "proxyDisplayName", "title": "Assigned proxy's name", "sClass": "left"}
                            ],
                            aoColumnDefs: [
                                {aTargets: [3],
                                    mRender: function (responsep, row, full) {

                                        if (responsep == null) {
                                            responsep = '';
                                        }
                                        return '<div id="' + full.sequenceNumber + '" class="loader waitMsg" style="font-size:10px;display:none;">processing...</div><input readonly  class="default" data-lastsaved="' +responsep+ '" data-seqno="' + full.sequenceNumber + '" id="editable' + full.sequenceNumber + '" data-assignid="' + full.userId + '"  data-proxyuserid="' + full.proxyUserId + '"  maxlength="25" type="text" value="' + responsep + '"/><span  style="display:none">' + responsep + '</span><div  id="err' + full.sequenceNumber + '" style="display:none"></span>';
                                    }
                                }]
                        });
                        //$('#proxyData').find('input[type=text]').prop("readonly", true);
                        $('#proxyData').removeClass('no-footer');
                        $('#proxyData').DataTable().search(
                                $('#searchbox').val()
                                ).draw();
                    };

                    $('#searchbox').on("keyup", function (e) {
                        if (e.currentTarget.value.length > 0) {
                            $("#clearSearch").removeClass('disabled').removeAttr("disabled");
                        } else {
                            $("#clearSearch").addClass('disabled').prop("disabled", true);
                        }
                    });

                    $("#statusCompletedSearch").on('click', function () {
                        $('#proxyData').DataTable().search(
                                $('#searchbox').val()
                                ).draw();
                    });
                    $("#searchbox").on('customkeyup', function () {
                        $('#proxyData').DataTable().search(
                                $('#searchbox').val()
                                ).draw();
                    });
                    $("#searchbox").on('keyup', function (e) {
                         if(e.keyCode == 13)
                            {
                                $(this).trigger("customkeyup");
                            }
                    });
                    $("#clearSearch").on('click', function () {
                        $("#searchbox").val('');
                        $('#proxyData').DataTable().clear();
                        createDataTable(responsep);
                    });
                      
                    // User can click on field with error and it will show a text box to edit the valueAs soon as user clicks outside the value will be saved 
                    $('#proxyData').on('dblclick', 'tbody td:not(:first-child)', function (e) {
                        $(this).find('input[type=text]').attr('readonly',false);
                        assignid = $(this).find('input[type=text]').data('assignid');
                        proxyuserid = $(this).find('input[type=text]').data('proxyuserid');
                        seqno = $(this).find('input[type=text]').data('seqno');                       
                        var originalContent, oldText, newText;
                        originalContent = e.currentTarget.textContent;
                        $(this).find('input[type=text]').removeClass("default");
                        $(this).find('input[type=text]').addClass("cellEditing");
                        $("#editable"+seqno).select();                       
                        $(this).children().removeClass('nameError');                      
                       
                        $(this).find('input[type=text]').blur(function (e) {                           
                            $(this).attr('readonly', true);
                            $(this).removeClass("cellEditing");
                            $(this).addClass("default");
                            
                            oldText= $("#editable"+seqno).data('lastsaved');
                           
                            newText = $(this)[0].value.toUpperCase().replace(/(<([^>]+)>)/ig, "");
                            if (newText == '') {
                                //validation
                                $("#" + seqno).hide();
                                $("#err" + seqno).hide();
                                $("#editable" + seqno).val(oldText);
                                $("#editable" + seqno).removeClass("cellEditing");
                                $("#editable" + seqno).addClass("default");
                            }
                            else if (oldText != newText) {
                                createChangeProxy(oldText, newText, assignid, proxyuserid, seqno);
                            } else if (oldText == newText) {
                                $(this).removeClass("cellEditing");
                                $(this).addClass("default");
                                $("#err" + seqno).html('');
                            }
                        });
                    });
                   createModalProxy =function(proxyuser, user) {
                        var deleteText = "Are you sure you want to delete this proxy assignment?";
                        $("#messageProxy").show();
                        $("#messageProxy").html('<p class="messageModalT  contentTextIcons font-style4">' + deleteText + '</p>');
                        $("#messageProxy").dialog({
                            resizable: false,
                            height: 160,
                            width: 300,
                            closeOnEscape: false,
                            modal: true,
                            open: function (event, ui) {
                                $("#messageProxy").prev().hide();
                                $("#messageProxy").prev().prev().hide();
                                $("#messageProxy").addClass("borderBottomRadius");
                                $("#ui-id-1").addClass("span-margin");
                                // $(".ui-dialog-buttonset button").removeClass('ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only');
                                //  $(".ui-dialog-buttonset button").addClass('customButton');
                            },
                            buttons: {
                                "OK": (function () {
                                    $("#messageProxy").dialog("close");
                                    deleteProxy(proxyuser, user);
                                }).bind(this),
                                "Cancel": (function () {
                                    $("#messageProxy").dialog("close");
                                }).bind(this)
                            }
                        });
                    };
                    createChangeProxy= function (oldText, newText, assignid, proxyuserid, seqno ) {
                        var deleteText = "Are you sure you want to change this proxy assignment?";
                        $("#messageProxy").show();
                        $("#messageProxy").html('<p class="messageModalT  contentTextIcons font-style4">' + deleteText + '</p>');
                        $("#messageProxy").dialog({
                            resizable: false,
                            height: 160,
                            width: 300,
                            closeOnEscape: false,
                            modal: true,
                            open: function (event, ui) {
                                $("#messageProxy").prev().hide();
                                $("#messageProxy").prev().prev().hide();
                                $("#messageProxy").addClass("borderBottomRadius");
                                $("#ui-id-1").addClass("span-margin");
                                // $(".ui-dialog-buttonset button").removeClass('ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only');
                                //  $(".ui-dialog-buttonset button").addClass('customButton');
                            },
                            buttons: {
                                "OK": (function () {
                                    $("#messageProxy").dialog("close");
                                    updateProxyUser(oldText, newText, assignid, proxyuserid, seqno);
                                }).bind(this),
                                "Cancel": (function () {
                                    $("#messageProxy").dialog("close");
                                    $("#editable"+seqno).val(oldText);
                                    $("#err" + seqno).html('');
                                }).bind(this)
                            }
                        });
                    };
                    function deleteProxy(proxyuser, user) {
                        //$(".dataTables_paginate").hide();
                        $("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' + CDN_IMG_URL + '/images/backgrounds/ajax-loader.gif"  width=50 height=50/></span>Deleting</p>');
                        $("#messageModal").dialog({
                            resizable: false,
                            minHeight: 150,
                            width: 150,
                            closeOnEscape: false,
                            open: function (event, ui) {
                                $(".ui-dialog-titlebar-close", $(this).parent()).hide();
                                $(".ui-dialog-titlebar", $(this).parent()).hide();
                            }
                        });
                        var jsonData = {proxyUserId: proxyuser, userId: user, key: 'deleteProxyAssignment'};
                        //$("#datatable_laoder").show();
                        //$("#proxyData").hide();
                        $.ajax({
                            headers: {
                                'Accept': '*/*',
                                'Content-Type': 'application/json'
                            },
                            url: url + "proxy",
                            dataType: 'json',
                            type: "GET",
                            data: jsonData,
                            cache: false,
                            success: function (response) {
                              
                                if (response.status == 200) {
                                    
                                    $("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' + CDN_IMG_URL + '/images/backgrounds/done.jpg"  width=50 height=50/></span>Deleted</p>');
                                    setTimeout(function () {
                                        $("#messageModal").dialog("close");
                                        $(".dataTables_paginate").hide();
                                        $("#datatable_laoder").show();
                                        $("#proxyData").hide();
                                          getProxyUsers();
                                    }, 1000);
                                }
                                else if (response.status == 402) {
                                    window.location.href = '/auth/logout';
                                }
                                else if (response.status == 401) {
                                    appendErrorMessage(response.status, response.error_msg);
                                }
                                else {
                                    getProxyUsers();
                                }
                            }
                        });
                    }
                });


// set Hierarchy
function setHierarchy(response) {

    createDropDown(response.dataObject.columnDisplayNameList, "hierarchy1Value", "levelone");
    createDropDown(response.dataObject.columnDisplayNameList, "hierarchy2Value", "leveltwo");
    createDropDown(response.dataObject.columnDisplayNameList, "hierarchy3Value", "levelthree");

    var hierarchy1Value = "Please select";
    var hierarchy2Value = "Please select";
    var hierarchy3Value = "Please select";
    //check for null

    if (response.dataObject.hierarchy1Value) {
        hierarchy1Value = response.dataObject.hierarchy1Value;
    }
    if (response.dataObject.hierarchy2Value) {
        hierarchy2Value = response.dataObject.hierarchy2Value;
    }
    if (response.dataObject.hierarchy3Value) {
        hierarchy3Value = response.dataObject.hierarchy3Value;
    }

    // set selected value

    $("#hierarchy1Value").val(replaceApostrophe(hierarchy1Value));
    $("#hierarchy2Value").val(replaceApostrophe(hierarchy2Value));
    $("#hierarchy3Value").val(replaceApostrophe(hierarchy3Value));

    // $("#excludeCheck").attr('checked', false);
    //$("#addExc").hide();
    // if (response.exclude == 1)
    // $("#excludeCheck").attr('checked', true);
    //$("#addExc").show();
}

// set Campaign
function setCampaign(response) {
    //setDrillList

    drawTableDash(response);
}
// set chart
function setChart(response) {
    var completion_status = response.isCourseCompletionStatusWithGroupBySelected;
    var course_comp_status = response.isCourseCompletionStatusSelected;
    var incom_past_due = response.isIncompleteAndPastDueSelected;
    var com_status_sum = response.isAssignmentStatusSelected;

    $("#com_status_sum").attr('checked', false);
    $("#incom_past_due").attr('checked', false);
    $("#course_comp_status").attr('checked', false);
    $("#completion_status").attr('checked', false);

    if (completion_status == 1) {

        $("#completion_status").attr('checked', true);
    }
    if (course_comp_status == 1) {

        $("#course_comp_status").attr('checked', true);
    }
    if (incom_past_due == 1) {

        $("#incom_past_due").attr('checked', true);
    }
    if (com_status_sum == 1) {

        $("#com_status_sum").attr('checked', true);
    }
    // ///////////list box populate
    response = response.groupBy;

    createListBox(response.available, "groupselect-from",
            "groupAvailable");
    createListBox(response.included, "groupselect-to",
            "groupIncluded");

}
// set Drill list

function setDrillList(response) {
    setCheckBox(response);
    setUserDetailList(response.drillDownForDetailsList);
    setDrillDetailList(response.drillDownForSummaryList);
}
// ///////////////////////////////////////////////////////////////////////
// functions////////////////////////////////////////////////////////////////////////////
function setCheckBox(data) {

    var reportDetailsChk = data.isDrillDownReportSelected;
    var userDeatilsChk = data.isDrillDownUserSummaryDetailsSelected;

    $("#drill-report").attr('checked', false);
    $("#drill-user").attr('checked', false);

    if (reportDetailsChk == 1) {

        $("#drill-report").attr('checked', true);
    }
    if (userDeatilsChk == 1) {

        $("#drill-user").attr('checked', true);
    }
}
function setUserDetailList(response) {
    //console.log(response.available.moduleReportColumn);
    createDrillAvailListBoxReport(response.available, "select-from", "selectfrom");
    createDrillListBoxReport(response.included, "select-to", "selectto");

}
function setDrillDetailList(response) {

    createDrillAvailListBoxSummary(response.available, "viewselect-from", "viewselectfrom");
    createDrillListBoxSummary(response.included, "viewselect-to", "viewselectto");

}
// /////////////////drill down function ends
// //////////////////////////////////////////////////////////

// Move up and down
// ///////////////////////////////////////////////////////////////////////////////////
function Move_Items(direction, listBoxId) {

    var listbox = document.getElementById(listBoxId);
    var selIndex = listbox.selectedIndex;
    if (selIndex == -1) {
        alert("Please select an option to move.");
        return;
    }

    var increment = -1;
    if (direction == 'up')
        increment = -1;
    else
        increment = 1;

    if ((selIndex + increment) < 0
            || (selIndex + increment) > (listbox.options.length - 1)) {
        return;
    }

    var selValue = listbox.options[selIndex].value;
    var selText = listbox.options[selIndex].text;
    listbox.options[selIndex].value = listbox.options[selIndex + increment].value
    listbox.options[selIndex].text = listbox.options[selIndex + increment].text

    listbox.options[selIndex + increment].value = selValue;
    listbox.options[selIndex + increment].text = selText;

    listbox.selectedIndex = selIndex + increment;
}
// /////////////////////// Move up and dwon
// ends////////////////////////////////////////////////

// select all function starts
// //////////////////////////////////////////////////////////////////
function selectAll(listId) {
    $("#" + listId + " option").prop("selected", true);
}
// select all function ends
// //////////////////////////////////////////////////////////////////

// get Campaign
function getCampeign(data) {

    drawTableDash(data.campeign);
}

// creating list
// box/////////////////////////////////////////////////////////////////////////
function createListBox(response, selectid, placeholderid) {

    $("#" + placeholderid).html("");
	
    var select = '<select name=' + selectid + ' id=' + selectid
            + ' multiple size="5" style="width: 200px; height: 200px;">';

    $.each(response, function (key, val) {
        select += "<option title='" + val + "' value='" + replaceApostrophe(val) + "'>" + val + "</option>";
    });

    select += '</select>';

    $("#" + placeholderid).append(select);
}
function createDrillListBoxReport(response, selectid, placeholderid) {
    var i = 0;
    var j = 0;

    $("#" + placeholderid).html("");

    var select = '<select class="listBoxAvl" name=' + selectid + ' id=' + selectid
            + ' multiple size="5" >';


    $.each(response, function (key, val) {
        select += "<option title='" + val.columnDisplayName + "' value='" + val.columnName + "'>" + val.columnDisplayName + "</option>";
        if (val.isUserColumn == 1) {
            usercolumnrepin[i] = val.columnName;
            i++;
        } else {
            modulecolumnsumin[j] = val.columnName;
            j++;
        }

    });

    select += '</select>';

    $("#" + placeholderid).append(select);
}
function createDrillListBoxSummary(response, selectid, placeholderid) {
    var i = 0;
    var j = 0;
    $("#" + placeholderid).html("");

    var select = '<select class="listBoxAvl" name=' + selectid + ' id=' + selectid
            + ' multiple size="5" >';


    $.each(response, function (key, val) {
        select += "<option title='" + val.columnDisplayName + "' value='" + val.columnName + "'>" + val.columnDisplayName + "</option>";
        if (val.isUserColumn == 1) {
            usercolumnsumdetin[i] = val.columnName;
            i++;
        } else {
            modulecolumnsumdetin[j] = val.columnName;
            j++;
        }
    });

    select += '</select>';

    $("#" + placeholderid).append(select);
}
function createDrillAvailListBoxReport(response, selectid, placeholderid) {
    var i = 0;
    var j = 0;
    $("#" + placeholderid).html("");

    var select = '<select class="listBox" name=' + selectid + ' id=' + selectid
            + ' multiple size="5">';

    select += '<optgroup id="usercolumnrep" label="User Columns">';
    $.each(response.userColumn, function (key, val) {
        select += "<option title='" + val.columnDisplayName + "'  value='" + val.columnName + "'>" + val.columnDisplayName + "</option>";
        usercolumnrep[i] = val.columnName;
        i++;
    });
    select += '</optgroup>';
    select += '<optgroup id="modulecolumnsum" label="Module Report Columns">';
    $.each(response.moduleReportColumn, function (key, val) {
        select += "<option  title='" + val.columnDisplayName + "' value='" + val.columnName + "'>" + val.columnDisplayName + "</option>";
        modulecolumnsum[j] = val.columnName;
        j++;
    });
    select += '</optgroup>';
    select += '</select>';

    $("#" + placeholderid).append(select);
}
function createDrillAvailListBoxSummary(response, selectid, placeholderid) {
    var i = 0;
    var j = 0;
    $("#" + placeholderid).html("");

    var select = '<select class="listBox" name=' + selectid + ' id=' + selectid
            + ' multiple size="5">';

    select += '<optgroup id="usercolumnsummary" label="User Columns">';
    $.each(response.userColumn, function (key, val) {
        select += "<option title='" + val.columnDisplayName + "' value='" + val.columnName + "'>" + val.columnDisplayName + "</option>";
        usercolumnsumdet[i] = val.columnName;
        i++;

    });
    select += '</optgroup>';
    select += '<optgroup id="modulecolumnsummary" label="Module Report Columns">';
    $.each(response.moduleReportColumn, function (key, val) {
        select += "<option title='" + val.columnDisplayName + "' value='" + val.columnName + "'>" + val.columnDisplayName + "</option>";
        modulecolumnsumdet[j] = val.columnName;
        j++;
    });
    select += '</optgroup>';
    select += '</select>';

    $("#" + placeholderid).append(select);
}
// creating list box end
// ///////////////////////////////////////////////////////////

// creating drop down box
// //////////////////////////////////////////////////////////
function createDropDown(response, selectid, placeholderid) {
     var deactivate = "";
    var select = "";
    $("#" + placeholderid).html("");
	
        select = '<select ' + deactivate + ' name=' + selectid + ' id=' + selectid
                + ' style="width: 200px;">';
        select += "<option value='Please Select'>Please Select</option>";
        $.each(response, function (key, val) {
            select += "<option title='" + val + "' value='" + replaceApostrophe(val) + "'>" + val + "</option>";
        });

    $("#" + placeholderid).append(select);

}
// drop downbox end  ////////////////////////////////////////////////////////////

// draw campaign  table

function drawTableDash(response) {

    var trHTML = "";
    var val = "001";
    $("#campaignTbl").html("");
    trHTML = '<table id="campTbl" class="tablesorter"><thead> <tr><th>Select&nbsp;</th><th>Campaign</th><th>Start Date</th><th>Status</th></tr></thead><tbody> ';
    $
            .each(
                    response,
                    function (key, val) {
                        if (val.checked == 1)
                            sel = 'checked';
                        else
                            sel = "";
                        trHTML += '<tr><td style="text-align:center;"><span class="hidden">' + val.checked + '</span><input  ' + sel + ' type="checkbox" class="campcheckbox" name="check[]"  value="'
                                + val.campaignId
                                + '" /></td>'
                                + '<td style="text-align:left;padding-right:20px;">'
                                + val.campaignTitle
                                + '</td><td style="padding-right:20px;" >'
                                + val.campaignDate
                                + '</td><td style="text-align:center;padding-right:20px;">'
                                + val.campaignStatus + '</td></tr>';


                    });
    trHTML += "</tbody></table>";

    $("#campaignTbl").append(trHTML);

    $("#campTbl").tablesorter();

    $('#campTbl input').click(function () {
        var order = this.checked ? '1' : '0';
        $(this).prev().html(order);
        $(this).parents("table").trigger("update");
    });

}
//save hierarchy

function saveHierarchy() {

    var hierarchyone = checkPleaseSelect($("#hierarchy1Value").val());
    var hierarchytwo = checkPleaseSelect($("#hierarchy2Value").val());
    var hierarchythree = checkPleaseSelect($("#hierarchy3Value").val());
    //    var jsonPostData = '{"siteId" : ' + siteId + ',"dashBoardId" : ' + dashBoardId + ',"hierarchy1Value" : "' + hierarchyone + '","hierarchy1Updated" : 1,"hierarchy2Value" : "' + hierarchytwo + '","hierarchy2Updated" : 1,"hierarchy3Value" : "' + hierarchythree + '","hierarchy3Updated" : 1,"userId" : ' + userId + '}';

    var error = 0;
    $("#hierrachyErr").html("");
    var jsonPostData = '{"dashBoardId" : ' + dashBoardId + ',"hierarchy1Value" : "' + hierarchyone + '","hierarchy1Updated" : 1,"hierarchy2Value" : "' + hierarchytwo + '","hierarchy2Updated" : 1,"hierarchy3Value" : "' + hierarchythree + '","hierarchy3Updated" : 1}';
    if (hierarchyone == "isNullValue" && hierarchytwo == "isNullValue" && hierarchythree == "isNullValue") {
        //$("#hierrachyErr").html("Please select at least first or second hierarchy column");
        $("#hierrachyErr").html("Please select at least one hierarchy column");
        error++;
    }
    if (error == 0) {
        showLoader('hierarchyLoader', 'hierarchySubmit');

        $.ajax({
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json'
            },
            url: url + 'hierarchy',
            dataType: 'json',
            type: "POST",
            data: jsonPostData,
            success: function (response) {
                if (response.error_code == 200) {
                    hideLoader('hierarchyLoader', 'hierarchySubmit');

                }
                else if (response.error_code == 402) {
                    window.location.href = '/auth/logout';
                }
                else if (response.error_code == 401) {
                    appendErrorMessage(response.error_code, response.error_msg);
                }
                else {
                    hideLoader('hierarchyLoader', 'hierarchySubmit');
                    //console.log(response.error_msg);
                }
            }
        });
    }
}
//save campaign
function saveCampaign() {

    var val = [];
    var error = 0;
    var campaign = 0;
    $("#campErr").html("");
    $('.campcheckbox:checked').each(function (i) {
        val[i] = $(this).val();
    });
    var campaignIds = val.toString();

    if (campaignIds) {

        campaign++;
        //
    } else {
        campaignIds = null;

    }
    if (campaign == 0) {
        $("#campErr").html("Please select at least one campaign");
        error++;
    }
    // var jsonPostData = '{"siteId" : ' + siteId + ', "dashBoardId" : ' + dashBoardId + ',"curriculumIds" : "' + campaignIds + '", "userId" : ' + userId + '}';

    if (error == 0) {
        var jsonPostData = '{"dashBoardId" : ' + dashBoardId + ',"curriculumIds" : "' + campaignIds + '"}';
        showLoader('campaignLoader', 'campaignSubmit');
        $.ajax({
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json'
            },
            url: url + 'campaign',
            dataType: 'json',
            type: "POST",
            data: jsonPostData,
            success: function (response) {
                if (response.error_code == 200) {
                    hideLoader('campaignLoader', 'campaignSubmit');
                }
                else if (response.error_code == 402) {
                    window.location.href = '/auth/logout';
                }
                else if (response.error_code == 401) {
                    appendErrorMessage(response.error_code, response.error_msg);
                }
                else {
                    hideLoader('campaignLoader', 'campaignSubmit');
                    //console.log(response.error_msg);
                }
            }
        });
    }

}

// save chart info /////////////////////////////////////////

function saveChart() {

    var error = 0;

    var completion_status = 0;
    var incom_past_due = 0;
    var com_status_sum = 0;
    var course_comp_status = 0;
    var vals = [];
    var textvals = [];
    var column_name = "";
    //group by option 

    $('#groupselect-to option').each(function (i, selected) {

        vals[i] = replaceApostrophe($(selected).val());
        //textvals[i] = $( selected ).text();
    });
    var includedValues = vals.toString();

    if (includedValues) {
        //
    } else {
        includedValues = null;
        error++;
    }
    if ($("#completion_status").is(':checked'))
        completion_status = 1;
    if ($("#incom_past_due").is(':checked'))
        incom_past_due = 1;
    if ($("#com_status_sum").is(':checked'))
        com_status_sum = 1;
    if ($("#course_comp_status").is(':checked'))
        course_comp_status = 1;
//    var jsonPostData = '{"siteId" : ' + siteId + ',"dashBoardId" : ' + dashBoardId + ',"userId" : ' + userId + ',"includedColumns" : "' + includedValues + '","columnsUpdated" : 1,"assignmentStatusSelected" : ' + com_status_sum + ',"incompleteAndPastDueSelected" : ' + incom_past_due + ',"courseCompletionSatusSelected" : ' + course_comp_status + ',"courseCompletionStatusWithGroupBySelected" : ' + completion_status + '}';

    var jsonPostData = '{"dashBoardId" : ' + dashBoardId + ',"includedColumns" : "' + includedValues + '","columnsUpdated" : 1,"assignmentStatusSelected" : ' + com_status_sum + ',"incompleteAndPastDueSelected" : ' + incom_past_due + ',"courseCompletionSatusSelected" : ' + course_comp_status + ',"courseCompletionStatusWithGroupBySelected" : ' + completion_status + '}';

    showLoader('chartLoader', 'chartSubmit');

    if (error == 0) {
        $("#chartErr").html('');
        $.ajax({
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json'
            },
            url: url + 'chart',
            dataType: 'json',
            type: "POST",
            data: jsonPostData,
            success: function (response) {
                if (response.error_code == 200) {
                    hideLoader('chartLoader', 'chartSubmit');
                }
                else if (response.error_code == 402) {
                    window.location.href = '/auth/logout';
                }
                else if (response.error_code == 401) {
                    appendErrorMessage(response.error_code, response.error_msg);
                }
                else {
                    hideLoader('chartLoader', 'chartSubmit');
                    //console.log(response.error_msg);
                }
            }
        });
    } else {
        hideLoader('chartLoader', 'chartSubmit');
        $("#chartErr").html('Please add at least one data field to the Included list.');
    }

}

//save  drill info functions/////////////////////////////////

function saveDrillInfo() {

    var vals = [];
    var viewvals = [];
    var textvals = [];
    var viewtextvals = [];
    var drillReport = 0;
    var drillUsr = 0;
    var error = 0;
    $("#drillErr").html("");

    //Allow Drill Down Report Details 
    $('#select-to option').each(function (i, selected) {
        vals[i] = $(selected).val();
        textvals[i] = replaceApostrophe($(selected).text());
    });

    // Allow Drill Down to User Summary Details 
    $('#viewselect-to option').each(function (i, selected) {
        viewvals[i] = $(selected).val();
        viewtextvals[i] = replaceApostrophe($(selected).text());
    });

    //checkbox;

    if ($("#drill-report").is(':checked'))
        drillReport = 1;

    if ($("#drill-user").is(':checked'))
        drillUsr = 1;

    var includedColumnIDDrill = vals.toString();
    var includedColumnIDDrillSummary = viewvals.toString();
    var includedColumnDisplayNameListForDrillDown = textvals.toString();
    var includedColumnDisplayNameListForSummaryDetailsDrillDown = viewtextvals.toString();

    // validation
    if (drillReport == 1) {
        if (includedColumnIDDrill) {
            //
        } else {
            error++;
        }
    }
    if (drillUsr == 1) {
        if (includedColumnIDDrillSummary) {
            //
        } else {
            error++;
        }
    }
    //    var jsonPostData = '{"siteId" :' + siteId + ',"dashBoardId" : ' + dashBoardId + ',"userId" : ' + userId + ',"drillDownReportSelected" : ' + drillReport + ',"includedColumnListForDrillDown" : "' + includedColumnIDDrill + '","includedColumnDisplayNameListForDrillDown" : "' + includedColumnDisplayNameListForDrillDown + '","includedColumnListForDrillDownUpdated" : 1,"drillDownUserSummaryDetailsSelected" : ' + drillUsr + ',"includedColumnListForSummaryDetailsDrillDown" : "' + includedColumnIDDrillSummary + '","includedColumnDisplayNameListForSummaryDetailsDrillDown" : "' + includedColumnDisplayNameListForSummaryDetailsDrillDown + '","includedColumnListForSummaryDetailsDrillDownUpdated" : 1}';

    var jsonPostData = '{"dashBoardId" : ' + dashBoardId + ',"drillDownReportSelected" : ' + drillReport + ',"includedColumnListForDrillDown" : "' + includedColumnIDDrill + '","includedColumnDisplayNameListForDrillDown" : "' + includedColumnDisplayNameListForDrillDown + '","includedColumnListForDrillDownUpdated" : 1,"drillDownUserSummaryDetailsSelected" : ' + drillUsr + ',"includedColumnListForSummaryDetailsDrillDown" : "' + includedColumnIDDrillSummary + '","includedColumnDisplayNameListForSummaryDetailsDrillDown" : "' + includedColumnDisplayNameListForSummaryDetailsDrillDown + '","includedColumnListForSummaryDetailsDrillDownUpdated" : 1}';
    //console.log(jsonPostData);
    showLoader('drillLoader', 'drillSubmit');
    if (error == 0) {
        $.ajax({
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json'
            },
            url: url + 'drilldown',
            dataType: 'json',
            type: "POST",
            data: jsonPostData,
            success: function (response) {
                if (response.error_code == 200) {
                    hideLoader('drillLoader', 'drillSubmit');
                }
                else if (response.error_code == 402) {
                    window.location.href = '/auth/logout';
                }
                else if (response.error_code == 401) {
                    appendErrorMessage(response.error_code, response.error_msg);
                }
                else {
                    hideLoader('drillLoader', 'drillSubmit');
                    //console.log(response.error_msg);
                }
            }
        });
    } else {
        hideLoader('drillLoader', 'drillSubmit');
        $("#drillErr").html('Please add at least one data field to the Included list.');
    }

}

function showLoader(loader, btn) {

    $("#" + loader).show();
    $("#" + btn).hide();
}
function hideLoader(loader, btn) {

    $("#" + loader).hide();
    $("#" + btn).show();
}
function openExcludeDialogFieldValues() {
    $("#excludeModal").dialog("close");
    $("#excludeModalFieldValue").dialog({
        autoOpen: false,
        buttons: {
            Cancel: function () {
                $(this).dialog("close");
                $("#excludeModal").dialog("open");
            },
            Continue: function () {
                $(this).dialog("close");
                $("#excludeModal").dialog("open");
            }
        },
        title: "",
        position: {
            my: "center",
            at: "center",
            of: window
        },
        modal: true,
        width: '80%'
    });

    $("#excludeModalFieldValue").dialog("open");

}
function openExcludeDialog() {


    $("#excludeModal").dialog({
        autoOpen: false,
        buttons: {
            Cancel: function () {
                $(this).dialog("close");
            },
            Continue: function () {
                $(this).dialog("close");
            }
        },
        title: "",
        position: {
            my: "center",
            at: "center",
            of: window
        },
        modal: true,
        width: '80%'
    });

    $("#excludeModal").dialog("open");
}
function replaceApostrophe(str) {
    str = str.replace(/'/g, replaceAps);
    str = str.replace(/\?/g, replaceQuestion);
    return  str.replace(/\//g, replaceVal);
}
function checkPleaseSelect(str) {
    // if please selct then make the string empty
    if (str == "Please Select") {
        return "isNullValue";
    } else {
        return str;
    }
}

function disableBtns() {
    // in process
    $("#hierarchySubmit button").attr("disabled", "disabled");
    $("#campaignSubmit button").attr("disabled", "disabled");
    $("#chartSubmit button").attr("disabled", "disabled");
    $("#hierarchySubmit button").removeClass("adminBlueBtn  noClass");
    $("#campaignSubmit button").removeClass("adminBlueBtn  noClass");
    $("#chartSubmit button").removeClass("adminBlueBtn  noClass");
    $("#proxySubmit button").removeClass("adminBlueBtn  noClass");
}
function enableBtns() {
    // not in process
    $("#hierarchySubmit button").addClass("adminBlueBtn");
    $("#campaignSubmit button").addClass("adminBlueBtn");
    $("#chartSubmit button").addClass("adminBlueBtn");
    $("#proxySubmit button").addClass("adminBlueBtn");
    $("#hierarchySubmit button").attr("disabled", "");
    $("#campaignSubmit button").attr("disabled", "");
    $("#chartSubmit button").attr("disabled", "");
    $("#proxySubmit button").attr("disabled", "");
}
function isDashboardIdNull() {

    $("#categorySection").hide();
}
function isDashboardIdNotNull() {

    $("#categorySection").show();
}
function appendNullErrorMessage() {

    $(".adminHeader").append('<div id="errorWrapper"><div id="errorTop"><p class="messageTop"><span>We\'re sorry, but the page you\'re looking for seems to have problem in loading.</span><br></p></div><div id="errorBottom"><p class="messageBottomDash">Try returning to the home page to find the page you were looking for, or E-mail support for more help.</p></div></div>');

}
function onlyViewTabVisible() {

    if (hasConfigPermission == 0) {
        if (hasDashBoardView == 1) {
            setDashboardDetails();
        }
    }
}