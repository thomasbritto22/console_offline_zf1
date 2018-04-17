var emptyGraph = "";
var dashBoardId = "";
var PieChart2Obj = "";
var donutChartObj = "";
var PiChartObj = "";
var BarChartObj = "";
var BarChart2Obj = "";
var showCourseCompletionStatusWithGroupByChart = "";
var showIncompletePastDue = "";
var showUserAssignmentStatusChart = "";
var showCourseCompletionStatusChart = "";
var showDrillDownReport = "";
var showDrillDownUserSummaryDetailReport = "";
var height = 400;
var width = 730;
var firstChartTitle = "Course Completion Status";
var secondChartTitle = "Incomplete and Past Due Courses";
var thirdChartTitle = "User Completion Status";
var fourthChartTitle = "Course Status Details";
var jsonDataChart1;
var jsonDataChart4;
var jsonDataChart2;
var jsonDataChart3;
var chartOneObj;
var chartTwoObj;
var chartThreeObj;
var chartFourObj;
var resized = false;
var userId = '<?=$this->user->userId ?>';
var managerId = '<?=$this->user->userId ?>';
var UserIdentity;

//START CALL=================================================================================

$(document).ready(function () {
    // this will activate when it is run from dashboard link
    //console.log("UserIdentity"+UserIdentity);
    isAdmin = isAdminUsr();
    hideMinus();
    if (flag_to_start == 1) {
        if (isAdmin == 1) {
            setDashboardDetails();
        } else {
            getDashboardStatus();
        }
    }
    $("#pie_plus").click(function () {
        $("#pieDetail").slideDown();
        $("#pie_minus").show();
        $("#pie_plus").hide();
    });
    $("#pie_minus").click(function () {
        $("#pieDetail").slideUp();
        $("#pie_minus").hide();
        $("#pie_plus").show();
    });

    $("#chart2_plus").click(function () {
        $("#chart2Detail").slideDown();
        $("#chart2_minus").show();
        $("#chart2_plus").hide();
    });
    $("#chart2_minus").click(function () {
        $("#chart2Detail").slideUp();
        $("#chart2_minus").hide();
        $("#chart2_plus").show();

    });

    $("#chart1_plus").click(function () {
        $("#chart1Detail").slideDown();
        $("#chart1_minus").show();
        $("#chart1_plus").hide();
    });

    $("#chart1_minus").click(function () {
        $("#chart1Detail").slideUp();
        $("#chart1_minus").hide();
        $("#chart1_plus").show();
    });

    $("#donut_plus").click(function () {
        $("#donutDetail").slideDown();
        $("#donut_plus").hide();
        $("#donut_minus").show();
    });
    $("#donut_minus").click(function () {
        $("#donutDetail").slideUp();
        $("#donut_plus").show();
        $("#donut_minus").hide();
    });
    $("#proxyuserid").attr('placeholder', 'Enter ' + UserIdentity + ' here');
    // added by pradnya to show popup when clicking on assign proxy button
    $("#assignProxy").click(function () {
        $("#errProxy").html("");
        $("#proxyuserid").val('');
        $("#proxypopup").show();
        $('#proxypopup').dialog({
            title: 'Assign proxy',
            modal: true,
            width: 500,
            resizable: false,
            draggable: false,
            cache: false,
            open: function () {
                $("#proxypopup").addClass("borderBottomRadius");
                $("#ui-id-1").addClass("span-margin");
                getProxyUsersList();
            },
            close: function () {
                $('#proxypopup').dialog("close");
            }
        });
    });
    $("#submitProxy").on("click", function () {
        saveProxyAssignment();
    });
    function closePopup() {
        $(".ui-dialog-titlebar").removeClass('ui-widget-header');
        $(".ui-dialog-titlebar-close").find('span').removeClass('ui-button-icon-primary ui-icon ui-icon-closethick').addClass('fa fa-times-circle');
    }
    // save proxy user info
    function saveProxyAssignment() {

        //console.log("test");
        var proxyUser = $("#proxyuserid").val();
        // console.log(proxyUser);
        error = 0;
        if (proxyUser == '') {
            //console.log("please fill the data");        
            $("#errProxy").html("This field is required.").css('color', 'red');
            error++;
        }
        /*if(/^[a-zA-Z0-9-,_]*$/.test(proxyUser) == false){
         $("#errProxy").html("Special characters are not allowed.").css('color','red');       
         error++;
         }*/
        if (error == 0) {

            $("#errProxy").html("");

            $("#submitProxy").hide();
            $("#submitLoader").show();

            var jsonPostData = '{"proxyLoginName" : "' + proxyUser + '","key" : "saveProxyAssignment" }';
            $.ajax({
                headers: {
                    'Accept': '*/*',
                    'Content-Type': 'application/json'
                },
                url: url + "proxy",
                dataType: 'json',
                type: "POST",
                data: jsonPostData,
                cache: false,
                success: function (response) {
                    //console.log(response.status);
                    $("#submitProxy").show();
                    $("#submitLoader").hide();
                    if (response.status == 200) {
                        //success
                        getProxyUsersList();
                        $("#proxyuserid").val("");
                        //$("#errProxy").html("User Saved.").css('color', 'green');
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
                    }
                    else if (response.status == 321) {
                        //validation for inactive user
                        $("#errProxy").html(UserIdentity + " is not active.").css('color', 'red');
                    } else if (response.status == 322) {
                        //validation for already assigned user
                        $("#errProxy").html(UserIdentity + " is already assigned to this user.").css('color', 'red');
                    } else if (response.status == 323) {
                        //validation for user not found
                        $("#errProxy").html(UserIdentity + " was not found.").css('color', 'red');
                    }
                    else if (response.status == 402) {
                        window.location.href = '/auth/logout';
                    }
                    else if (response.status == 401) {
                        appendErrorMessage(response.status, response.error_msg);
                    }
                    else {
                        getProxyUsersList();

                    }
                }
            });
        }
    }
    //function to get proxy users list
    function getProxyAssignmentList() {

        $('#proxyTable').DataTable({
            "ajax": {
                "url": "js/apps/getData.php",
                "dataSrc": ""
            },
            "columns": [
                {"data": "proxyuserid"},
                {"data": "proxyusername"}
            ]
        });

    }
    showLoader = function (loader, btn) {
        $("#" + loader).show();
        $("#" + btn).hide();
    }
    hideLoader = function (loader, btn) {
        $("#" + loader).hide();
        $("#" + btn).show();
    }
    getProxyUsersList = function () {

        $("#errProxy").html("");
        $("#noRecords").hide();
        $(".dataTables_paginate").hide();
        showLoader('proxy_loader', 'proxyTable');
        $.ajax({
            url: url + 'proxy',
            dataType: 'json',
            data: {key: 'getProxyAssignmentList'},
            type: 'GET',
            cache: false,
            success: function (response) {

                hideLoader('proxy_loader', 'proxyTable');
                //console.log(response.status);
                if (response.status == 200) {
                    //console.log("response here");
                    responsep = response.proxy_list;
                    if (typeof table !== 'undefined') {
                        $('#proxyTable').DataTable().clear();
                    }
                    var table = $('#proxyTable').DataTable({
                        "bPaginate": true,
                        "bLengthChange": false,
                        "iDisplayLength": 5,
                        "bFilter": false,
                        "bInfo": false,
                        "destroy": true,
                        "bAutoWidth": false,
                        "order": [[2, "asc"]],
                        oLanguage: {
                            sProcessing: "waiting"
                        },
                        "bProcessing": true,
                        "data": responsep, // <-- your array of objects
                        "fnDrawCallback": function () {
                            $('#proxyTable th').eq(0).removeClass("sorting_asc");
                            $("#proxyTable").addClass("borders borderBottomRadius");
                            $("#proxyTable i").addClass("borders");
                            $("#proxyTable").removeClass("no-footer");
                            $("#proxyTable th").addClass("secondaryBgColor contentTextIcons font-style4 proxyText");
                            $("#proxyTable thead th").addClass("borderBottom");
                            $("#proxyTable td").addClass("borderBottomThin contentBgColor");
                            $("#proxyTable td").removeClass("sorting_1");
                            $("#proxyTable td").addClass("contentTextIcons");
                        },
                        "fnHeaderCallback": function (nHead, aasData, iStart, iEnd, aiDisplay) {
                            if (aiDisplay.length > 5) {
                                $(".dataTables_paginate").show();
                            } else {
                                $(".dataTables_paginate").hide();
                            }
                        },
                        "aoColumns"
                                : [
                                    {mRender: function (response, type, row) {
                                            return '<i class="fa fa-trash-o secondaryTextIcons "  style="cursor:pointer" onclick="createModal(' + row.proxyUserId + ')"></i><i class="material-icons secondaryTextIcons "  style="cursor:pointer" onclick="createModal(' + row.proxyUserId + ')">&#xE872;</i>'
                                        }, "bSortable": false, "width": "1%"
                                    },
                                    {"mData": "proxyLoginName", "title": "Proxy " + UserIdentity, "sClass": "left", "bSortable": true}, // <-- which values to use inside object
                                    {"mData": "proxyDisplayName", "title": "Proxy's name", "sClass": "left", "bSortable": true}
                                ]
                    });


                }
                else if (response.status == 402) {
                    window.location.href = '/auth/logout';
                }
                else if (response.status == 401) {
                    appendErrorMessage(response.status, response.status);
                }
                else if (response.status == 404) {
                    // no records found
                    //$("#noRecords").show();
                    $('#proxyTable').hide();
                }
            },
        });

    }

    /* search filter code */
    $('.serachVal').live('keydown', searchRequest(function () {
        var containerObj = $(this).parent();
        var graphType = $(this).attr('graphType');
        $('#' + graphType + '_error').html('');
        validateSearchFilter(containerObj, graphType);
    }));

    function searchRequest(f, delay) {
        var timer = null;
        return function () {
            var context = this, args = arguments;
            clearTimeout(timer);
            timer = window.setTimeout(function () {
                f.apply(context, args);
            }, delay || 2000);
        };
    }
    // Export All Feature for Drill
    $('#drillExportBtn').live('click', function () {
        var exportType = $(this).attr('exportType');
        //console.log(exportType);
        drillTableDownload(exportType);

    });

    $('.clearSearchBtn').live('click', function () {
        var graphType = $(this).attr('graphType');
        var containerObj = $(this).parent();
        $(containerObj).find('#' + graphType + '_searchText').val('');
        if ($.isEmptyObject(window[graphType + '_drillFilter']) === false) {
            $('#' + graphType + '_error').html('');
            var completionStatus = $('#' + graphType + '_completionStatus').val();
            var totalRecords = $('#' + graphType + '_totalRecords').val();
            var title = $('#' + graphType + '_title').val();
            window[graphType + '_drillFilter'] = {};
            $(containerObj).find('#' + graphType + '_columnName').val(0);
            drillTable(completionStatus, title, graphType, true, totalRecords);
        }
        $('#' + graphType + '_error').html('');
    });

});

// END CALL===================================================================================

function createModal(id) {
    var deleteText = "Are you sure you want to delete this proxy assignment?";
    $("#messageModalProxy").show();
    $("#messageModalProxy").html('<p class="messageModalText contentTextIcons font-style4">' + deleteText + '</p>');
    $("#messageModalProxy").dialog({
        resizable: false,
        height: 150,
        width: 300,
        closeOnEscape: false,
        modal: true,
        open: function (event, ui) {

            $("#messageModalProxy").prev().hide();
            $("#messageModalProxy").prev().prev().hide();
        },
        buttons: {
            "OK": (function () {
                $("#messageModalProxy").dialog("close");
                deleteRow(id);
            }).bind(this),
            "Cancel": (function () {
                $("#messageModalProxy").dialog("close");
            }).bind(this)
        }
    });
}
function deleteRow(id) {
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
    var jsonData = {proxyUserId: id, key: 'deleteProxyAssignment'}
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
            hideLoader('proxy_loader', 'proxyTable');

            if (response.status == 200) {
                $("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' + CDN_IMG_URL + '/images/backgrounds/done.jpg"  width=50 height=50/></span>Deleted</p>');
                setTimeout(function () {
                    $("#messageModal").dialog("close");
                    $(".dataTables_paginate").hide();
                    showLoader('proxy_loader', 'proxyTable');
                    getProxyUsersList();
                }, 1000);
            }
            else if (response.status == 402) {
                window.location.href = '/auth/logout';
            }
            else if (response.status == 401) {
                appendErrorMessage(response.status, response.error_msg);
            }
            else {
                getProxyUsersList();
            }
        }
    });
    //}
}
function setDashboardDetails() {
    // data: {siteId: siteId, userId: userId, key: 'dashboardStatus'}
    $.ajax({
        url: url + 'dashboard',
        dataType: 'json',
        cache: false,
        data: {key: 'dashboardStatus'},
        type: 'GET',
        success: function (response) {

            if (response.error_code == 200) {
                $("#dashboardId").val(response.dashboardID);
                setdashboardId();
                startCall();
            }
            else if (response.error_code == 402) {
                window.location.href = '/auth/logout';
            }
            else if (response.error_code == 401) {
                $("#dashboardId").val("");
                setdashboardId();
                appendErrorMessage(response.error_code, response.error_msg);
            }
            else {
                $("#dashboardId").val("");
                setdashboardId();
                $("#dashMsg").show();
                $("#dashFilterGroup").hide();
                $("#dashGraph").hide();
                $("#loader").hide();
            }
        }
    });
}

function setdashboardId() {
    dashBoardId = $("#dashboardId").val();
}
function getGroupbyValue() {

    return $("#groupBy").val();
}
function startCall() {
    hideLoaderDash();
    hideGraph();
    callChartConfig(); // contains chart and drill table status
}
// calling chart config api
function callChartConfig() {

    // data: {siteId: siteId, key: 'dashboardChartStatus'}
    $.ajax({
        url: url + 'dashboard',
        dataType: 'json',
        data: {key: 'dashboardChartStatus'},
        type: 'GET',
        cache: false,
        success: function (response) {

            if (response.error_code == 200) {
                response = response.dataObject;
                getChartConfig(response);
                //callGroupByApi(); // call group by api
                getDashboardViewSettings();
            }
            else if (response.error_code == 402) {
                window.location.href = '/auth/logout';
            }
            else if (response.error_code == 401) {
                appendErrorMessage(response.error_code, response.error_msg);

            }
            else {
                //console.log(response);
                //customErrorMessage(response.error_code);
                $("#dashMsg").show();
                $("#dashFilterGroup").hide();
                $("#dashGraph").hide();
                $("#loader").hide();
            }
        }
    });
}
function getChartConfig(response) {

    showCourseCompletionStatusWithGroupByChart = response.showCourseCompletionStatusWithGroupByChart;
    showIncompletePastDue = response.showIncompletePastDue;
    showUserAssignmentStatusChart = response.showUserAssignmentStatusChart;
    showCourseCompletionStatusChart = response.showCourseCompletionStatusChart;
    showDrillDownReport = response.showDrillDownReport;
    showDrillDownUserSummaryDetailReport = response.showDrillDownUserSummaryDetailReport;
}
// groupBy api
function callGroupByApi() {
    var response = [];
    var cnt = 0;
    showLoaderDash();
    $("#groupBy").html("");

    $.ajax({
        url: url + 'dashboard',
        dataType: 'json',
        cache: false,
        data: {dashBoardId: dashBoardId, key: 'dashboardGroupBy'},
        type: 'GET',
        success: function (response) {

            if (response.error_code == 200) {

                response = response.dashboardGroupBy;
                $.each(response, function (key, val) {
                    response[key]['columnName'] = val.columnName;
                    response[key]['columnDisplayName'] = val.columnDisplayName;
                    cnt++;
                });
                //console.log(cnt);
                $("#groupBy").append("<option value='Please Select'> Please select </option>");
                for (var i = 1; i <= cnt; i++) { // did it for maintining the sort order in drop down for IE 8
                    $("#groupBy").append("<option title='" + response[i]['columnDisplayName'] + "' value=" + response[i]['columnName'] + ">" + response[i]['columnDisplayName'] + "</option>");
                }
                $("#dashFilterGroup").show();
                callGraphApi(); // once the group api is populated then try topopulate graph
            }
            else if (response.error_code == 402) {
                window.location.href = '/auth/logout';
            }
            else if (response.error_code == 401) {
                appendErrorMessage(response.error_code, response.error_msg);

            }
            else {
                //customErrorMessage(response.error_code);
                $("#dashMsg").show();
                $("#dashFilterGroup").hide();
                $("#dashGraph").hide();
                $("#loader").hide();
            }
        }
    });
}
// function to populate dashboard  group by/dashboard view as/ proxy permission
function getDashboardViewSettings() {
    var response = [];
    var responseDashboardViewAs = []
    var cnt = 0;
    var sel = "";
    showLoaderDash();
    $("#groupBy").html("");

    $.ajax({
        url: url + 'dashboard',
        dataType: 'json',
        cache: false,
        data: {dashBoardId: dashBoardId, key: 'dashboardViewSettings'},
        type: 'GET',
        success: function (result) {

            if (result.error_code == 200) {

                response = result.dashboardGroupBy;
                $.each(response, function (key, val) {
                    response[key]['columnName'] = val.columnName;
                    response[key]['columnDisplayName'] = val.columnDisplayName;
                    cnt++;
                });
                //console.log(cnt);
                $("#groupBy").append("<option value='Please Select'> Please select </option>");
                for (var i = 1; i <= cnt; i++) { // did it for maintining the sort order in drop down for IE 8
                    $("#groupBy").append("<option title='" + response[i]['columnDisplayName'] + "' value=" + response[i]['columnName'] + ">" + response[i]['columnDisplayName'] + "</option>");
                }
                cnt = 0;
                response = result.dashboardViewAs;
                $.each(response, function (key, val) {
                    response[key]['columnName'] = val.columnName;
                    response[key]['columnDisplayName'] = val.columnDisplayName;
                    cnt++;
                });
                for (var i = 1; i <= cnt; i++) { // did it for maintining the sort order in drop down for IE 8
                    sel = "";
                    if (loggedInUserId == response[i]['columnName']) {
                        sel = 'selected=selected';
                    }
                    $("#viewDashboardAs").append("<option  " + sel + " title='" + response[i]['columnDisplayName'] + "' value=" + response[i]['columnName'] + ">" + response[i]['columnDisplayName'] + "</option>");
                }
                if (flag_to_start == 1)
                    resizeSelect(); // only for normal users
                if (cnt == 1) {
                    $('#viewDashboardAs').attr('disabled', true);
                }
                $("#dashFilterGroup").show();
                callGraphApi(); // once the group api is populated then try topopulate graph
            }
            else if (result.error_code == 402) {
                window.location.href = '/auth/logout';
            }
            else if (result.error_code == 401) {
                appendErrorMessage(result.error_code, result.error_msg);
            }
            else {
                //customErrorMessage(response.error_code);
                $("#dashMsg").show();
                $("#dashFilterGroup").hide();
                $("#dashGraph").hide();
                $("#loader").hide();
            }
        }
    });
}
//graph api
function callGraphApi() {
    var isSelected = getGroupbyValue();
    if (isSelected != "Please Select" && isAllChartSelected() != 0) { // default not to call any apis

        $("#chartone").show();
        $("#charttwo").show();
        $("#chartthree").show();
        $("#chartfour").show();
        if (showCourseCompletionStatusWithGroupByChart != 1)
            $("#chartone").hide();
        if (showIncompletePastDue != 1)
            $("#charttwo").hide();
        if (showUserAssignmentStatusChart != 1)
            $("#chartthree").hide();
        if (showCourseCompletionStatusChart != 1)
            $("#chartfour").hide();

        if (showCourseCompletionStatusWithGroupByChart == 1) {
            $("#loaderone").show();
            $("#exportOne").hide();
            completionStatusWithGroupByChart(); // First chart (Bar chart)
        }
        if (showIncompletePastDue == 1) {
            $("#loadertwo").show();
            $("#exportTwo").hide();
            incompletePastDue();
        }
        if (showUserAssignmentStatusChart == 1) {
            $("#loaderthree").show();
            $("#exportThree").hide();
            userAssignmentStatus();
        }

        if (showCourseCompletionStatusChart == 1) {
            $("#loaderfour").show();
            $("#exportFour").hide();
            courseCompletionStatusChart(); // Fourth chart (Donut Chart)
        }

    } else {

        $("#loader").hide();
    }

}
function setDashDetailsForNormalUsers(dashid) {
    $("#dashboardId").val(dashid);
    setdashboardId();
    startCall();
}
function getDashboardStatus() {
    //data: {siteId: siteId, userId: userId, key: 'dashboardStatus'}
    $.ajax({
        url: url + 'dashboard',
        dataType: 'json',
        cache: false,
        data: {key: 'dashboardStatus'},
        type: 'GET',
        success: function (response) {
            if (response.error_code == 200) {
                if (response.active == 1) {
                    //setDashboardDetails(); // 0 not to make ajax 
                    setDashDetailsForNormalUsers(response.dashboardID);
                } else {
                    //dashboard not configured
                    $("#dashMsg").show();
                    $("#dashFilterGroup").hide();
                    $("#dashGraph").hide();
                    $("#loader").hide();
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

function addFilterButton() {
    return '<input type="button" value="Add another filter" class="addFilterbutton">';
}

function removeFilterButton() {
    return '<input type="button" value="Remove filter" class="removeFilter"/>';
}
/**
 * Function to validate search filter form for drilltable
 * 
 * @param {type} containerObj
 * @param {type} graphType
 * @returns {undefined}
 */
function validateSearchFilter(containerObj, graphType) {
    var columns = new Array();
    var columnValues = new Array();
    var errorCount = 0;
    var searchVal = "";

    containerObj.find('select').each(function () {
        selectedColumn = $(this).val()
        if ($(this).val() == 0 || $.trim($(this).next().val()) == '') {
            $('#' + graphType + '_error').html('<span class="error">Please provide values in order to continue.</span>');
            errorCount++;
        } else {
            columns.push($(this).val());
            if (selectedColumn == "COMPLETION_DATE" || selectedColumn == "ASSIGNMENT_DATE" || selectedColumn == "DUE_DATE" || selectedColumn == "START_DATE") {
                columnValues.push($.trim($(this).next().val().replace(/\//g, "-").toUpperCase()));
            } else {
                columnValues.push($.trim($(this).next().val().toUpperCase()));
            }
        }
    });

    if (errorCount === 0) {

        var completionStatus = $('#' + graphType + '_completionStatus').val();
        var title = $('#' + graphType + '_title').val();
        var totalRecords = $('#' + graphType + '_totalRecords').val();
        window[graphType + '_drillFilter'] = {filteredColumnValue: columnValues.join('$$$'), filteredColumn: columns.join('$$$')};
        drillTable(completionStatus, title, graphType, true, totalRecords);
    }
}


// call graphi api on select box drop down change
$("#groupBy").live('change', function () {

    showLoaderDash();
    $('.searchBox').remove();
    hideGraph();
    callGraphApi();
    refreshData();
});
// call graphi api on select box drop down change(View Dashboard As)
$("#viewDashboardAs").live('change', function () {

    showLoaderDash();
    $('.searchBox').remove();
    hideGraph();
    callGraphApi();
    refreshData();
});

//////////////////////***FIRST GRAPH***/////////////////////////////////////////
function completionStatusWithGroupByChart() {

    //chart1
    var groupBy = getGroupbyValue();
    //dashBoardId=21&managerId=12212358&groupByColumnName=Division&hasDashBoardConfig=0&siteId=5851&key=courseCompletionStatusGroupBy
    //correct

    //data: {dashBoardId: dashBoardId, managerId: managerId, groupByColumnName: groupBy, hasDashBoardConfig: hasDashBoardConfig, siteId: siteId, key: 'courseCompletionStatusGroupBy'},
    var managerId = getSelectedUserId();
    var chart1Key = url + 'dashboard?dashBoardId=' + dashBoardId + '&managerId=' + managerId + '&groupByColumnName=' + groupBy + '&hasDashBoardConfig=' + hasDashBoardConfig + '&siteId=' + siteId + 'key=courseCompletionStatusGroupBy';
    $.ajax({
        url: url + 'dashboard',
        dataType: 'json',
        cache: false,
        data: {dashBoardId: dashBoardId, managerId: managerId, groupByColumnName: groupBy, hasDashBoardConfig: hasDashBoardConfig, key: 'courseCompletionStatusGroupBy'},
        type: 'GET',
        success: function (response) {

            if (response.error_code == 200) {
                drawGraph(response, 1);
            }
            else if (response.error_code == 402) {
                window.location.href = '/auth/logout';
            }
            else if (response.error_code == 401) {
                appendErrorMessage(response.error_code, response.error_msg);
            }
            else {
                //console.log(response);
                drawGraph(response, 1);
            }
        }
    });
}
///////////////////////***SECOND GRAPH***///////////////////////////////////////
function incompletePastDue() {
    //To Display Pie Chart - Second Chart
    var groupBy = getGroupbyValue();
    //data: {dashBoardId: dashBoardId, userId: userId, groupByColumnName: groupBy, hasDashBoardConfig: hasDashBoardConfig, key: 'incompletePastDue'}
    var userId = getSelectedUserId();
    var chart2Key = url + 'dashboard?dashBoardId=' + dashBoardId + '&userId=' + userId + '&groupByColumnName=' + groupBy + '&hasDashBoardConfig=' + hasDashBoardConfig + '&key=incompletePastDue';
    $.ajax({
        url: url + 'dashboard',
        dataType: 'json',
        data: {dashBoardId: dashBoardId, userId: userId, groupByColumnName: groupBy, hasDashBoardConfig: hasDashBoardConfig, key: 'incompletePastDue'},
        type: 'GET',
        cache: false,
        success: function (response) {

            if (response.error_code == 200) {
                drawGraph(response, 2);
            }
            else if (response.error_code == 402) {
                window.location.href = '/auth/logout';
            }
            else if (response.error_code == 401) {
                appendErrorMessage(response.error_code, response.error_msg);
            }
            else {
                //console.log(response);
                drawGraph(response, 2);
            }
        }
    });
}
///////////////////////***THIRD GRAPH***////////////////////////////////////////
function userAssignmentStatus() {

    //To Display Bar Chart - Third Chart
    //data: {dashBoardId: dashBoardId, userId: userId, groupByColumnName: groupBy, hasDashBoardConfig: hasDashBoardConfig, key: 'userAssignmentStatus'},

    var groupBy = getGroupbyValue();
    var userId = getSelectedUserId();
    var chart3Key = url + 'dashboard?dashBoardId=' + dashBoardId + '&userId=' + userId + '&groupByColumnName=' + groupBy + '&hasDashBoardConfig=' + hasDashBoardConfig + '&key=userAssignmentStatus';
    $.ajax({
        url: url + 'dashboard',
        dataType: 'json',
        data: {dashBoardId: dashBoardId, userId: userId, groupByColumnName: groupBy, hasDashBoardConfig: hasDashBoardConfig, key: 'userAssignmentStatus'},
        type: 'GET',
        cache: false,
        success: function (response) {

            if (response.error_code == 200) {
                drawGraph(response, 3);
            }
            else if (response.error_code == 402) {
                window.location.href = '/auth/logout';
            }
            else if (response.error_code == 401) {
                appendErrorMessage(response.error_code, response.error_msg);
            }
            else {
                //console.log(response);
                drawGraph(response, 3);
            }
        }
    });
}
///////////////////////***FOURTH GRAPH***///////////////////////////////////////
function courseCompletionStatusChart() {
    //char 4 donut
    //dashBoardId=21&managerId=14452130&hasDashBoardConfig=0&siteId=5851&key=courseCompletionStatus
    //data: {dashBoardId: dashBoardId, managerId: managerId, hasDashBoardConfig: hasDashBoardConfig, siteId: siteId, key: 'courseCompletionStatus'},

    var groupBy = getGroupbyValue();
    var managerId = getSelectedUserId();
    var chart4Key = url + 'dashboard?' + dashBoardId + '&managerId=' + managerId + '&hasDashBoardConfig=' + hasDashBoardConfig + '&siteId=' + siteId + '&key=courseCompletionStatus';
    $.ajax({
        url: url + 'dashboard',
        dataType: 'json',
        cache: false,
        data: {dashBoardId: dashBoardId, managerId: managerId, hasDashBoardConfig: hasDashBoardConfig, key: 'courseCompletionStatus'},
        type: 'GET',
        success: function (response) {

            if (response.error_code == 200) {
                drawGraph(response, 4);
            }
            else if (response.error_code == 402) {
                window.location.href = '/auth/logout';
            }
            else if (response.error_code == 401) {
                appendErrorMessage(response.error_code, response.error_msg);
            }
            else {
                //console.log(response);
                drawGraph(response, 4);
            }
        }
    });
}

/**
 * Add subcaption to each chart
 */
function addSubCaptionToChart(chartObject) {
    var groupByText = $("#groupBy :selected").text();
    if (chartObject)
        chartObject.chart.subcaption = groupByText;
}
function checkCharObj(chartObject, errorcode, graphType) {
    var error = 0;
    if (errorcode == 200) {

        switch (graphType) {
            case 1:
                if (chartObject.bar2chart.dataset.length != 0)
                    error++
                break;
            case 2:
                if (chartObject.pieChart.data.length != 0)
                    error++;
                break;
            case 3:
                if (chartObject.barGraph.dataset.length != 0)
                    error++;
                break;
            case 4:
                if (chartObject.donutchart.data.length != 0)
                    error++;
                break;
        }

        if (error == 0)
            return '0';
        else
            return '1';

    } else {

        return '0';
    }
}
/** Error function to display no data available message  **/

function displayNoDataMsg(header, subheader, containerId) {

    var htmlTag = '<div class="error_container"><div>&nbsp;</div><div class="error_caption">' + header + '<br><span class="error_sub_caption">' + subheader + '</span></div><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><div class="error_chart_msg">No Data To Display</div></div>';


    $("#" + containerId).html(htmlTag);

}
// Drawing fusion chart graphs
function drawGraph(jsonGraphData, todraw) {
    hideLoaderDash();
    showGraph();

    var groupByText = $("#groupBy :selected").text();
    var error_code = jsonGraphData.error_code;


    FusionCharts.ready(function () {
        if (todraw == 3) {
            if (checkCharObj(jsonGraphData, error_code, todraw) == 1) {
                BarChartObj = new FusionCharts({
                    type: "ScrollStackedColumn2D",
                    renderAt: "chartContainer",
                    loadMessage: "Loading User Completion Status Chart...",
                    width: "760",
                    height: "400"
                });
                addSubCaptionToChart(jsonGraphData.barGraph);
                jsonDataChart3 = jsonGraphData.barGraph;
                BarChartObj.setJSONData(jsonGraphData.barGraph);
                BarChartObj.render("chartContainer");
                exportFunction('dl-btnchart3', 'dl-typechart3', BarChartObj, 'exportThree', thirdChartTitle)
                changeChartType("sliderHeightThird", 'chart-type2', 'chartContainer', jsonGraphData.barGraph, "Loading User Completion Status Chart...", todraw, "ScrollStackedColumn2D");

            } else {
                displayNoDataMsg("User Completion Status", groupByText, "chartContainer");
                $("#exportThree").hide();
            }
            $("#loaderthree").hide();
            $("#radioThree").attr('checked', true);

        }
        if (todraw == 2) {
            if (checkCharObj(jsonGraphData, error_code, todraw) == 1) {
                PiChartObj = new FusionCharts({
                    type: "pie3d",
                    renderAt: "PichartContainer",
                    loadMessage: "Loading Incomplete and Past Due Courses Chart...",
                    width: "760",
                    height: "400"
                });
                addSubCaptionToChart(jsonGraphData.pieChart);
                jsonDataChart2 = jsonGraphData.pieChart;
                PiChartObj.setJSONData(jsonGraphData.pieChart);
                PiChartObj.render("PichartContainer");
                exportFunction('dl-btnchart2', 'dl-typechart2', PiChartObj, 'exportTwo', secondChartTitle)
                changeChartType("sliderHeightSecond", 'chart-type1', 'PichartContainer', jsonGraphData.pieChart, "Loading Incomplete and Past Due Courses Chart...", todraw, "pie3d");

            } else {
                displayNoDataMsg("Incomplete and Past Due Courses", groupByText, "PichartContainer");
                $("#exportTwo").hide();


            }
            $("#loadertwo").hide();
            $("#radioTwo").attr('checked', true);
        }
        if (todraw == 4) {

            if (checkCharObj(jsonGraphData, error_code, todraw) == 1) {
                donutChartObj = new FusionCharts({
                    type: "doughnut2d",
                    renderAt: "donutchartContainer",
                    LoadMessage: "Loading Course Status Details Chart...",
                    width: "760",
                    height: "400"
                });
                addSubCaptionToChart(jsonGraphData.donutchart);
                jsonDataChart4 = jsonGraphData.donutchart;
                donutChartObj.setJSONData(jsonGraphData.donutchart);
                donutChartObj.render("donutchartContainer");
                exportFunction('dl-btnchart4', 'dl-typechart4', donutChartObj, 'exportFour', fourthChartTitle)
                changeChartType("sliderHeightFourth", 'chart-type3', 'donutchartContainer', jsonGraphData.donutchart, "Loading Course Status Details Chart...", todraw, "doughnut2d");

            } else {
                displayNoDataMsg("Course Status Details", groupByText, "donutchartContainer");
                $("#exportFour").hide();

            }
            $("#loaderfour").hide();
            $("#radioFour").attr('checked', true);
        }
        if (todraw == 1) {
            if (checkCharObj(jsonGraphData, error_code, todraw) == 1) {

                BarChart2Obj = new FusionCharts({
                    type: "scrollstackedcolumn2d",
                    renderAt: "Pichart2Container",
                    loadMessage: "Loading Course Completion Status Chart...",
                    width: "760",
                    height: "400"
                });
                addSubCaptionToChart(jsonGraphData.bar2chart);
                jsonDataChart1 = jsonGraphData.bar2chart;
                BarChart2Obj.setJSONData(jsonGraphData.bar2chart);
                BarChart2Obj.render("Pichart2Container");
                $("#radioOne").attr('checked', true);
                exportFunction('dl-btnchart1', 'dl-typechart1', BarChart2Obj, 'exportOne', firstChartTitle);
                changeChartType('sliderHeight', 'chart-type', 'Pichart2Container', jsonGraphData.bar2chart, "Loading Course Completion Status Chart...", todraw, 'scrollstackedcolumn2d');
            } else {
                displayNoDataMsg("Course Completion Status", groupByText, "Pichart2Container");
                $("#exportOne").hide();

            }
            $("#loaderone").hide();
        }

    });
}

function hideLoaderDash() {

    $("#loader").hide();
}
function showLoaderDash() {

    $("#loader").show();
}
function showGraph() {

    $("#dashGraph").show();
}
function hideGraph() {

    $("#dashGraph").hide();
}

/**
 * Funbction to prepare template for dataTable
 */
function prepareDataTableTemplate(tableId) {
    var templateStr = '<table id="' + tableId + '" class="display" cellspacing="0" width="100%" style="float: inherit !important;">'
            + '<thead></thead><tbody></tbody></table>';
    return $('#' + tableId).length == 0 ? templateStr : '';
}

/**
 * Comment
 */
function getPicker(graphType) {

    var optionSelected = $("#" + graphType + "_columnName").find("option:selected");
    var selectedColumn = optionSelected.val();
    $("#" + graphType + "_searchText").attr("readonly", false);
    $("#" + graphType + "_searchText").val("");
    $("#" + graphType + "_searchText").datepicker("destroy");
    // keys set for following columns ASSIGNMENT_DATE', 'DUE_DATE', 'START_DATE', 'COMPLETION_DATE'
    if (selectedColumn == "COMPLETION_DATE" || selectedColumn == "ASSIGNMENT_DATE" || selectedColumn == "DUE_DATE" || selectedColumn == "START_DATE") {
        $("#" + graphType + "_searchText").datepicker({
            dateFormat: "mm/dd/yy",
            onClose: function () {
                var containerObj = $(this).parent();
                var graphType = $(this).attr('graphType');
                $('#' + graphType + '_error').html('');
                if ($('#' + graphType + '_searchText').val() != "")
                    validateSearchFilter(containerObj, graphType);
            }
        });
    }

}
function prepareSearchBox(graphType) {
    //$('#dropDownId :selected').text();
    return  '<div style="width:620px;text-align:left !important;"><select onchange="getPicker(\'' + graphType + '\');" id="' + graphType + '_columnName"></select>'
            + '<input type="text" graphType="' + graphType + '" class="serachVal" id="' + graphType + '_searchText" placeholder="search" ><img id="' + graphType + '_clearSearchBtn" value="Clear" class="clearSearchBtn" graphType="' + graphType + '" style="padding-left: 4px;vertical-align: middle;" src="/images/icons/dashboard-cross-image.png"/>'
            + '</div><div style="float"left;"><select id="' + graphType + '_tbldownload"  class="exportSelect"><option selected="selected" value="csv">CSV</option><option  value="excel">Excel</option> </select> &nbsp;<button type="button" exportType="' + graphType + '" id="drillExportBtn" class="exportBtn" style="cursor:pointer;font-size:18px;"><i class="fa fa-download"></i></button></div>';

}

//Draw table from json data

function drillTable(completion_status, title, graphType, isSearch, value) {

    /*dashBoardId=21&siteId=5851&managerId=12212358&groupByColumnName=CostCenter&groupByColumnValue=AP&completionStatus=pastDue
     &key=courseAssignmentDetailForPastDue pie chart
     dashBoardId=21&siteId=5851&managerId=12272056&
     groupByColumnName=HZip&groupByColumnValue=Job%20Family&completionStatus=completeOnTime&key=courseAssignmentDetail donut/chart2
     */
    var title = replaceSpecialCharacters(title);
    if (graphType == "pie")
        $("#jsonTablePie").html("");

    var groupByColumnName = getGroupbyValue();
    var managerId = getSelectedUserId();
    var showDrillTable = 0;
    var emptyTable = {};
    var data;
    var chartId;
    var finename;
    // data = {dashBoardId: dashBoardId, siteId: siteId, managerId: managerId, groupByColumnName: groupByColumnName, groupByColumnValue: title, completionStatus: completion_status, hasDashBoardConfig: hasDashBoardConfig, key: 'courseAssignmentDetailForPastDue'};

    switch (graphType) {
        case 'pie':
            showDrillTable = showDrillDownReport;
            if (showDrillTable == 1) {
                var tbl_id = "jsonTablePie";
                showMinus(graphType);
                $("#pieToggle").slideDown();
                $("#pieDetail .dataTables_wrapper").remove();
                $("#pieDetail .dtContainer").append(prepareDataTableTemplate(tbl_id)).slideDown();
                chartId = 'pieDetail';
                finename = secondChartTitle;
                $("#pie_loader").show();
                $("#pieDetail").slideDown();
                data = {dashBoardId: dashBoardId, managerId: managerId, groupByColumnName: groupByColumnName, groupByColumnValue: title, completionStatus: completion_status, hasDashBoardConfig: hasDashBoardConfig, key: 'courseAssignmentDetailForPastDue', isExport: '0'};

            }
            break;
        case 'chart2':
            showDrillTable = showDrillDownReport;
            if (showDrillTable == 1) {
                var tbl_id = "jsonTableChart2";
                showMinus(graphType);
                $("#chart2Toggle").slideDown();
                $("#chart2_loader").show();
                $("#chart2Detail .dataTables_wrapper").remove();
                $("#chart2Detail .dtContainer").append(prepareDataTableTemplate(tbl_id)).slideDown();
                chartId = 'chart2Detail';
                finename = firstChartTitle;
                $("#chart2Detail").slideDown();
                data = {dashBoardId: dashBoardId, managerId: managerId, groupByColumnName: groupByColumnName, groupByColumnValue: title, completionStatus: completion_status, key: 'courseAssignmentDetail', hasDashBoardConfig: hasDashBoardConfig, isExport: '0'};
            }
            break;
        case 'chart1':
            showDrillTable = showDrillDownUserSummaryDetailReport;
            if (showDrillTable == 1) {
                var tbl_id = "jsonTableChart1";
                showMinus(graphType);
                $("#chart1Toggle").slideDown();
                $("#chart1Detail .dataTables_wrapper").remove();
                $("#chart1Detail .dtContainer").append(prepareDataTableTemplate(tbl_id)).slideDown();
                chartId = 'chart1Detail';
                finename = secondChartTitle;
                $("#chart1_loader").show();
                $("#chart1Detail").slideDown();
                data = {dashBoardId: dashBoardId, managerId: managerId, groupByColumnName: groupByColumnName, groupByColumnValue: title, completionStatus: completion_status, hasDashBoardConfig: hasDashBoardConfig, key: 'userAssignmentDetail', isExport: '0'};
            }
            break;
        case 'donut':
            showDrillTable = showDrillDownReport;
            if (showDrillTable == 1) {
                var tbl_id = "jsonTableDonut";
                showMinus(graphType);
                $("#donutToggle").slideDown();
                $("#donutToggle .dataTables_wrapper").remove();
                $("#donutDetail .dtContainer").append(prepareDataTableTemplate(tbl_id)).slideDown();
                chartId = 'donutDetail';
                finename = fourthChartTitle;
                $("#donut_loader").show();
                $("#donutDetail").slideDown();
                data = {dashBoardId: dashBoardId, managerId: managerId, groupByColumnName: 'isNullValue', groupByColumnValue: 'isNullValue', completionStatus: completion_status, hasDashBoardConfig: hasDashBoardConfig, key: 'courseAssignmentDetail', isExport: '0'};
            }
            break;
    }

    if (typeof isSearch != undefined && isSearch === true) {
        $.extend(data, window[graphType + '_drillFilter']);
    }
    else {
        $('#' + graphType + '_columnName').html('');
        $('#' + graphType + '_searchText').val('');
    }

    $('#' + graphType + '_error').html('');
    if (showDrillTable == 1) {
        $('#' + tbl_id).html('');
        $.ajax({
            url: url + 'dashboard',
            dataType: 'json',
            data: data,
            type: 'GET',
            success: function (response) {
                if (response.error_code == 200) {
                    if ($('#' + graphType + '_serachBox').length == 0) {
                        $("#" + chartId + ' .dtContainer').prepend('<div id="' + graphType + '_error"></div><div id="' + graphType + '_serachBox" class="searchBox">'
                                + '<input type="hidden" id="' + graphType + '_completionStatus" value="' + completion_status + '"/>'
                                + '<input type="hidden" id="' + graphType + '_title" value="' + title + '"/>'
                                + '<input type="hidden" id="' + graphType + '_totalRecords" value="' + value + '"/>'
                                + prepareSearchBox(graphType) + '</div>');
                    } else {
                        $('#' + graphType + '_completionStatus').val(completion_status);
                        $('#' + graphType + '_title').val(title);
                        $('#' + graphType + '_totalRecords').val(value);
                    }
                    drawTable(response.table, tbl_id, graphType, value, finename);
                    /*if ($('#' + graphType+'_searchBtn').length == 0) {
                     $('#' + graphType +'_serachBox').after('<div style="clear:both;margin-left:5px"><input type="button" id="'+graphType+'_searchBtn" value="Search" class="searchBtn" graphType="'+graphType+'"/></div>');
                     }*/
                    showHideGraphLoader(graphType);
                }
                else if (response.error_code == 402) {
                    window.location.href = '/auth/logout';
                }
                else if (response.error_code == 401) {
                    appendErrorMessage(response.error_code, response.error_msg);
                }
                else {
                    drawTable(emptyTable, tbl_id, graphType);
                    showHideGraphLoader(graphType);
                }

            }
        });
    }

}

function drawTable(data, tableId, graphType, value, finename) {

    var headerStr;
    var tableContent = '';
    var infoMsg = "";

    var tableObjThead = $("#" + tableId + " > thead");
    var tableObjTbody = $("#" + tableId + " > tbody");
    //console.log(graphType);

    tableObjThead.remove();
    tableObjTbody.remove();
    $("#" + tableId).html('');
    var counter = 0;
    if ($.isEmptyObject(data) == false && $.isEmptyObject(data.header) == false && $.isEmptyObject(data.data) == false) {
        if ($("#" + tableId + ' > thead').length == 0)
            $("#" + tableId).append("<thead></thead><tbody></tbody>");


        var headerStr = '';
        var selectBoxOptions = '<option value="0">Select</option>';
        $.each(data.header, function (key, header) {
            headerStr += '<th>' + header.displayColumnName + '</th>';
            selectBoxOptions += '<option value="' + header.columnName + '">' + header.displayColumnName + '</option>';
        });

        $.each(data.data, function (key, dataObj) {
            tableContent += '<tr>';
            $.each(dataObj, function (index, val) {

                tableContent += '<td>' + val + '</td>';

            });
            tableContent += '</tr>';
            counter++;
        });

        $("#" + tableId + ' thead').html('<tr>' + headerStr + '</tr>');
        $("#" + tableId + ' tbody').html(tableContent);
        if ($('#' + graphType + '_serachBox select').html() == '') {
            //$('#' + graphType +'_serachBox select').html(selectBoxOptions);
            $('#' + graphType + '_columnName').html(selectBoxOptions);
        }

        if (window[tableId + '_oTable'] != null)
            window[tableId + '_oTable'].destroy();
        if ($("#" + graphType + "_searchText").val() != "") {
            var dtCnt = parseInt($("#" + tableId + ' tbody tr').length);
            if (dtCnt >= 1000) {
                infoMsg = "Showing _TOTAL_ records out of " + convertToDigits(value) + " results.";
            } else {
                infoMsg = "Showing _TOTAL_ records.";
            }
        } else {
            infoMsg = "Showing _START_-_END_ of _TOTAL_ results out of " + convertToDigits(value) + " records.";
        }
        window[tableId + '_oTable'] = $("#" + tableId).DataTable({
            scrollY: (counter > 10) ? "339" : false,
            scrollX: true,
            bFilter: false,
            dom: 'lfrtip',
            "oLanguage": {
                "sInfo": infoMsg
            }
        });
    } else {
        var row$ = $('<tr/>');
        row$.append($('<td align="center"/>').html("No Records Found"));
        $("#" + tableId).append(row$);
    }
    $("#" + tableId + '_length ').after('<div style="width:63%;"></div>');
}
/**
 * Comment
 */
function convertToDigits(val) {
    return val.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
}
function addAllColumnHeaders(myList, tableId) {
    var columnSet = [];
    var headerTr$ = $('<tr/>');

    for (var i = 0; i < myList.length; i++) {
        var rowHash = myList[i];
        for (var key in rowHash) {
            if ($.inArray(key, columnSet) == -1) {
                columnSet.push(key);
                headerTr$.append($('<th/>').html(key));
            }
        }
    }
    $("#" + tableId).append(headerTr$);

    return columnSet;
}
function refreshData() {

    $("#chart1Detail").hide();
    $("#donutDetail").hide();
    $("#chart2Detail").hide();
    $("#pieDetail").hide();
    $("#jsonTablePie").html("");
    $("#jsonTableChart2").html("");
    $("#jsonTableChart1").html("");
    $("#donut_loader").html("");
    $("#pieToggle").hide();
    $("#chart2Toggle").hide();
    $("#chart1Toggle").hide();
    $("#donutToggle").hide();
    $("#Pichart2Container").html("");
    $("#chartContainer").html("");
    $("#PichartContainer").html("");
    $("#donutchartContainer").html("");
}
function isAdminUsr() {
    isAdmin = $("#hasDashBoardConfig").val();
    return isAdmin;
}
function hasViewDashPermission() {
    hasDashBoardView = $("#hasDashBoardView").val();
    return hasDashBoardView
}
function showHideGraphLoader(graphType) {
    if (graphType == "pie")
        $("#pie_loader").hide();
    if (graphType == "chart2")
        $("#chart2_loader").hide();
    if (graphType == "chart1")
        $("#chart1_loader").hide();
    if (graphType == "donut")
        $("#donut_loader").hide();
}
function hideMinus() {
    $("#pie_plus").hide();
    $("#chart2_plus").hide();
    $("#chart1_plus").hide();
    $("#donut_plus").hide();
}
function showMinus(graphType) {

    if (graphType == "pie") {
        $("#pie_plus").hide();
        $("#pie_minus").show();
    }
    if (graphType == "chart2") {
        $("#chart2_plus").hide();
        $("#chart2_minus").show();
    }
    if (graphType == "chart1") {
        $("#chart1_plus").hide();
        $("#chart1_minus").show();
    }
    if (graphType == "donut") {
        $("#donut_plus").hide();
        $("#donut_minus").show();
    }
}

function isAllChartSelected() {
    var status = 1;
    if (showCourseCompletionStatusWithGroupByChart == 0 && showIncompletePastDue == 0 && showUserAssignmentStatusChart == 0 && showCourseCompletionStatusChart == 0) {
        status = 0;
    }
    return status;
}
///////////////EXPORT FEATURE ///////////////////////////////////////
function exportFunction(exportBtn, exportType, chartObj, exportDiv, filename) {

    var objAgent = navigator.userAgent;

    var win = window,
            doc = win.document,
            encode = win.encodeURIComponent || win.escape;
    //document.getElementById(exportDiv).style.display = none;
    var button = doc.getElementById(exportBtn),
            typeSelector = doc.getElementById(exportType),
            getSelectedType = function () {
                return typeSelector[typeSelector.selectedIndex].value;
            };

    // Enable the button when chart is fully rendered so
    // as to avoid premature download action.
    $("#" + exportDiv).show();
    // button.removeAttribute('disabled');
    // Add the download functionality to the click event
    // of the button.
    button.onclick = function () {
        var exportFormat = getSelectedType(),
                temporaryElement,
                obj,
                key;

        if (exportFormat === 'csv') {


            if (navigator.appName != 'Microsoft Internet Explorer' && parseInt(objAgent.indexOf("Trident")) == -1)
            {
                temporaryElement = doc.createElement('a');
                // We set the attributes of the temporary anchor element that
                // in such fashion as clicking on it induces download of the
                // CSV data from the chart.
                for (key in (obj = {
                    href: 'data:attachment/csv,' + encode(chartObj.getDataAsCSV()),
                    target: '_blank',
                    download: filename + '.csv'
                })) {
                    temporaryElement.setAttribute(key, obj[key]);
                }
                doc.body.appendChild(temporaryElement);

                // We emulate clicking by calling the click event handler and
                // post that get rid of the anchor to save very precious memory.
                temporaryElement.click();
                temporaryElement.parentNode.removeChild(temporaryElement);
                temporaryElement = null;
                ;
            }
            else
            {
                ifrm = document.createElement("IFRAME");
                ifrm.setAttribute("id", "csvDownloadFrame");
                ifrm.style.width = 0 + "px";
                ifrm.style.height = 0 + "px";
                document.body.appendChild(ifrm);
                var csvData = encode(chartObj.getDataAsCSV());
                csvData = decodeURIComponent(csvData);
                var iframe = document.getElementById('csvDownloadFrame');
                iframe = iframe.contentWindow || iframe.contentDocument;
                csvData = 'sep=,\r\n' + csvData;
                iframe.document.open("text/html", "replace");
                iframe.document.write(csvData);
                iframe.document.close();
                iframe.focus();
                iframe.document.execCommand('SaveAs', true, filename + '.csv');
            }

        }
        else {
            chartObj.exportChart({
                exportAtClient: '1',
                exportEnabled: '1',
                exportFormat: exportFormat,
                exportAction: 'download'
            });
            // console.log(exportFormat);
        }

    };

}
//Rest slider

// multiple chart selection  
function changeChartType(sliderId, chartClass, chartContainer, chartSubtitle, loadMsg, todraw, chartType) {
    var chartName;
    var sliderSel;

    $("." + chartClass).click(function () {
        chartType = $(this).val();
        chartName = $(this).attr('name');
        switch (chartName) {
            case 'chart-type':
                sliderSel = "sliderHeight";
                break;
            case 'chart-type1':
                sliderSel = "sliderHeightSecond";
                break;
            case 'chart-type2':
                sliderSel = "sliderHeightThird";
                break;
            case 'chart-type3':
                sliderSel = "sliderHeightFourth";
                break;
        }
        drawcheckedFusionChart(chartType, chartContainer, chartSubtitle, loadMsg, todraw, "400");
        $("#" + sliderSel).slider({
            range: "min",
            value: 400,
            min: 400,
            max: 15000,
            stop: function (event, ui) {
                var val = ui.value
                drawcheckedFusionChart(chartType, chartContainer, chartSubtitle, loadMsg, todraw, val);
                exportFunction('dl-btnchart1', 'dl-typechart1', chartType, 'exportOne', firstChartTitle);
                //console.log(val);
            }
        });
    });
    // All Four Default slider intitalization
    $("#" + sliderId).slider({
        range: "min",
        value: 400,
        min: 400,
        max: 15000,
        stop: function (event, ui) {
            var val = ui.value
            drawcheckedFusionChart(chartType, chartContainer, chartSubtitle, loadMsg, todraw, val);
            //console.log(val);
        }
    });
}
function drawcheckedFusionChart(chartType, chartContainer, chartSubtitle, loadMsg, todraw, height) {

    switch (todraw) {
        case 1:
            FusionCharts.ready(function () {
                chartOneObj = new FusionCharts({
                    type: chartType,
                    renderAt: chartContainer,
                    loadMessage: loadMsg,
                    width: "760",
                    height: height
                });
                addSubCaptionToChart(chartSubtitle);
                chartOneObj.setJSONData(jsonDataChart1);
                chartOneObj.render(chartContainer);
                exportFunction('dl-btnchart1', 'dl-typechart1', chartOneObj, 'exportOne', firstChartTitle);

            });
            break;
        case 2:
            FusionCharts.ready(function () {
                charTwoObj = new FusionCharts({
                    type: chartType,
                    renderAt: chartContainer,
                    loadMessage: loadMsg,
                    width: "760",
                    height: height
                });
                addSubCaptionToChart(chartSubtitle);
                charTwoObj.setJSONData(jsonDataChart2);
                charTwoObj.render(chartContainer);
                exportFunction('dl-btnchart2', 'dl-typechart2', charTwoObj, 'exportTwo', secondChartTitle);

            });
            break;
        case 3:
            FusionCharts.ready(function () {
                charThreeObj = new FusionCharts({
                    type: chartType,
                    renderAt: chartContainer,
                    loadMessage: loadMsg,
                    width: "760",
                    height: height
                });
                addSubCaptionToChart(chartSubtitle);
                charThreeObj.setJSONData(jsonDataChart3);
                charThreeObj.render(chartContainer);
                exportFunction('dl-btnchart3', 'dl-typechart3', charThreeObj, 'exportThree', thirdChartTitle);

            });
            break;
        case 4:
            FusionCharts.ready(function () {
                charFourObj = new FusionCharts({
                    type: chartType,
                    renderAt: chartContainer,
                    loadMessage: loadMsg,
                    width: "760",
                    height: height
                });
                addSubCaptionToChart(chartSubtitle);
                charFourObj.setJSONData(jsonDataChart4);
                charFourObj.render(chartContainer);
                exportFunction('dl-btnchart4', 'dl-typechart4', charFourObj, 'exportFour', fourthChartTitle);

            });
            break;

    }

}

function appendErrorMessage(errCode, errMsg) {

    $(".content").prepend('<div id="errorWrapper" class="contentWrapper"><div id="errorTop"><p class="messageTop"><span>Sorry, there is no data to display.</span><br></p></div><div id="errorBottom"><p class="messageBottomDash"></p></div></div>');

}
// Drill Table Export All feature

function drillTableDownload(exportType) {

    var groupByColumnName = getGroupbyValue();
    var title = $("#" + exportType + '_title').val();
    var completion_status = $("#" + exportType + '_completionStatus').val();
    var format = $("#" + exportType + '_tbldownload').val();
    var title = encodeURIComponent(title);
    var selectedUserId = getSelectedUserId();

    var data;
    //console.log(str); 
    switch (exportType) {
        case 'pie':

            data = 'dashBoardId=' + dashBoardId + '&managerId=' + selectedUserId + '&groupByColumnName=' + groupByColumnName + '&groupByColumnValue=' + title + '&completionStatus=' + completion_status + '&hasDashBoardConfig=' + hasDashBoardConfig + '&key=courseAssignmentDetailForPastDue&format=' + format;

            break;
        case 'chart2':

            data = 'dashBoardId=' + dashBoardId + '&managerId=' + selectedUserId + '&groupByColumnName=' + groupByColumnName + '&groupByColumnValue=' + title + '&completionStatus=' + completion_status + '&key=courseAssignmentDetail&hasDashBoardConfig=' + hasDashBoardConfig + '&format=' + format;

            break;
        case 'chart1':

            data = 'dashBoardId=' + dashBoardId + '&managerId=' + selectedUserId + '&groupByColumnName=' + groupByColumnName + '&groupByColumnValue=' + title + '&completionStatus=' + completion_status + '&hasDashBoardConfig=' + hasDashBoardConfig + '&key=userAssignmentDetail&format=' + format;

            break;
        case 'donut':

            data = 'dashBoardId=' + dashBoardId + '&managerId=' + selectedUserId + '&groupByColumnName=isNullValue&groupByColumnValue=isNullValue&completionStatus=' + completion_status + '&hasDashBoardConfig=' + hasDashBoardConfig + '&key=courseAssignmentDetail&format=' + format;

            break;
    }
    exportAll(data);
}
function exportAll(data) {
    window.location = '/viewdashboard/export?' + data;
}
function resizeSelect() {
    var sel = document.getElementById('viewDashboardAs');
    if (typeof sel.val != "undefined") {
        var selectedText = sel.options[sel.selectedIndex].text;
        var selectedLength = parseInt(selectedText.length);
        if (selectedLength > 25) {
            var incWidth = selectedLength - 25;
            var incWidth = incWidth * 7;
            var incWidth = 200 + incWidth;
            $("#viewDashboardAs").css({"width": incWidth});
        }
        else {
            $("#viewDashboardAs").css({"width": "200"});
        }
    }
}
function restoreSelect() {
   
}
//TO GET USER ID
function getSelectedUserId() {

    return $("#viewDashboardAs").val();
}
function replaceSpecialCharacters(str){
    var replaceVal = "@@@";
    var replaceAps = "%27";
    var replaceQuestion = "%3F";
    str = str.replace(/'/g, replaceAps);
    str = str.replace(/\?/g, replaceQuestion);
    return  str.replace(/\//g, replaceVal);
}