$.fn.DataTable.ext.pager.full_numbers = function (page, pages) {
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

$.fn.dataTableExt.oApi.fnPagingInfo = function (oSettings) {
    return {
        "iStart": oSettings._iDisplayStart,
        "iEnd": oSettings.fnDisplayEnd(),
        "iLength": oSettings._iDisplayLength,
        "iTotal": oSettings.fnRecordsTotal(),
        "iFilteredTotal": oSettings.fnRecordsDisplay(),
        "iPage": Math.ceil(oSettings._iDisplayStart / oSettings._iDisplayLength),
        "iTotalPages": Math.ceil(oSettings.fnRecordsDisplay() / oSettings._iDisplayLength)
    };
};
$(document).ready(function () {
    courseList();
    $("#exportFormat").val(exportFormat).selected;
});
function courseList() {
    var format = exportFormat;
    var jsonDataVar = {"key": "coursesList", "format": format};
    $.ajax({
        url: "/api/exportmanager/courses",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(jsonDataVar),
        beforeSend: function (xhr) {
            $("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="/images/backgrounds/ajax-loader.gif"  width=50 height=50/></span>Loading...</p>');
            $("#messageModal").dialog({
                resizable: false,
                minHeight: 150,
                width: 150,
                closeOnEscape: false,
                open: function (event, ui) {
                    $(".ui-dialog-titlebar-close", ui.dialog).hide();
                    $(".ui-dialog-titlebar", ui.dialog).show();
                    $("#dialog .ui-dialog-titlebar").css({
                        "background-color": "transparent",
                        "border": "0px none"
                    });
                },
            });
        }
    }).done(function (response) {
        if (response.content !== undefined) {
            if ($("#messageModal").css('display') === 'block')
                $("#messageModal").dialog("close");
            $("#source").removeClass("disNone");
            $("#destination").removeClass("disNone");

            var src = [];

            for (x = 0; x <= response.content.courseLookupDTOList.length - 1; x++) {
                var label;
                var supportedTemplate = "off";
                var pdfTemplate = "off";
                var supportedTemplateaicc = "off";
                if (response.content.courseLookupDTOList[x].templates !== undefined) {
                     if (response.content.courseLookupDTOList[x].templates) {
                        var astr = response.content.courseLookupDTOList[x].templates.replace(/(^[,\s]+)|([,\s]+$)/g, '')
                        template = astr.split(",");
                        if (template.length > 0) {
                            for (var i = 0; i < template.length; i++) {
                                if (template[i] !== "" && (template[i] == "FusionPlus" || template[i] == "FluidX")) {
                                    supportedTemplate = "on";
                                }
                                if (template[i] !== "" && template[i] == "FluidX") {
                                    pdfTemplate = "on";
                                }
                                if (template[i] !== "" && (template[i] == "BlueWave" || template[i] == "eac")) {
                                    supportedTemplateaicc = "on";
                                }
                            }
                        }
                    } else if (response.content.courseLookupDTOList[x].templates === null) {
                        newTemplate = response.content.courseLookupDTOList[x].templates;
                        supportedTemplate = "off";
                        pdfTemplate = "off";
                        supportedTemplateaicc = "off";
                    }
                }
                availableLang.forEach(function (log) {
                    if (log.language == response.content.courseLookupDTOList[x].ModuleLanguage) {
                        label = log.label;
                    }
                });
                src.push({
                    "Module ID": response.content.courseLookupDTOList[x].ModuleID,
                    "Module Title": response.content.courseLookupDTOList[x].ModuleTitle,
                    "Module Language": label,
                    "systemId": response.content.courseLookupDTOList[x].systemId,
                    "App_type": response.content.courseLookupDTOList[x].appType,
                    "Certificate": response.content.courseLookupDTOList[x].jasperCertificate,
                    "Templates": response.content.courseLookupDTOList[x].templates,
                    "supportedTemplate": supportedTemplate,
                    "supportedTemplateaicc": supportedTemplateaicc,
                    "pdfTemplate": pdfTemplate
                });
            }
            var dest = [];
            var stockTable = $('#source').dataTable({
                "aaData": src,
                "sPaginationType": "full_numbers",
                "bFilter": true,
                "bProcessing": true,
                "bRedraw": true,
                "bInfo": false,
                "bSort": true,
                "bDestroy": true,
                "bLengthChange": true,
                "order": [[0, "asc"], [1, "asc"], [2, "asc"]],
                "pageLength": 10,
                "lengthMenu": [[10, 20, 30, 40, 50], [10, 20, 30, 40, 50]],
                "aoColumns": [
                    {"mData": "Module ID"},
                    {"mData": "Module Title"},
                    {"mData": "Module Language"},
                    {"mData": "systemId"},
                    {"mData": "App_type"},
                    {"mData": "supportedTemplate"},
                    {"mData": "supportedTemplateaicc"},
                    {"mData": "pdfTemplate"}

                ],
                "fnCreatedRow": function (nRow, aData, iDataIndex) {
                    $('td:eq(0)', nRow).attr('class', 'dtableTd font_style');
                    $('td:eq(1)', nRow).attr('class', 'dtableTd font_style');
                    $('td:eq(3)', nRow).css('display', 'none');
                    $('td:eq(4)', nRow).css('display', 'none');
                    $('td:eq(5)', nRow).css('display', 'none');
                    $('td:eq(6)', nRow).css('display', 'none');
                    $('td:eq(7)', nRow).css('display', 'none');
                },
                "fnRowCallback": function (nRow, aData) {
                    var template, newTemplate;
                    /*                    var supportedTemplate = false;
                     var supportedTemplateaicc = false;
                     if (aData.Templates !== undefined) {
                     if (aData.Templates) {
                     var astr = aData.Templates.replace(/(^[,\s]+)|([,\s]+$)/g, '')
                     template = astr.split(",");
                     if (template.length > 0) {
                     for (var i = 0; i < template.length; i++) {
                     if (template[i] !== "" && (template[i] == "FusionPlus" || template[i] == "FluidX")) {
                     supportedTemplate = true;
                     }
                     if (template[i] !== "" && (template[i] == "BlueWave" || template[i] == "eac")) {
                     supportedTemplateaicc = true;
                     }
                     }
                     }
                     } else if (aData.Templates === null) {
                     newTemplate = aData.Templates;
                     supportedTemplate = false;
                     }
                     }*/
                    if (exportFormat === "aicc" || exportFormat === "aicc_combined") {
                        if (aData.App_type === "jasper" || aData.App_type === "xscorm" || aData.App_type === "yorick" || aData.supportedTemplate == "on" || aData.supportedTemplateaicc == "on") {
                            $(nRow).attr("draggable", true);
                        } else {
                            $(nRow).attr("disabled", true);
                            $(nRow).addClass("disabledTRow");
                            $(nRow).attr("draggable", false);
                        }
                    }
                    else {
                        if (exportFormat === "tutorial_pdf") {
                            if (aData.pdfTemplate === "on" && aData.App_type !== "xscorm") {
                                $(nRow).attr("draggable", true);
                            }
                            else {
                                $(nRow).attr("disabled", true);
                                $(nRow).addClass("disabledTRow");
                                $(nRow).attr("draggable", false);
                            }
                        }
                        else {
                            if (aData.Templates !== undefined) {
                                if (aData.App_type !== "ajax" || aData.Certificate === 1 || aData.supportedTemplate === false || aData.Templates === ",BlueWave," || aData.Templates === ",BlueWave,eac,") {
                                    $(nRow).attr("disabled", true);
                                    $(nRow).addClass("disabledTRow");
                                    $(nRow).attr("draggable", false);
                                } else {
                                    $(nRow).attr("draggable", true);
                                }
                            } else {
                                $(nRow).attr("draggable", true);
                            }
                        }
                    }
                    /*                    if (aData.App_type !== "ajax" && aData.Certificate === 0 && (newTemplate !== undefined && (newTemplate !== 'FusionPlus' || newTemplate !== 'FluidX'))) {
                     $(nRow).attr("disabled", true);
                     $(nRow).addClass("disabledTRow");
                     $(nRow).attr("draggable", false);
                     } else if (aData.Certificate === 1) {
                     $(nRow).attr("disabled", true);
                     $(nRow).addClass("disabledTRow");
                     $(nRow).attr("draggable", false);
                     } else {
                     $(nRow).attr("draggable", true);
                     }*/
                },
                "fnDrawCallback": function (oSettings) {
                    $("<tr><td colspan='3'> Drag and drop the selected modules to the right panel. Ctrl+click to select more than one module. </td></tr>").prependTo("table > tbody").addClass('info titleBarBtnBgColor');
                    $("table > tbody > tr:first > td").addClass('primaryTextIcons');
                    $("#destination .info").hide();
                    $('#dynamic').trigger('change');
                    $('#source').addClass('borders');
                    var dataTableId = '#source';
                    $(dataTableId + '_previous').attr("class", "paginate_enabled_previous");
                    $(dataTableId + '_next').attr("class", "paginate_enabled_next");
                    $(dataTableId + '_paginate > span').attr("style", "float:left");
                    $('tbody tr td').addClass('borderBottomThin contentTextIcons');
                    $('thead th').addClass('dtableTd');
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
                    if (oSettings.aoData.length === 0) {
                        $(".paginate_left").attr("style", "visibility:visible");
                        $("#source_paginate").attr("style", "display:block");
                    }
                },
                "oLanguage": {
                    "sSearch": "<span>Search:</span>",
                    "sEmptyTable": "There are no modules to display at this time."
                }
            });

            var catalogTable = $('#destination').dataTable({
                "aaData": dest,
                "sPaginationType": "full_numbers",
                "bFilter": true,
                "bProcessing": true,
                "bRedraw": true,
                "bDestroy": true,
                "bInfo": false,
                "searching": false,
                "bLengthChange": true,
                "lengthMenu": [[10, 20, 30, 40, 50], [10, 20, 30, 40, 50]],
                "aoColumns": [
                    {"mData": "Module ID"},
                    {"mData": "Module Title"},
                    {"mData": "Module Language"},
                    {"mData": "systemId"},
                    {"mData": "App_type"},
                    {"mData": "supportedTemplate"},
                    {"mData": "supportedTemplateaicc"},
                    {"mData": "pdfTemplate"},
                    {"mData": "mRender", "mRender": function (data, type, rowData) {

                            return '<div style="display:none;" id=' + 'loader_' + rowData.systemId + '><img  height="30px" width="30px;" src="/images/zip-progress.gif"></div><div style="display:none;" id=' + 'loader_finish' + rowData.systemId + '><img height="30px" width="30px;" src="/images/zip-success.png"></div>';

                        }},
                    {"mData": "mRender", "mRender": function (data, type, rowData) {

                            return '<button id=' + 'button_' + rowData.systemId + ' type="button" title="Remove" class="deleteBtn fa fa-times" style="display:block"></button>';
                        }}

                ],
                "columnDefs": [{"targets": 3, "orderable": false}],
                "fnCreatedRow": function (nRow, aData, iDataIndex) {
                    $('td', nRow).attr('class', 'deleteBtnArea');
                    $('td:eq(0)', nRow).attr('class', 'dtableTd');
                    $('td:eq(1)', nRow).attr('class', 'dtableTd');
                    $('td:eq(3)', nRow).css('display', 'none');
                    $('td:eq(4)', nRow).css('display', 'none');
                    $('td:eq(5)', nRow).css('display', 'none');
                    $('td:eq(6)', nRow).css('display', 'none');
                    $('td:eq(7)', nRow).css('display', 'none');
                    $('#destination').addClass('borders');
                },
                "fnDrawCallback": function (oSettings) { //212
                    $('#dynamic').trigger('change');
                    $("#destination tbody tr").attr("draggable", false);
                    $("#destination tbody tr").removeAttr("draggable");
                },
                "oLanguage": {
                    "sEmptyTable": "<div><p>You have no modules selected. <br/>Drag and drop the modules you want to export from the left panel.</p></div>"
                }
            });

            $('.dataTables_length').hide();
            // change event on entries 
            $("#entries").on('change', function () {
                var valSelected = $(this).val();
                $("select[name^='source']").each(function (i, val) {
                    $(this).val(valSelected);
                    $(this).change();
                });
                $("select[name^='destination']").each(function (i, val) {
                    $(this).val(valSelected);
                    $(this).change();
                });
            });

            //On Initial Load
            var height = $("#source tbody").height();
            $("#destination > tbody > tr > td.dataTables_empty > div").addClass("noModuleBox");
            $("#destination > tbody > tr > td.dataTables_empty > div").css({'height': height});
            $(".adminBlueBtn").addClass("inactive");
            if (src && src.length === 0) {
                $("#destination .noModuleBox").css("height", "640px");
                $("#source tbody tr td.dataTables_empty").css("height", "602px");
            }
            var settings = stockTable.fnSettings();
            var total = settings.fnRecordsDisplay();
            var l = Math.ceil(total / settings._iDisplayLength);
            var page = Math.ceil(settings._iDisplayStart / settings._iDisplayLength) + 1;
            if (page === 1) {
                $('#source_previous').attr('class', 'paginate_disabled_previous');
                $("#source_next").attr('class', 'paginate_enabled_next');
                if (l === 1) {
                    $('#source_next').attr('class', 'paginate_disabled_next');
                }
            }
            $('.current').addClass('paginate_active');
            $('.current').removeClass('paginate_button current');
            $('.ellipsis').remove();
            $('#source_length').addClass('secondaryBgColor');
            $('#source_length > label').addClass('dtableTd');
            $('#source_filter > label').addClass('dtableTd');
            $('#source tbody tr').addClass('borderBottomThin');
            $("#source tbody tr:first").removeClass('borderBottomThin');
            $('#source > thead > tr > th.control').css({'display': 'inline-block', 'vertical-align': 'middle', 'float': 'left'});
            $('#source > thead > tr > th.courseTitle').css({'display': 'inline-block', 'vertical-align': 'middle', 'float': 'left'});
            $('#source > thead > tr > th.courseModuleId').css({'display': 'inline-block', 'vertical-align': 'middle', 'float': 'left'});
            $('#source > thead > tr > th.courseLanguage').css({'display': 'inline-block', 'vertical-align': 'middle', 'float': 'left'});
            $('#source_paginate').appendTo('.paginate_left');

            var settings1 = catalogTable.fnSettings();
            var total1 = settings1.fnRecordsDisplay();
            if (total1 === 0) {
                $(".paginate_right").attr('style', 'visibility:hidden');
                $(".adminBlueBtn").addClass('inactive');
//                $("#exportFormat").attr("disabled","false");
                $("#ie8fix_top").addClass('ie8BtnInactive');
                $("#destination_filter").addClass('inactive');
            } else {
                $(".paginate_right").attr('style', 'visibility:visible');
                $(".adminBlueBtn").removeClass('inactive');
//                $("#exportFormat").attr("disabled","true");
                $("#ie8fix_top").removeClass('ie8BtnInactive');
                $("#destination_filter").removeClass('inactive');
            }

            $("#destination_previous").attr('class', 'paginate_disabled_previous');
            $("#destination_next").attr('class', 'paginate_disabled_next');
            $('#destination_length > label').addClass('dtableTd');
            $('#destination_filter > label').addClass('dtableTd');
            $('#destination > tbody > tr').addClass('borderBottomThin');
            $('#destination > thead > tr > th.control').css({'display': 'inline-block', 'vertical-align': 'middle', 'float': 'left'});
            $('#destination > thead > tr > th.courseTitle').css({'display': 'inline-block', 'vertical-align': 'middle', 'float': 'left'});
            $('#destination > thead > tr > th.courseModuleId').css({'display': 'inline-block', 'vertical-align': 'middle', 'float': 'left'});
            $('#destination > thead > tr > th.courseLanguage').css({'display': 'inline-block', 'vertical-align': 'middle', 'float': 'left'});
            $('#destination_paginate').appendTo('.paginate_right');
            //End of Initialization

            // header remove icon click to remove all the modules from roght hand panel 
            $('#reset').on('click', function () {
                var len, i;
                $('#reset').css("display", "none");
                len = catalogTable.fnGetData().length;
                for (i = 0; i < len; i++) {
                    var addRow = catalogTable.fnGetData()[0];
                    stockTable.fnAddData(addRow, false);
                    $('#source').trigger('change');
                    stockTable.fnDraw(false);
                    catalogTable.fnDeleteRow(0, false);
                    $('#dynamic').trigger('change');
                }
            });

            //Each row click remove icon to remove rows from right panel 
            catalogTable.on('click || dblclick', '#destination td button', function () {
                var catalogTableData = catalogTable.fnSettings().aoData;
                if (catalogTableData.length === 1) {
                    $('#reset').css("display", "none");
                }
                var $row = $(this).closest("tr");
                var addRow = catalogTable.fnGetData($(this).closest("tr"));
                catalogTable.fnDeleteRow($row, false);
                $('#dynamic').trigger('change');
                stockTable.fnAddData(addRow, false);
                $('#source').trigger('change');
                stockTable.fnDraw(false);
            });

            // added pagination in right hand panel depending on conditions
            $("#dynamic").on('change', function () {
                $("#source_previous").attr('class', 'paginate_enabled_previous');
                $("#source_next").attr('class', 'paginate_enabled_next');
                $("#destination_previous").attr('class', 'paginate_enabled_previous');
                $("#destination_next").attr('class', 'paginate_enabled_next');
                var settings = stockTable.fnSettings();
                var total = settings.fnRecordsDisplay();
                var l = Math.ceil(total / settings._iDisplayLength);
                var page = Math.ceil(settings._iDisplayStart / settings._iDisplayLength) + 1;
                if (page === 1) {
                    $('#source_previous').attr('class', 'paginate_disabled_previous');
                    $('#source_next').attr('class', 'paginate_enabled_next');
                    if (l === 1)
                        $('#source_next').attr('class', 'paginate_disabled_next');
                } else if (page === l) {
                    $('#source_next').attr('class', 'paginate_disabled_next');
                }
                if (total === 0) {
                    $(".paginate_left").attr('style', 'visibility:hidden');
                } else {
                    $(".paginate_left").attr('style', 'visibility:visible');
                }
                $('#source_length > label').addClass('dtableTd');
                $('#source_filter > label').addClass('dtableTd');
                $('#source > tbody > tr').addClass('borderBottomThin');
                $("#source > tbody > tr:first").removeClass('borderBottomThin');
                $('#source > thead > tr > th.control').css({'width': '7.5%', 'display': 'inline-block', 'vertical-align': 'middle', 'float': 'left', 'padding': '0'});
                $('#source > thead > tr > th.courseTitle').css({'width': '42%', 'display': 'inline-block', 'vertical-align': 'middle', 'float': 'left', 'padding': '0'});
                $('#source > thead > tr > th.courseModuleId').css({'width': '19%', 'display': 'inline-block', 'vertical-align': 'middle', 'float': 'left', 'padding': '0'});
                $('#source > thead > tr > th.courseLanguage').css({'width': '30%', 'display': 'inline-block', 'vertical-align': 'middle', 'float': 'left', 'padding': '0'});


                //For the Destination Table
                var settings1 = catalogTable.fnSettings();
                var total1 = settings1.fnRecordsDisplay();
                var l1 = Math.ceil(total1 / settings1._iDisplayLength);
                var page1 = Math.ceil(settings1._iDisplayStart / settings1._iDisplayLength) + 1;
                if (page1 === 1) {
                    $('#destination_previous').attr('class', 'paginate_disabled_previous');
                    $('#destination_next').attr('class', 'paginate_enabled_next');
                    if (total1 === 0) {
                        $('#destination_next').attr('class', 'paginate_disabled_next');
                        $(".paginate_right").attr('style', 'visibility:hidden');
                    } else if (l1 === 1) {
                        $('#destination_next').attr('class', 'paginate_disabled_next');
                        $(".paginate_right").attr('style', 'visibility:visible');
                    }
                } else if (page1 === l1) {
                    $('#destination_next').attr('class', 'paginate_disabled_next');
                }
                $('.current').addClass('paginate_active');
                $('.current').removeClass('paginate_button current');
                $('.ellipsis').remove();
                if (total1 === 0) {
                    $(".adminBlueBtn").addClass('inactive');
                    $("#exportFormat").removeAttr("disabled");
                    $("#ie8fix_top").addClass('ie8BtnInactive');
                    $("#destination_filter").addClass('inactive');
                } else {
                    $(".adminBlueBtn").removeClass('inactive');
//                    $("#exportFormat").attr("disabled","true");
                    $("#ie8fix_top").removeClass('ie8BtnInactive');
                    $("#destination_filter").removeClass('inactive');
                }

                var height = $("#source tbody").height();
                $("#destination > tbody > tr > td.dataTables_empty > div").addClass("noModuleBox");
                $("#destination > tbody > tr > td.dataTables_empty > div").css({'height': height + 'px'});
                $('#destination_length > label').addClass('dtableTd');
                $('#destination_filter > label').addClass('dtableTd');
                $('#destination > tbody > tr').addClass('borderBottomThin');
                $('#destination > thead > tr > th.control').css({'width': '7.5%', 'display': 'inline-block', 'vertical-align': 'middle', 'float': 'left', 'padding': '0'});
                $('#destination > thead > tr > th.courseTitle').css({'width': '42%', 'display': 'inline-block', 'vertical-align': 'middle', 'float': 'left', 'padding': '0'});
                $('#destination > thead > tr > th.courseModuleId').css({'width': '19%', 'display': 'inline-block', 'vertical-align': 'middle', 'float': 'left', 'padding': '0'});
                $('#destination > thead > tr > th.courseLanguage').css({'width': '30%', 'display': 'inline-block', 'vertical-align': 'middle', 'float': 'left', 'padding': '0'});
            });


            $("#source_paginate").on('click', function () {
                $("#source_previous").attr('class', 'paginate_enabled_previous');
                $("#source_next").attr('class', 'paginate_enabled_next');
                var settings = stockTable.fnSettings();
                var total = settings.fnRecordsDisplay();
                var l = Math.ceil(total / settings._iDisplayLength);
                var page = Math.ceil(settings._iDisplayStart / settings._iDisplayLength) + 1;
                if (page === 1) {
                    $('#source_previous').attr('class', 'paginate_disabled_previous');
                    $('#source_next').attr('class', 'paginate_enabled_next');
                    if (l === 1) {
                        $('#source_next').attr('class', 'paginate_disabled_next');
                    }
                } else if (page === l) {
                    $('#source_next').attr('class', 'paginate_disabled_next');
                    $("#source_previous").attr('class', 'paginate_enabled_previous');
                } else {
                    $("#source_previous").attr('class', 'paginate_enabled_previous');
                    $("#source_next").attr('class', 'paginate_enabled_next');
                }

                $('#source_length > label').addClass('dtableTd');
                $('#source_filter > label').addClass('dtableTd');
                $('#source > tbody > tr').addClass('borderBottomThin');
                $("#source > tbody > tr:first").removeClass('borderBottomThin');
                $('#source > thead > tr > th.control').css({'width': '7.5%', 'display': 'inline-block', 'vertical-align': 'middle', 'float': 'left', 'padding': '0'});
                $('#source > thead > tr > th.courseTitle').css({'width': '42%', 'display': 'inline-block', 'vertical-align': 'middle', 'float': 'left', 'padding': '0'});
                $('#source > thead > tr > th.courseModuleId').css({'width': '19%', 'display': 'inline-block', 'vertical-align': 'middle', 'float': 'left', 'padding': '0'});
                $('#source > thead > tr > th.courseLanguage').css({'width': '30%', 'display': 'inline-block', 'vertical-align': 'middle', 'float': 'left', 'padding': '0'});
            });

            //Pagination click for Destination Table
            $("#destination_paginate").on('click', function () {
                $("#destination_previous").attr('class', 'paginate_disabled_previous');
                $("#destination_next").attr('class', 'paginate_disabled_next');
                var settings = catalogTable.fnSettings();
                var total = settings.fnRecordsDisplay();
                var l = Math.ceil(total / settings._iDisplayLength);
                var page = Math.ceil(settings._iDisplayStart / settings._iDisplayLength) + 1;
                if (page === 1) {
                    $('#destination_previous').attr('class', 'paginate_disabled_previous');
                    $('#destination_next').attr('class', 'paginate_enabled_next');
                    if (l === 1) {
                        $('#destination_next').attr('class', 'paginate_disabled_next');
                    }
                } else if (page === l) {
                    $('#destination_next').attr('class', 'paginate_disabled_next');
                    $("#destination_previous").attr('class', 'paginate_enabled_previous');
                } else {
                    $("#destination_previous").attr('class', 'paginate_enabled_previous');
                    $("#destination_next").attr('class', 'paginate_enabled_next');
                }
                $('#destination_length > label').addClass('dtableTd');
                $('#destination_filter > label').addClass('dtableTd');
                $('#destination > tbody > tr').addClass('borderBottomThin');
                $('#destination > thead > tr > th.control').css({'width': '7.5%', 'display': 'inline-block', 'vertical-align': 'middle', 'float': 'left', 'padding': '0'});
                $('#destination > thead > tr > th.courseTitle').css({'width': '42%', 'display': 'inline-block', 'vertical-align': 'middle', 'float': 'left', 'padding': '0'});
                $('#destination > thead > tr > th.courseModuleId').css({'width': '19%', 'display': 'inline-block', 'vertical-align': 'middle', 'float': 'left', 'padding': '0'});
                $('#destination > thead > tr > th.courseLanguage').css({'width': '30%', 'display': 'inline-block', 'vertical-align': 'middle', 'float': 'left', 'padding': '0'});
            });

            function enableDownloader(loaderId, sec) {
                $('#' + loaderId).ClassyLoader({
                    width: 50,
                    height: 50,
                    percentage: 100,
                    speed: sec,
                    fontSize: '10px',
                    diameter: 20,
                    lineColor: 'rgb(52, 168, 83)',
                    remainingLineColor: 'rgba(200,200,200,0.4)',
                    lineWidth: 4
                });
            }

            // export manager button click 
             $('.adminBlueBtn').click(function () {
                this.disabled = true;
                $(".adminBlueBtn").addClass('inactive');
                var data = catalogTable.fnSettings().aoData;
                var downloadCourseLength = data.length;
                var loader;
                var arrLoader = [];
                var countLoad = -1;
                var dataLength = 0;
                var countArray = [20,55,65,78,99];
                if (downloadCourseLength > 0) {
                    for (var i = 0; i < downloadCourseLength; i++) {
                        var dataReq = {};
                        dataReq = {"key": "exportCourse", "systemId": data[i]._aData["systemId"], "courseFormat": exportFormat};
                        var loaderId = "loader_" + data[i]._aData["systemId"];
                        var loaderIdFinish = "loader_finish" + data[i]._aData["systemId"];
                         $("#"+loaderId).show();   
                         $("#"+loaderIdFinish).hide();
                            var url='/api/exportmanager/downloadcourse';
                            var method = 'POST';
                            dataReq = JSON.stringify(dataReq);
                            if (exportFormat == "tutorial_pdf") {
                                var url = "/admin/exportpdf";
                                var method = "GET";
                                dataReq = {"systemId": data[i]._aData["systemId"]};
                             } 
                               setTimeout(
                                function (dataReq)
                                {   
                                    $.ajax({
                                        url: url,
                                        type: method,
                                        contentType: "application/json",
                                        data: dataReq, 
                                        beforeSend: function (xhr) {
                                            // functionality to animate the loader till we get the response from the server.
                                            var setLoaderTime = setTimeout(function () {
                                                countLoad++;
                                               
                                            }, 1000);
                                            // to disable remove button.
                                            $("#exportFormat").attr("disabled", "true");

                                            var disableDeleteBtn = $("#destination td button");
                                            $("#reset").addClass("inactive").attr('disabled', 'disabled');
                                            $(disableDeleteBtn).each(function () {
                                                $(this).addClass("inactive").attr('disabled', 'disabled');
                                            });
                                        }
                                    }).done(function (response) {
                                        if (exportFormat == "tutorial_pdf") {
                                           response = JSON.parse(response);
                                         }
                                        dataLength++;
                                        // code to enable remove all button once all the buttons are enable
                                        if (dataLength === downloadCourseLength) {
                                            $("#reset").removeClass("inactive").removeAttr('disabled');
                                            $("#exportFormat").removeAttr("disabled");
                                            $('.adminBlueBtn').removeAttr("disabled");;
                                            $(".adminBlueBtn").removeClass('inactive');
                                        }
                                        if (dataLength === downloadCourseLength && catalogTable.fnSettings().aoData.length > downloadCourseLength) {
                                            $("#reset").removeClass("inactive").removeAttr('disabled');
                                            $("#exportFormat").removeAttr("disabled");
                                        }
                                        // respective remove button course wise.
                                        var disableDeleteBtn = "button_" + dataReq.systemId;
                                        $("#" + disableDeleteBtn).removeClass("inactive").removeAttr('disabled');
                                        if (response.content !== undefined && response.content.file !== "") {
                                            var url = response.content.zipFile;
                                            var resLoaderId = "loader_" + response.content.systemId;
                                            var resLoaderIdFinish = "loader_finish" + response.content.systemId;
                                            $('#' + resLoaderId).hide();
                                            $('#'+resLoaderIdFinish).show();
                                            if (exportFormat == "tutorial_pdf") {
                                                downloadPdf(url);

                                            } else {
                                                $.fileDownload(url);
                                            }
       
                                        } 
                                    });
                                }, 1000 * i, dataReq);
                            
                    }

                }
            });
            /* Code for drag and drop starts here */
            var draggedRow = '';

            // to get selected row object 
            function fnGetSelected(oTableLocal)
            {
                return oTableLocal.$('tr.selected');
            }

            // attach dragstart event 
            if (src.length > 0) {
                $(document).on('dragstart', '#source tr[draggable=true]', function (e) {
                    $('stockTable tbody tr').css('cursor', 'pointer');
                    e.originalEvent.dataTransfer.effectAllowed = "move";
                    var sel = fnGetSelected(stockTable);
                    if (sel.length > 1) {
                        draggedRow = sel;
                    } else {
                        draggedRow = $(this);
                    }
                    // code added for ff browser
                    if (navigator.appCodeName === "Mozilla") {
                        var ffData = e.originalEvent.dataTransfer;
                        ffData.setData("text", draggedRow);
                    }
                });
            } else {
                return false;
            }

            // attach dragover
            document.getElementById("destination").addEventListener('dragover', function (event) {
                event.preventDefault();
                event.stopPropagation();
            }, false);

            // attach drop event on destination table
            document.getElementById("destination").addEventListener('drop', function (event) {
                var dataArr = [];
                var sysID;
                $(draggedRow).each(function () {
                    var obj = this;
                    $(obj).each(function () {
                        dataArr.push({
                            'Module ID': $(this).find('td:first').html(),
                            'Module Title': $(this).find('td:nth-child(2)').html(),
                            'Module Language': $(this).find('td:nth-child(3)').html(),
                            'systemId': $(this).find('td:nth-child(4)').html(),
                            'App_type': $(this).find('td:nth-child(5)').html(),
                            'supportedTemplate': $(this).find('td:nth-child(6)').html(),
                            'supportedTemplateaicc': $(this).find('td:nth-child(7)').html(),
                            'pdfTemplate': $(this).find('td:nth-child(8)').html()

                        });
                        sysID = $(this).find('td:nth-child(4)').html();
                        return;
                    });
                    var page_number = stockTable.fnPagingInfo().iPage;
                    stockTable.fnDeleteRow(obj, function () {
                        stockTable.fnPageChange(page_number);
                    }, false);
                });
                $("#displayLoader").css("display", "block");
                event.preventDefault();
                // code added for ff browser
                if (navigator.appCodeName === "Mozilla") {
                    event.dataTransfer.getData("text");
                }
                if (dataArr.length === 0) {
                    return false;
                } else {
                    catalogTable.fnAddData(dataArr);
                }
                $("#reset").css("display", "block");
                //$("#displayLoader_"+sysID).css("display", "block");
                dataArr = [];
                draggedRow = '';
            }, false);

            // code start for shift control key for drag and drop 
            stockTable.on('click || dblclick', 'tbody tr:not(:first-child)', function (e) {
                if (e.currentTarget.draggable) {
                    if (e.ctrlKey || e.shiftKey || e.metaKey) {
                        $(this).addClass('selected');
                    } else {
                        stockTable.$('tr.selected').removeClass('selected');
                        $(this).addClass('selected');
                    }
                }
            });

            stockTable.on('mousedown', 'tr', function (event) {
                if (!event.currentTarget.draggable) {
                    event.preventDefault();
                }
            });

            // click event of sorting in left hand panel table
            $("#source").on("click", "thead tr th", function () {
                sortingForAllTabs(stockTable, $("#source"));
            });

            function sortingForAllTabs(tableName, tableId) {
                tableId.find('th > i.fa').remove();
                $(tableId).find('th.sorting').append('<i class="fa fa-sort"></i>');
                settings = tableName.fnSettings();
                if (settings.aaSorting[0][1] === "asc") {
                    tableId.find('th.sorting_asc').append('<i class="fa fa-caret-down"></i>');
                }
                if (settings.aaSorting[0][1] === "desc") {
                    tableId.find('th.sorting_desc').append('<i class="fa fa-caret-up"></i>');
                }
            }
        } else {
            if ($("#messageModal").css('display') === 'block')
                $("#messageModal").dialog("close");
            $("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="/images/backgrounds/error.png"  width=50 height=50/></span>Loading has failed. Please try again.</p>');
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
    });

}
;
function downloadPdf(uri) {
    if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
            window.open(uri);
            return;
    }else {
        
        var link = document.createElement('a');
        if (typeof link.download === 'string') {
            link.href = uri;
            link.setAttribute('download', true);

            //Firefox requires the link to be in the body
            document.body.appendChild(link);

            //simulate click
            link.click();

            //remove the link when done
            document.body.removeChild(link);
        } else {
            window.open(uri);
        }
    }
}