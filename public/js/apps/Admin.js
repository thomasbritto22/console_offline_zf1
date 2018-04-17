if (typeof (Lrn) == 'undefined')
    Lrn = {};
if (typeof (Lrn.Application) == 'undefined')
    Lrn.Application = {};

/**
 * --- ADMINISTRATION ---
 * Responsible for controlling all Admin UI functionality. 
 * @param config
 * @returns {Lrn.Application.Admin}
 */
Lrn.Application.Admin = function (config) {
    if (config) {
        this.user = config.user || null;
        this.siteConfigs = config.siteConfigs || null;
        this.SAMLResponse = config.SAMLResponse || null;
        this.deflang = config.defLang || '';
        this.deflanguageName = config.langName || '';
        this.lang = config.lang || '';
        this.languageName = config.langName || '';
    }
};

/**
 * --- ADMIN PROTOTYPE ---
 * We want to make Admin a subclass of Application so
 * we will set the Admin.prototype to the Lrn.Application object
 * and make sure we have the superclass available for
 * overriding methods from Lrn.Application.
 */
Lrn.Application.Admin.prototype = new Lrn.Application();
Lrn.Application.Admin.prototype.superclass = Lrn.Application.prototype;
Lrn.Application.Admin.prototype.strAlert = '';
Lrn.Application.Admin.prototype.fixedImageWhitelist = [''];
Lrn.Application.Admin.prototype.adminUrl = '';
Lrn.Application.Admin.prototype.homeAction = false;

Lrn.Application.Admin.prototype.init = function () {
    // before we extend the superclass init method, 
    // we call the init method of the superclass (Application.js)
    this.superclass.init.apply(this);
    //initialize the expandable admin lists
    this.initAdminList();
    this.adminUrl = window.location.href;

    if (this.adminUrl.search("/admin/home") >= 0) {
        this.homeAction = true;

        //initial the selfRegistration
        this.selfRegistInit(this.lang, this.languageName);
    }

    //this.initImageUploadBtn();

    this.initClearLinkEnabledArray();
    this.initClearLink();

    // this.initSlideshowPreview();

    $('.videoUploadSection img.customfile').each(this.eachCustomFileImg.bind(this));

//    var vidimg = $('.videoUploadSection .imageWrap img');
//
//    if(vidimg.length>0){
//	    var initval = 1;
//	    var selectedFileImg = vidimg.attr('src');
//        var sfiBase = selectedFileImg.substr( 0,(selectedFileImg.lastIndexOf('-') ) );
//		var selectedFileImg = sfiBase + '-00001.jpg';
//	    vidimg.on('error',this.initOnError.bind(this));
//    }
    $('.getFile').each(this.initSetGetFileButton.bind(this));

    $('#themeui_dialog').dialog({
        autoOpen: false,
        dialogClass: 'secondaryBgColor',
        width: 435,
        modal: true,
        resizable: false,
        buttons: [{text: "Ok", click: function () {
                    $(this).dialog("close");
                }}],
        open: function (event, ui) {
            $(this).parent().find('.ui-dialog-titlebar').hide();
        }
    });
    var settings = {
        selector: 'textarea.rte',
        menubar: false,
        statusbar: false,
        inline_styles: false,
        formats: {
            underline: {inline: 'u', exact: true}
        },
        plugins: "paste link maxchars",
        toolbar: "bold italic underline | alignleft aligncenter alignright alignjustify | bullist | link unlink | paste",
        paste_auto_cleanup_on_paste: true,
        paste_remove_styles: true,
        paste_remove_styles_if_webkit: true,
        paste_strip_class_attributes: "all",
//            max_chars: 20,
        invalid_elements: "sub,span",
        setup: function (ed)
        {
            //set the max length to 1000 if the tinyMce is not the VIP message
            if ("VIP_messagetext" != ed.id) {
                ed.settings.max_chars = 1000;
            }

            if (ed.id == "header_taglinetitle") {
                ed.settings.toolbar = ed.settings.toolbar.replace('\| bullist ', '');
            }
            var tinymce_placeholder = $('#' + ed.id);

            var attr = tinymce_placeholder.attr('placeholder');
            var placeholder = '<span style="color: #999;">' + attr + '</span>';
            ed.on('init', function ()
            {
                this.getDoc().body.style.fontSize = '12px';
                this.getDoc().body.style.textAlign = 'left';
                var cont = ed.getContent();
                if (cont.length == 0) {
                    ed.setContent(placeholder);
                    // Get updated content
                    cont = placeholder;
                } else {
                    cont = cont.replace(/(<([^>]+)>)/ig, '');
                    if (cont == attr)
                        ed.setContent(placeholder);
                    return;
                }
            });

            ed.on('click focus', function (e) {
                var cont = ed.getContent();
                cont = cont.replace(/(<([^>]+)>)/ig, '');
                cont = cont.replace(/&nbsp;/g, '');
                cont = cont.replace(/\n/g, '');
                if (cont == attr) {
                    ed.setContent('');
                    ed.selection.select(ed.getBody(), true);
                    ed.selection.collapse(false);
                }

            });
            ed.on('change', function (e) {
                $('#saveAll').removeClass('disabled');
                $('#saveAll').removeAttr("disabled");
                $('.cancelAllLink').removeClass('disabled');
                $('.cancelAllLink').removeAttr("disabled");
                $('#' + $(e.target)[0].id).parents('form').find('button.adminFormSubmit').removeAttr('disabled').removeClass('disabled');
            });
            ed.on("blur", function (e)
            {
                var cont = ed.getContent();
                cont = cont.replace(/(<([^>]+)>)/ig, '');
                cont = cont.replace(/&nbsp;/g, '');
                cont = cont.replace(/\n/g, '');
                if (cont.length == 0) {
                    ed.setContent(placeholder);
                }
                e.target.save();
            });
        }
    };
    //tinymce.init(settings);

    this.initSetClearImageObject();

    // enable submit for all admin sections
    $('#themeui_apply_changes').on('click', this.initOnClickThemeUIApplyChanges.bind(this));

    // enable submit for all admin sections
    $('#themeui_restore_default').on('click', this.initOnClickThemeUIRestore.bind(this));
    $("#selectAll").change(this.initOnChangeSelectAll.bind(this));

    //change data in forms on change of language
    $('#fieldLanguages').on('change', this.initOnChangeFieldLanguages.bind(this));

    // enable submit for all admin sections
    $('.adminFormSubmit').on('click', this.initOnClickAdminFormSubmit.bind(this));

    //save user languages status data
    $('#languagesSubmit').on('click', this.initOnClickLanguageSubmit.bind(this));

    $(".dataField , #tinymce").click(function (e) {
        var obj = $(e.target || e.srcElement);
        if (obj.val() == 'Please enter text.' || obj.val() == 'enter text..') {
            obj.val('');
        }
    });

    // initialize file upload tool
    //Lrn.Widgets.FileTool = new Lrn.Widget.FileTool();
    //Lrn.Widgets.FileTool.init();

   // Lrn.Applications.Carousel = new Lrn.Application.Carousel();
    //Lrn.Applications.Carousel.init();

    // add an event that will enable all file tool
    // launching elements to open this tool
    $('.getFile').on('click', this.initOnClickGetFile.bind(this));
    $('.cancelLink').on('click', function (e) {
        var $this = $(e.target || e.srcElement);
        var getfile = $this.siblings('.getFile');
        var replacement = getfile.html();

        if (typeof (replacement) === 'string')
            getfile.html(replacement.replace('Replace', 'Upload'));
    })

    // add an event that will hide and show carousel slides
    $('.slideTabs').live('click', this.initOnClickSlideTabs);

    // for slide toggles, we need to add a couple of elements
    // to make the UI complete. The UI will then control the
    // checked property of the checkbox.
    // By default, slide toggles are false (off).
    $('.slideToggle').each(this.initOnClickSlideToggle);

    // for dashboard
    $('.dashToggle').each(this.initOnClickDashToggle);


    //intitiate the visibility click
    this.videoTourVisibilityInit();

    // $('textarea').trigger('blur');
};

/**
 * --- INIT ADMIN LIST ---
 * For now, this method is used to just activate (or re-activate) the
 * admin list. (re-activate is for after a refresh).
 */
Lrn.Application.Admin.prototype.initAdminList = function () {
    // activate the accordion behavior for our admin items.
    // due to limitations in accordion plugin (cannot close all),
    // we must apply an accordion to EACH item, with special settings.
    // active = false makes all closed by default
    // collapsible = true allows us to close everything (enables close all)
    // heightStyle = 'content' to let the expandable size to content, not fixed.
    var adminHeader = $('.adminSectionHeader');
    var adminContent = $('.adminSectionContent');

    $('.adminSection').each(this.initAdminListEachAdminSection.bind(this));

    //clear and reset image to placeholder
    $('[class="clearLink"]:not([name="clearSlideShowImage"])').click(this.clearImage.bind(this));//function(e) {Lrn.Application.Admin.clearImage(e, $(this))});
    //call the clearImage function anytime the hidden input field changes
    this.hiddenImageInputChange($('.hiddenImageIdField'));

    //clear and reset carousel image to placeholder
    $('[name="clearSlideShowImage"]').click(this.initAdminListOnclickClearSlideShowImage.bind(this));

    $(".adminSection").accordion({
        activate: function (event, ui) {
            var active = $(this).accordion("option", "active");
            var accVal = parseInt($('#accordianOpen').val());
            var selTab = $('#selTab').val();
            var openAcc = false;
            $('#' + selTab).find(".ui-accordion").each(function () {
                if ($(this).accordion("option", "active") !== false)
                    openAcc = true;
            });
            if (active !== false) {
                accVal = accVal + 1;
                $('#accordianOpen').val(accVal);
            } else {
                accVal = accVal - 1;
                $('#accordianOpen').val(accVal);
            }
            if ((openAcc && $('#btnsCheck').val() == 'Yes') || $('#btnsCheck').val() == 'No')
                $('.updateBtns').hide();
            else {
                $('.updateBtns').show();
            }
        }
    });

    //bring back values saved in db when user clicks cancel
    $('.cancelLink').click(this.initAdminListOnclickCancelLink.bind(this));

    $('#tabs_login input').on('change', this.initAdminListOnclickEnableSave);
    $('#tabs_login textarea').on('change', this.initAdminListOnclickEnableSave);
//	$('#tabs_login select').live('change', this.initAdminListOnclickEnableSave);
    $('#tabs_login img').bind('load', function (e) {
        var $this = $(e.target || e.srcElement);
        $this.parents('form').find('.adminFormSubmit').removeClass('disabled');

        if ($('#initialLoad').val() != 'Yes') {
            $('#saveAll').removeClass('disabled');
            $('#saveAll').removeAttr("disabled");
            $('.cancelAllLink').removeClass('disabled');
            $('.cancelAllLink').removeAttr("disabled");
        }
    });

    //enable tabs
    $("#tabs_login").tabs({
        select: (function (event, ui) {
            var selectedTabTitle = $(ui.tab).attr('data-id');

            if (!$("#saveAll").hasClass("disabled") && $('#afterClose').val() == 'No' && selectedTabTitle !== "home") {
                var htmlText = '<div class="forgotSaveMsg">' +
                        '<p class="pbLabel">Don\'t forget to save</p>' +
                        '<p class="contentTextIcons font-style3">You are about to navigate away without saving your changes. You must save your changes here or you will lose them.' +
                        ' Click the Save button to save changes or the Cancel button to discard any changes on this tab that you have made since your last save.' +
                        '</p>' +
                        '</div>' +
                        '<fieldset class="updateButtons">' +
                        '<button id="dataSave" class="adminBlueBtn gradient">Save</button>' +
                        '<button id="dataCancel" class="adminCancelBtn">Cancel</button>' +
                        '</fieldset>';
                $('#userSaveSelection').html(htmlText);
                $('#userSaveSelection').dialog({
                    title: '',
                    modal: true,
                    width: 435,
                    resizable: false,
                    open: function (event, ui) {
                        $(this).parent().find('.ui-dialog-titlebar').removeClass('borderBottomMedium');
                        $(this).parent().find('.ui-dialog-titlebar').attr("style", "display:block");
                        $(this).parent().find('.ui-dialog-titlebar-close').attr("style", "display:block");
                    },
                    close: function () {
                        if ($('#saveAllCheck').val() == 'No' && $('#cancelAllCheck').val() == 'No') {
                            $('#userSaveSelection').html('');
                            $('#userSaveSelection').dialog("close");
                            $('#afterClose').val('Yes');

                            var previousTab = $('#selTabBfrId').val();
                            $('#' + previousTab).trigger('click');

                            //hide the saveAll and Cancel when there is expended section
                            if ($('div[aria-labelledby=' + previousTab + ']').find('div[aria-selected=true]').length > 0) {
                                $('.updateBtns').hide();
                            }
                        }
                    }
                });


            }
            $('#afterClose').val('No');

            if (selectedTabTitle == 'sideBar') {
                $('#my_status').removeClass('hidden');
                $('#show_completed').addClass('hidden');
            } else if (selectedTabTitle == 'myQueuePage') {
                $('#show_completed').removeClass('hidden');
                $('#my_status').addClass('hidden');
            } else {
                $('#my_status').addClass('hidden');
                $('#show_completed').addClass('hidden');
            }
            if (selectedTabTitle == 'myQueuePage') {
                $('.updateBtns').addClass('hidden');
                $('.updateBtns').hide();
                $('#btnsCheck').val('No');
            } else {
                $('.updateBtns').removeClass('hidden');
                $('.updateBtns').show();
                $('#btnsCheck').val('Yes');
                var selTab = $('#selTabBfr').val();
                var openAcc = false;
                $('#' + selTab).find(".ui-accordion").each(function () {
                    if ($(this).accordion("option", "active") !== false)
                        openAcc = true;
                });
                if ((openAcc && $('#btnsCheck').val() == 'Yes') || $('#btnsCheck').val() == 'No')
                    $('.updateBtns').hide();
                else {
                    $('.updateBtns').show();
                }
            }
            $('#selTabBfr').val($('#selTab').val());
            $('#selTabBfrId').val($('#selTabId').val());
            $('#selTab').val(selectedTabTitle);
            $('#selTabId').val($(ui.tab).attr('id'));
            if ('loginPage' == $('#' + $('#selTabBfrId').val()).data('id') && $("#saveAll").hasClass("disabled")) {

                //set back the self-reg to orinal mode
                $('#clearSelfRegist').click();
            }
            if ('home' == $('#' + $('#selTabBfrId').val()).data('id') && $("#saveAll").hasClass("disabled")) {

                //set back the self-reg to orinal mode
                Lrn.Application.Admin.populateSyncStatusTab();
            }
        }).bind(this)
    });
    //cancel Save
    $('#dataCancel').live('click', function (e) {
        e.stopPropagation();
        $('#cancelAllCheck').val('Yes');
        var selTab = $('#selTabBfr').val();
        $('#userSaveSelection').dialog("close");
        $('#' + selTab).find(".cancelLink").not("#cancelSelfRegist").each(function () {
            $(this).trigger('click');
        });
        $('#saveAll').addClass('disabled');
        $('#saveAll').attr("disabled", "disabled");
        $('.cancelAllLink').addClass('disabled');
        $('.cancelAllLink').attr("disabled", "disabled");

        //clear self Registration
        $('#' + selTab).find("#clearSelfRegist").click();
        if ('home' == $('#' + $('#selTabBfrId').val()).data('id') && $("#saveAll").hasClass("disabled")) {

            //set back the self-reg to orinal mode
            Lrn.Application.Admin.populateSyncStatusTab();
        }
    });

    $('#dataSave').live('click', function (e) {
        e.stopPropagation();
        $('#saveAllCheck').val('Yes');
        $('#userSaveSelection').dialog("close");
        var selTab = $('#selTabBfr').val();
        $('#' + selTab).find(".adminFormSubmit").each(function (idx, el) {
            if ($(el).attr('data-field') != "toggle" && !$(this).hasClass('disabled'))
                $(el).trigger('click');
        });
        $('#' + selTab).find(".themeSubmit").each(function (idx, el) {
            $(el).trigger('click');
        });
        //save self Registration
        $('#' + selTab).find("#saveSelfRegist").click();

    });

    //submit all forms inside visible div
    $('#saveAll').click(this.initAdminListOnclickSaveAll.bind(this));

    //bring back the saved values for all forms inside visible div
    $('.cancelAllLink').click(this.initAdminListOnclickCancelAllLink.bind(this));

    // call this function on click so that when we check the checkboxes
    // the accordion will not collapse
//    $('.carouselCheckbox').click(function(event){
//    	event.stopPropagation();
//    });

    $('.formField').click(function (event) {
        event.stopPropagation();
    });

    // Initialize our placeholders again
    this.initPlaceholder();
};

Lrn.Application.Admin.prototype.initPlaceholder = function () {
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
    if (ie) {
        $('[placeholder]').keyup(function () {
            var input = $(this);
            keycode = window.event.keyCode;
            if ((keycode == 8 || keycode == 46) && (input.val() == '' || input.val() == input.attr('placeholder'))) {
                input.addClass('placeholder');
                input.val(input.attr('placeholder'));
            }
        }).keydown(function () {
            var input = $(this);
            if (input.val() == input.attr('placeholder')) {
                input.val('');
                input.removeClass('placeholder');
            }
        }).keypress(function () {
            var input = $(this);
            if (input.val() == input.attr('placeholder')) {
                input.val('');
                input.removeClass('placeholder');
            }
        }).blur(function () {
            var input = $(this);
            if (input.val() == '' || input.val() == input.attr('placeholder')) {
                input.addClass('placeholder');
                input.val(input.attr('placeholder'));
            } else {
                input.removeClass('placeholder');
            }
        }).blur().parents('form').submit(function () {
            $(this).find('[placeholder]').each(function () {
                var input = $(this);
                if (input.val() == input.attr('placeholder')) {
                    input.val('');
                }
            })
        });
    }
};

/*
 * Moved closures from inside init
 */
Lrn.Application.Admin.prototype.clearLinkEnabled = [];
Lrn.Application.Admin.prototype.initAdminListOnclickEnableSave = function (e) {
    var $this = $(e.target || e.srcElement);
    $this.parents('form').find('.adminFormSubmit').removeClass('disabled');
    $('#saveAll').removeClass('disabled');
    $('#saveAll').removeAttr("disabled");
    $('.cancelAllLink').removeClass('disabled');
    $('.cancelAllLink').removeAttr("disabled");
};
Lrn.Application.Admin.prototype.initSetGetFileButton = function (i, e) {
    var getthis = $(e);
    var custom = getthis.parent().find('.customfile');
    var type = 'image';

    switch (custom.data('type')) {
        case 'doc':
            type = 'document';
            break;
        case 'vid':
            type = 'video';
            break;
    }

    if (custom.data('image')) {
        getthis.html('remove ' + type);
//		custom.on('load',function(){         	
//        	var $parent = $(this).parent();
//			var $rw = $(this).width();
//			var $rh = $(this).height();
//			var $pw = $parent.width();
//			var $ph = $parent.height();
//			
//			var $w = Math.ceil(($pw-$rw)/2);
//			var $h = Math.ceil(($ph-$rh)/2);
//			
//			$(this).css('margin-left',$w+'px');
//			$(this).css('margin-top',$h+'px');
//		})
    }

    var exists = getthis.attr('data-existed');

    if ((typeof exists === "undefined" || exists === "") && getthis[0].id !== 'video_tourthumbnail') {
        getthis.html('Upload ' + type);
    }
};
Lrn.Application.Admin.prototype.htmlDecode = function (value) {
    if (value) {
        return $('<div />').html(value).text();
    } else {
        return '';
    }
};
Lrn.Application.Admin.prototype.resetFields = function () {
    $('div#lang_data input:not(:checkbox, :radio, [name=datatype])').each(this.eachResetFields.bind(this));
    $('div#lang_data textarea').each(this.initEachLoginPageTextarea);
    $('div#lang_data img').each(this.initEachLoginPageImg);
    $('div#lang_data input:checkbox:not(.checkSlidder)').each(this.initEachLoginPageCheckbox);
    $("div#lang_data input:radio").attr("checked", false);

    var editors = tinymce.editors;

    for (var i = 0; i < editors.length; i++) {
        if ("undefined" != typeof ($('#' + editors[i].id + ':not(.dataElement)').length) && $('#' + editors[i].id + ':not(.dataElement)').length > 0) {
            var value = $('#' + editors[i].id).attr('placeholder');
            editors[i].setContent("<span style='color:#999;'>" + value + "</span>");
        }
    }
};
Lrn.Application.Admin.prototype.eachResetFields = function (idx, el) {
    var obj = $(el);

    if (obj.attr('id') != 'slideVal' &&
            obj.attr('id') != 'baseImgPath' &&
            obj.attr('name') != 'adminAction' &&
            obj.attr('id') != 'translationId' &&
            obj.attr('id') != 'selTab') {
        var value = '';

        if (value != undefined) {
            if ($.browser.msie && parseInt($.browser.version, 10) == 8) {
                value = obj.attr('placeholder');
                obj.addClass('placeholder');
            }
        } else {
            value = '';
        }
        obj.val(value).attr('oldtext', ''); // or this.value = $(this).attr('original');

        //trigger the change on the imageIdField to disable the clear button
        if (obj.hasClass('hiddenImageIdField')) {
            obj.change();
        }
    }
};
Lrn.Application.Admin.prototype.initOnError = function (e) {
    if (e.originalEvent.stopPropagation) {
        e.originalEvent.stopPropagation();
        e.originalEvent.preventDefault();
    } else {
        e.stopPropagation();
        e.preventDefault();
    }

    var vidimg = $(e.target || e.srcElement);
    var initval = vidimg.attr('initval') || 6;
    ++initval;

    var selectedFileImg = vidimg.attr('src');
    var sfiBase = selectedFileImg.substr(0, (selectedFileImg.lastIndexOf('-')));
//	if(initval < 1){
//		selectedFileImg = sfiBase + '-' + String("0000" + initval).slice(-5) + '.jpg';
//		setTimeout( function(){
//			vidimg.attr('src', selectedFileImg);
//		}, 1500);
//		vidimg.attr('initval',initval);
//	}else{
    initval = 1;
    vidimg.attr('src', CDN_IMG_URL + '/images/placeholders/video-placeholder.png');
    if (typeof this.initOnError === 'function') {
        vidimg.off('error', this.initOnError.bind(this));
        this.initOnError = false;
    }
//         vidimg.on('load', function(){
//             Lrn.Application.prototype.scaleImage(null, this);
//         })
//	}
    return false;
};
Lrn.Application.Admin.prototype.initSetClearImageObject = function () {
    for (var toggleKey = 0; toggleKey < 6; toggleKey++) {

        var slideKey = toggleKey + 1;
        var carouseltoggleObj = $('#carouseltoggle' + toggleKey);
        var carouselSlideObj = $('#slide_' + slideKey).find('.hiddenImageIdField');
        var clearImageObj = $('#slide_' + slideKey).find('[name="clearSlideShowImage"]');
        if (carouselSlideObj.val() == '') {
            this.clearLinkEnabled[toggleKey] = false;
            clearImageObj.attr('disabled', 'disabled');
            clearImageObj.addClass('disabled');
        } else {
            this.clearLinkEnabled[toggleKey] = true;
            clearImageObj.removeAttr('disabled');
            clearImageObj.attr('class', 'clearLink');
        }
    }
    return true;
}
Lrn.Application.Admin.prototype.initEachMinicolorsInput = function (idx, el) {
    var $this = $(el);
    var reHex = new RegExp('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$', 'i');
    var hexVal = new String($this.attr('value'));
    var labelVal = new String($('label[for="' + $this.attr('id') + '"]').text()).replace(':', '');
    if (!reHex.test(hexVal)) {
        this.strAlert += '\u2022 ' + labelVal + '<br />';
    }
};
Lrn.Application.Admin.prototype.initAjaxThemeUIApplyChangesResponse = function (response) {
    if (response.length > 1) {
        $('#saveinfotext').html('preferences saved!');
        setTimeout(function () {
            $('#themeui_saving_notification').fadeOut(500);
        }, 2000);
        $.colorbox.close();
    } else {
        var error = response[0] && response[0].error ? response[0].error : null;
        if (error == null) {

        }
        else {
            //flag error and report
            $('#saveinfotext').html('error - please try again');
        }

        setTimeout(function () {
            $('#themeui_saving_notification').fadeOut(500);
        }, 2000);

    }
};
Lrn.Application.Admin.prototype.initOnClickThemeUIApplyChanges = function (e) {

    $('.minicolors-input').each(this.initEachMinicolorsInput.bind(this));
    var strAlert = this.strAlert.length > 0 ? this.strAlert : false;

    if (strAlert !== false) {
        strAlert = ''
                + '<div class="themeProblem">'
                + '<p class="pbLabel">Oops! There was a problem...</p>'
                + '<p class="contentTextIcons font-style3">The following inputs were either left blank or have invalid entries:</p>'
                + '<p class="contentTextIcons font-style3">' + strAlert + '</p>'
                + '</div>';

        $("#themeui_dialog").html(strAlert);
        // $("#themeui_dialog" ).dialog( "option", "title", "Oops!  There was a problem... " );
        $("#themeui_dialog").dialog("open");
        $(".ui-widget").addClass('ui-dialogtheme');
        return false;
    }

    e.preventDefault();

    var savenotice = '<div id="saveinfo"><img src="' + CDN_IMG_URL + '/images/theme-ui/loading.gif" /><p id="saveinfotext">Saving Your Preferences...</p></div>';
    $('#themeui_saving_notification').html(savenotice);
    $('#themeui_saving_notification').fadeIn(500);

    var form = $(e.target || e.srcElement).parents('form');
    var theme = $('#themeAdvCSSText');
    var css = '&advCSS=' + encodeURIComponent($('#themeAdvCSSText').val());
    theme.text(theme.val());
    $('#advCssContainer').html(stripScripts(theme.val()));

    var formdata = form.serialize() + css;

    $.ajax({
        type: form.attr('method'),
        url: form.attr('action'),
        data: formdata,
        dataType: 'json',
//        contentType:'application/json',
        success: this.initAjaxThemeUIApplyChangesResponse,
        error: function (jqXHR, textStatus, errorThrown) {
            //do something with this
            //but if you do, move it to the prototype so
            //it can be unit-tested
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}
Lrn.Application.Admin.prototype.initOnClickThemeUIRestore = function (e) {// alert("fdgfd");
    if (this.isUnitTested !== true) {
        var msg = '<p class="contentTextIcons font-style4">WARNING:  Resetting your site theme will restore your site\'s color scheme to its default value. This cannot be undone.\n\nDo you wish to continue?</p>';
        var adminObj = this;
        // var c = confirm(msg);
        $('#themeui_dialog').html(msg);
        $('#themeui_dialog').dialog('open');
        $('#themeui_dialog').dialog({
            autoOpen: false,
            dialogClass: 'secondaryBgColor',
            width: 435,
            modal: true,
            resizable: false,
            buttons: [{text: "Ok", click: function () {
                        $(this).dialog("close");
                        var savenotice = '<div id="saveinfo"><img src="' + CDN_IMG_URL + '/images/theme-ui/loading.gif" /><p id="saveinfotext">Saving Your Preferences...</p></div>';
                        $('#themeui_saving_notification').html(savenotice);
                        $('#themeui_saving_notification').fadeIn(500);
                        e.preventDefault();
                        // var form = $(this).parents('form');
                        $.ajax({
                            dataType: 'json',
                            url: '/admin/restoredefaults',
                            success: adminObj.initOnClickThemeUIRestoreAJAXResponse.bind(adminObj),
                            error: function (errorObj) {
                                // alert(errorObj.error.message);
                                //do something with this
                                console.log(errorObj);
                            }
                        });
                    }
                },
                {text: "Cancel", click: function () {
                        $(this).dialog("close");
                        return false;
                    }
                }],
            open: function (event, ui) {
                $(this).parent().find('.ui-dialog-titlebar').hide();
            }
        });
    }
    // if (c) {
    // 	var savenotice = '<div id="saveinfo"><img src="/images/theme-ui/loading.gif" /><p id="saveinfotext">Saving Your Preferences...</p></div>';
    // 	$('#themeui_saving_notification').html(savenotice);
    // 	$('#themeui_saving_notification').fadeIn(500);  
    //     	e.preventDefault();
    //     	// var form = $(this).parents('form');
    //     	$.ajax({
    // 			dataType : 'json',
    // 			url : '/admin/restoredefaults',
    // 			success : this.initOnClickThemeUIRestoreAJAXResponse.bind(this),
    //         error: function(errorObj){
    //         	// alert(errorObj.error.message);
    //         	//do something with this
    //         	console.log(errorObj);
    //         }
    //     	});
    // } else {
    // 	return false;
    // } 

};
Lrn.Application.Admin.prototype.initOnClickThemeUIRestoreAJAXResponse = function (response) {
    var error = response.error;
    var fadeoutDelay = function () {
        $('#themeui_saving_notification').fadeOut(500);
    };
    if (error == null) {
        $('#saveinfotext').html('preferences saved!');
        setTimeout(fadeoutDelay, 2000);
        if (this.isUnitTested !== true)
            window.location.reload();
    } else {
        $('#saveinfotext').html('error - please try again');
        setTimeout(fadeoutDelay, 2000);
    }
};
Lrn.Application.Admin.prototype.initOnChangeFieldLanguages = function (e) {

    e.preventDefault();
    e.stopPropagation();
    var button = $(e.target || e.srcElement);

    // Initialize our clear image buttons again
    this.initClearLink();

    // Initialize our placeholders again
    this.initPlaceholder();

    //assign new selected language to obj
    this.lang = button.val();

    //disable the upload favicon for other language except the default one
//	if (this.defaultLanguage === this.lang){
//		$("#faviconcustomfile").removeAttr("disabled").removeClass("disabled");
//	}else{
//		$("#faviconcustomfile").attr("disabled","disabled").addClass("disabled");
//	}

    //pull data out from below config
    var sections = {
        lang: this.lang,
        sections: [
            {section: 'login', subsection: ''},
            {section: 'welcome_page', subsection: ''},
            {section: 'global_component', subsection: ''},
            {section: 'favicon', subsection: 'favicon'}
        ]
    };

    $('#langNotification').html('<p>Note: You are currently editing in ' + $('#fieldLanguages').find(":selected").text() + '</p>');
    $("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' + CDN_IMG_URL + '/images/backgrounds/ajax-loader.gif"  width=50 height=50/></span>Loading</p>');
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
    $.ajax({
        type: 'post',
        url: 'componentsdata',
        data: sections,
        dataType: 'json',
        success: this.initOnChangeFieldLanguagesAJAXResponse.bind([this, button]),
        error: function (jqXHR, textStatus, errorThrown) {
            button.removeAttr("disabled");
            $('#slideVal').val('NotSet');
            //do something with this
        }
    });


    //load self-registation data
    if (true == this.homeAction) {
        this.loadSelfRegistrationData(this.lang);
    }
};
Lrn.Application.Admin.prototype.initOnChangeFieldLanguagesAJAXResponse = function (response) {
    this[0].resetFields();
    var button = this[1];
    $('#Headertile').attr("checked", "true");
    $('#company_logoleft').attr("checked", "true");
    $('#header_taglineright').attr("checked", "true");
    $('#initialLoad').val('Yes');
    //specific condition for video tour
    var thumbnailStatus = false;
    var thumbnailUrl = '';
    var videothumbnailUrl = '';

    if (response.length > 0) {
        for (var resp = 0; resp < response.length; resp++) {
            var section = response[resp].subSection;
            var sectionType = response[resp].componentType;
            var position = response[resp].position;
            if (section == null) {
                section = response[resp].section;
            }
            var curValue = response[resp].value;
            if (position != null) {
                position = position - 1;
                var obj = $('.' + section + response[resp].componentType + '_id');
                $(obj[position]).val(response[resp].id).attr('oldtext', response[resp].id);
                var valObj = $('.' + section + sectionType);
                $(valObj[position]).removeClass('placeholder');
                $(valObj[position]).attr('data-value', curValue).attr('oldtext', curValue);
                if (sectionType == 'customfile' && null != response[resp].customFileDTO) {
                    var imageClass = section + sectionType + '_' + position;
                    var newPath = ('undefined' != typeof response[resp].customFileDTO.path ? $('#baseImgPath').val() + response[resp].customFileDTO.path : '');

                    $('img.' + imageClass).attr('src', newPath).attr('oldsrc', newPath);
                    $('input[name="' + section + sectionType + '[' + position + ']' + '"]').val(response[resp].customFileDTO.id).attr('oldtext', response[resp].customFileDTO.id).change();
                }
                if (sectionType == 'toggle') {
                    if (curValue == 'on') {
                        $('#' + section + sectionType + position).prop('checked', true);
                        $('#' + section + sectionType + position).attr('checked', 'checked').val(position);
                    }
                } else {
                    $(valObj[position]).val(curValue);
                }
                var groupIdVal = response[resp].groupId;
                var groupId = $('.' + section + 'groupId');
                $(groupId[position]).val(groupIdVal).attr('oldtext', groupIdVal);

            } else {
                $('#' + section + sectionType + '_id').val(response[resp].id).attr('oldtext', response[resp].id);
                var groupIdVal = '';
                groupIdVal = response[resp].groupId;
                var groupId = $('.' + section + 'groupId');
                $(groupId).val(groupIdVal).attr('oldtext', groupIdVal);

                if (sectionType == 'customfile' || sectionType == 'signature' || sectionType == 'thumbnail') {
                    if ('video_tour' !== section) {
                        $('img.' + section + sectionType).attr('src', $('#baseImgPath').val() + response[resp].customFileDTO.path).attr('oldsrc', $('#baseImgPath').val() + response[resp].customFileDTO.path);
                    } else {
                        if (false == thumbnailStatus) {
                            if ('thumbnail' == sectionType) {
                                thumbnailStatus = true;
                            } else if ('customfile' == sectionType) {
                                var videoImage = response[resp].customFileDTO.path;
                                var sfiBase = videoImage.substr(0, (videoImage.lastIndexOf('.')));
                                var selectedFileImg = $('#baseImgPath').val() + sfiBase + '-00002.jpg';
                                videothumbnailUrl = selectedFileImg;
                            }

                            thumbnailUrl = $('#baseImgPath').val() + response[resp].customFileDTO.path;
                        }
                    }

                    if ($('input[name="' + section + sectionType + '"]').length) {
                        $('input[name="' + section + sectionType + '"]').val(response[resp].customFileDTO.id).attr('oldtext', response[resp].customFileDTO.id).change();
                    } else {
                        $('#' + section + sectionType + '_id').siblings('input[type=hidden].hiddenImageIdField').val(response[resp].customFileDTO.id).attr('oldtext', response[resp].customFileDTO.id).change();
                    }
                }
                if (sectionType == 'toggle') {
                    if (curValue == 'on') {
                        $('#slideVal').val('FormLoad');
                        $('#' + section + sectionType).closest('div').find('.slider').click();
                    }
                }
                if (sectionType == 'left' || sectionType == 'center' || sectionType == 'right') {
                    if (curValue == 'on') {
                        $('#' + section + sectionType).prop('checked', true);
                        $('#' + section + sectionType).attr('checked', 'checked');
                    }
                }
                if (sectionType == 'tile') {
                    if ((curValue == 'off' && section == 'bg_image') || (curValue == 'on' && section != 'bg_image')) {
                        $('#' + section + sectionType).prop('checked', true);
                        $('#' + section + sectionType).attr('checked', 'checked');
                    }
                }
                if (curValue == '') {
                    if (section != 'headline' && (section != 'VIP_message' && (sectionType != 'customfile' && sectionType != 'signature')))
                        $('#' + section + sectionType).val(curValue);
                    else {
                        $('#' + section + sectionType).val(this[0].htmlDecode("<span style='color:#999;'>" + $('#' + section + sectionType).attr("placeholder") + "</span>"));
                    }
                } else {
                    if (section != 'headline' && section != 'VIP_message' && sectionType != 'left' && sectionType != 'center' && sectionType != 'right' && sectionType != 'tile')
                        $('#' + section + sectionType).val(curValue);
                    if (section == 'headline' || section == 'VIP_message') {
                        var editor = tinymce.EditorManager.get(section + sectionType);
                        if (editor != undefined)
                            editor.setContent(curValue);
                        $('#' + section + sectionType).val(curValue);
                    }
                    $('#' + section + sectionType).removeClass('placeholder');
                }
                $('#' + section + sectionType).attr('data-value', curValue);
            }
        }
    }

    //only for video tour
    if (false == thumbnailStatus) {
        if (videothumbnailUrl != '') {
            thumbnailUrl = videothumbnailUrl;
            $('#video_tourthumbnail').removeClass("disabledBtn").removeAttr("disabled");
        } else {
            //make to default image if not existed
            thumbnailUrl = CDN_IMG_URL + '/images/placeholders/video-placeholder.png';
            $('#video_tourthumbnail').addClass("disabledBtn").attr("disabled", "disabled");
        }
    } else {
        $('#video_tourthumbnail').removeClass("disabledBtn").removeAttr("disabled");
    }
    $('img.video_tourthumbnail').attr('src', thumbnailUrl);

//	$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="/images/backgrounds/done.jpg"  width=50 height=50/></span>Done</p>');
//	setTimeout(function(){
//		$("#messageModal").dialog("close");
//		button.removeClass('disabled').removeAttr('disabled');
//		button.addClass("disabled").attr("disabled", "disabled");
    $('#saveAll').addClass("disabled").attr("disabled", "disabled");
//	}, 3000);

    //checked the videotour visibility
    this[0].videoTourVisibilityCheckboxSelect(true);

    //update the clear image sliceshow status array
    this[0].initSetClearImageObject();

    //disabled save Password instructions
    $('#pwdinstSubmit').addClass('disabled').attr('disabled', 'disabled');

};

Lrn.Application.Admin.prototype.initValidateForm = function (form, buttonId) {
    var form = form.serializeArray();
    var carouselToggle = '';

    if (buttonId === 'carouselSubmit') {
        $('#' + buttonId).closest('div').find('.errormsg').hide();
        var slidesOn = 0;
        for (var i = 0; i < form.length; i++) {
            var togglename = "carouseltoggle[";
            if (form[i].name.substring(0, togglename.length) == togglename) {
                if ($("input[name=" + form[i].name.replace("[", "\\[").replace("]", "\\]") + "]").is(":checked")) {
                    slidesOn++;
                    carouselToggle = 'on';
                }
            }
            var filename = "carouselcustomfile[";

            if (form[i].name.substring(0, filename.length) == filename) {
                var toggleKey = form[i].name.substring(filename.length, filename.length + 1);
                var valObj = $('#carouseltoggle' + toggleKey);

                if (valObj.is(":checked") && form[i].value == '') {
                    $('#' + buttonId).closest('div').find('.errormsg').text('You will need to supply an image for slide ' + ++toggleKey + ' OR uncheck the Visible option for the slideshow to function properly.');
                    $('#' + buttonId).closest('div').find('.errormsg').show();
                    $('#' + buttonId).closest('div').find('.errormsg').css({'display': 'inline-block'});
                    $('#' + buttonId).removeAttr("disabled");
                    return false;
                }
            }
        }
        if (slidesOn == 1) {
//			$('#'+ buttonId).closest('div').find('.errormsg').text('Two visible slides are recommended for best results, but you may elect to upload and display only one.');
//			$('#'+ buttonId).closest('div').find('.errormsg').show();
//            $('#'+ buttonId).closest('div').find('.errormsg').css({'display': 'inline-block'});
            $('#' + buttonId).removeAttr("disabled");
            return true;
        }
        return true;
    } else if (buttonId == 'headlineSubmit') {
        if ($('#headlinetextErr').val() == 'Yes') {
            $('#headlinetextErr').val('No');
            $('#' + buttonId).removeAttr("disabled");
            return false;
        }
    } else if (buttonId == 'vipSubmit') {
        if ($('#VIP_messagetextErr').val() == 'Yes' || $('#VIP_messagetitleErr').val() == 'Yes') {
            $('#VIP_messagetextErr').val('No');
            $('#VIP_messagetitleErr').val('No');
            $('#' + buttonId).removeAttr("disabled");
            return false;
        }
    } else if (buttonId == 'btnAccessCodeSubmit') {
        this.validateAccessCode();
        if ($('#accCodeMsgErr').val() == 'Yes') {
            $('#accCodeMsgErr').val('No');
            $('#' + buttonId).removeAttr("disabled");
            return false;
        }
        return true;
    } else if (buttonId == 'btnNotifyEmailSubmit') {
        this.validateEmailList();
        if ($('#emailMsgErr').val() == 'Yes') {
            $('#emailMsgErr').val('No');
            $('#' + buttonId).removeClass("disabled").removeAttr("disabled");
            return false;
        }
        return true;
    }
    return true;
}
Lrn.Application.Admin.prototype.initClearLinkEnabledArray = function (clearLinkEnabled) {
    this.clearLinkEnabled = [];
    for (i = 0; i < 6; i++) {
        this.clearLinkEnabled[i] = true;
    }
}
Lrn.Application.Admin.prototype.initTinyMCEInit = function (ed) {
    this.getDoc().body.style.fontSize = '12px';
    this.getDoc().body.style.textAlign = 'left';
    var cont = ed.getContent();
    if (cont.length == 0) {
        ed.setContent(placeholder);
        // Get updated content
        cont = placeholder;
    } else {
        cont = cont.replace(/(<([^>]+)>)/ig, '');
        if (cont == attr)
            ed.setContent(placeholder);
        return;
    }

}

Lrn.Application.Admin.prototype.initTinyMCEClickFocus = function (e, ed) {
//	var ed = $(e.target || e.srcElement);
    var cont = ed.getContent();
    cont = cont.replace(/(<([^>]+)>)/ig, '');
    cont = cont.replace(/&nbsp;/g, '');
    cont = cont.replace(/\n/g, '');
    if (cont == attr) {
        ed.setContent('');
        ed.selection.select(ed.getBody(), true);
        ed.selection.collapse(false);
    }

};
Lrn.Application.Admin.prototype.initTinyMCEChange = function (e, ed) {
    $('#saveAll').removeClass('disabled');
    $('#saveAll').removeAttr("disabled");
    $('.cancelAllLink').removeClass('disabled');
    $('.cancelAllLink').removeAttr("disabled");
};
Lrn.Application.Admin.prototype.initTinyMCEBlur = function (e, ed) {
    e.target = e.target || e.srcElement;
    var cont = ed.getContent();
    cont = cont.replace(/(<([^>]+)>)/ig, '');
    cont = cont.replace(/&nbsp;/g, '');
    cont = cont.replace(/\n/g, '');
    if (cont.length == 0) {
        ed.setContent(placeholder);
    }
    e.target.save();
}
Lrn.Application.Admin.prototype.initTinyMCE = function (ed) {
//    ed.settings.max_chars = $('#'+ed.id).data('maxlength'); 
    if (ed.id == "header_taglinetitle") {
        ed.settings.toolbar = ed.settings.toolbar.replace('\| bullist ', '');
    }
    var tinymce_placeholder = $('#' + ed.id);
    var attr = tinymce_placeholder.attr('placeholder');
    var placeholder = '<span style="color: #999;">' + attr + '</span>';
    ed.on('init', function () {
        this.initTinyMCEInit(ed);
    });

    ed.on('click focus', function (e) {
        this.initTinyMCEClickFocus(e, ed);
    }.bind(this));
    ed.on('change', function (e) {
        this.initTinyMCEChange(e, ed);
    }.bind(this));
    ed.on("blur", function (e) {
        this.initTinyMCEBlur(e, ed);
    }.bind(this));
}
Lrn.Application.Admin.prototype.initOnChangeSelectAll = function (e) {
    var status = $(e.target || e.srcElement).attr("checked") ? "checked" : false;
    $(".languagetoggle").attr("checked", status);
    $(":checkbox[data-check=default]").attr("checked", "true");
};
Lrn.Application.Admin.prototype.initEachLoginPageTextarea = function (idx, el) {
    var value = '';
    var $this = $(el);

    if ($this.attr('id') != 'pwdinstructiontext') {
        if ($this.attr('id') == 'headlinetext') {
            $this.val("<span style='color:#999;'>" + value + "</span>");
        }
        else {
            if ($.browser.msie && parseInt($.browser.version, 10) == 8) {
                value = $this.attr('placeholder');
                $this.addClass('placeholder');
            }

            $this.val(value);
            $('#' + $this.attr('id')).html('');
        }
    }
};
Lrn.Application.Admin.prototype.initEachLoginPageImg = function (idx, el) {
    var img = $(el);
    var imgDefSrc = img.attr('data-placeholder');
    if (imgDefSrc != undefined) {
        img.attr('src', imgDefSrc);
        img.attr('alt', imgDefSrc).attr('oldsrc', imgDefSrc);
    }
};
Lrn.Application.Admin.prototype.initEachLoginPageCheckbox = function (idx, el) {
    var elem = $(el);
    if (elem.is(":checked")) {
        if (elem.hasClass('slideToggle')) {
            $('#slideVal').val('FormLoad');
            elem.closest('div').find('.slider').click();
        } else {
            elem.prop('checked', false);
            elem.removeAttr('checked');
        }
    }

};
Lrn.Application.Admin.prototype.initOnClickAdminFormSubmit = function (e) {
    e.preventDefault();
    e.stopPropagation();
    var button = $(e.target || e.srcElement);
    var form = button.parents('form');
    var formName = $(form).attr('name');
    button.attr("disabled", "disabled");

    if (this.initValidateForm(form, button[0].id)) {
        //tinymce.triggerSave();
        //if(formName != 'vipMessageForm' && formName != 'headlineForm')
        form.find('textarea').each(this.initOnClickAdminFormSubmitEachTextarea.bind(this));

        //make sure placeholder nerver submit
        form.find('input[type=text]').each(this.initOnClickAdminFormSubmitEachTextInput.bind(this));
        if ($('#slideVal').val() != 'fromtoggle') {
            $("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' + CDN_IMG_URL + '/images/backgrounds/ajax-loader.gif"  width=50 height=50/></span>Saving</p>');
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
        var selLanguage = $('#fieldLanguages').val();
        if (selLanguage == undefined) {
            selLanguage = this.deflang;
        }
        var data = form.serialize();
        var mode = '';
        var vcSettings = $("#vcSettings").val();
        if(formName == 'vc_auto_user_createForm'){
            vcSettings = "No";
        }
        if (vcSettings == "Yes") {
            if (data.search("txtAccessCode") > 0) {
                data = $("#txtAccessCode").val();
                mode = "accessCode";
            }
            if (data.search("txtNotificationEmail") > 0) {
                data = $("#txtNotificationEmail").val();
                mode = "email";
            }

            this.sendServerRequest(data, mode);
        }
        else {
            data = data + '&Language=' + selLanguage;

            $.ajax({
                type: form.attr('method'),
                url: form.attr('action'),
                data: data,
                dataType: 'json',
                success: this.initOnClickAdminFormSubmitAJAXResponse.bind([this, button]),
                error: function (jqXHR, textStatus, errorThrown) {
                    button.removeAttr("disabled");
                    $('#slideVal').val('NotSet');
                }
            });
        }
    } else {
        button.removeAttr('disabled');
        if ($("#vcSettings").val() == "Yes" && $("#tabs_login .ui-tabs-panel:visible").attr("id") != 'home') {
            if (!$('#errorMsgNotificationEmail').val() || !$('#errorAccessText').val()) {
                $("#tabs_login").tabs("option", "active", $("#tabs_login").tabs('option', 'active') - 1);
            }
        }
    }
};
/**
 * initOnClickAdminFormSubmitAJAXResponse -- AJAX/REST callback triggered from initOnClickAdminFormSubmit
 *  
 *                   ******NOTE******* 
 * We expect context of this to be an array containing the Lrn.Application.Admin 
 * object and the button that triggered the REST request
 * 
 * Example:
 
 $.ajax({
 type: form.attr('method'),
 url: form.attr('action'),
 data: data,
 dataType: 'json',
 success: this.initOnClickAdminFormSubmitAJAXResponse.bind([this,button]),
 
 });
 * 
 */
Lrn.Application.Admin.prototype.initOnClickAdminFormSubmitAJAXResponse = function (response) {
    var button = this[1];
    var form = button.parents('form');

    //remove existing Ids if the components are deleted
    if ("undefined" != typeof response.deleteList && response.deleteList.length > 0) {
        for (var i = 0; i < response.deleteList.length; i++) {
            if (true == response.deleteList[i].success) {
                //clear all the related form components when the component got deleted
                $('#' + response.deleteList[i].id).val('').attr('oldtext', '');
                $('#' + response.deleteList[i].valuefieldId).val('').attr('oldtext', '');
                $('#' + response.deleteList[i].id).siblings('input[type=hidden].hiddenImageIdField').val('').attr('oldtext', '');
            }
        }
    }

    //var error = false ;
    if (response.length > 1) {
        for (var res in response) {
            var resNo = parseInt(res);
            if (!isNaN(resNo)) {
                var groupIdVal = '';
                var error = response[resNo].error;
                //var success = response[resNo].success;
                var section = '';
                if (error == null) {
                    if (response[resNo] && response[resNo].dataObject && response[resNo].dataObject.componentSettings && response[resNo].dataObject.componentSettings.ComponentSettingDTO && response[resNo].dataObject.componentSettings.ComponentSettingDTO.length) {
                        for (var resp = 0; resp < response[resNo].dataObject.componentSettings.ComponentSettingDTO.length; resp++) {
                            section = response[resNo].dataObject.componentSettings.ComponentSettingDTO[resp].subSection;
                            var position = response[resNo].dataObject.componentSettings.ComponentSettingDTO[resp].position;
                            var curValue = response[resNo].dataObject.componentSettings.ComponentSettingDTO[resp].value;
                            --position;
                            var obj = $('.' + section + response[resNo].dataObject.componentSettings.ComponentSettingDTO[resp].componentType + '_id');
                            $(obj[position]).val(response[resNo].dataObject.componentSettings.ComponentSettingDTO[resp].id).attr('oldtext', response[resNo].dataObject.componentSettings.ComponentSettingDTO[resp].id);
                            var valObj = $('.' + section + response[resNo].dataObject.componentSettings.ComponentSettingDTO[resp].componentType);
                            if (curValue == '')
                                $(valObj[position]).val(curValue);
                            $(valObj[position]).attr('data-value', curValue).attr('oldtext', curValue);
                            groupIdVal = response[resNo].dataObject.componentSettings.ComponentSettingDTO[resp].groupId;
                            var groupId = $('.' + section + 'groupId');
                            $(groupId[position]).val(groupIdVal);
                        }
                    }
                    form.find('.imageWrap').find('img').removeAttr('oldsrc');
                } else {
                    error = true;
                    //flag error and report
                    alert('An error occurred');
                }
            } else if (typeof (response[res]) === "object") {
                var dto = response[res].dataObject &&
                        response[res].dataObject.componentSettings &&
                        response[res].dataObject.componentSettings.ComponentSettingDTO &&
                        (response[res].dataObject.componentSettings.ComponentSettingDTO.length
                                || "object" == typeof response[res].dataObject.componentSettings.ComponentSettingDTO) ?
                        response[res].dataObject.componentSettings.ComponentSettingDTO : false;

                var updateHidden = function (dto, append, value) {
                    var hiddenField = $('input[name="' + res + '\\[' + dto.subSection + dto.componentType + append + '\\]"]');
                    var hiddenGroupIdField = $('#' + dto.subSection + 'groupId');

                    if (hiddenField.length > 0) {
                        hiddenField.attr('value', dto[value]);
                        hiddenField.attr('oldtext', dto[value]);
                    }

                    if (hiddenGroupIdField.length > 0) {
                        hiddenGroupIdField.attr('value', dto.groupId).attr('oldtext', dto.groupId);
                    }
                }

                if (false !== dto) {
                    if (dto instanceof Array) {
                        for (var i = 0; i < dto.length; ++i) {
                            updateHidden(dto[i], '', 'value');
                            updateHidden(dto[i], '_id', 'id');
                        }
                    } else {
                        updateHidden(dto, '', 'value');
                        updateHidden(dto, '_id', 'id');
                    }
                }
            }
        }
        if (!error && $('#slideVal').val() != 'fromtoggle') {
            $("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' + CDN_IMG_URL + '/images/backgrounds/done.jpg"  width=50 height=50/></span>Saved</p>');
            setTimeout(function () {
                $("#messageModal").dialog("close");
            }, 1000);
        } else {
            $('#slideVal').val('NotSet');
        }
        button.removeAttr("disabled").addClass("disabled");
        $('#initialLoad').val('Yes');
        $('#saveAll').addClass('disabled');
        $('#saveAll').attr("disabled", "disabled");
        $('.cancelAllLink').addClass('disabled');
        $('.cancelAllLink').attr("disabled", "disabled");
        $('#saveAllCheck').val('No');
        $('#cancelAllCheck').val('No');

    } else {
        var error = response[0].error;
        //var success = response[0].success;
        if (response[0].dataObject && response[0].dataObject.componentSettings && response[0].dataObject.componentSettings.ComponentSettingDTO) {
            if (response[0].dataObject.componentSettings.ComponentSettingDTO.length == undefined) {
                var section = response[0].dataObject.componentSettings.ComponentSettingDTO.subSection;

                var sectionType = response[0].dataObject.componentSettings.ComponentSettingDTO.componentType;
                if (section == null) {
                    section = response[0].dataObject.componentSettings.ComponentSettingDTO.section;
                }
                $('#' + section + sectionType + '_id').val(response[0].dataObject.componentSettings.ComponentSettingDTO.id).attr('oldtext', response[0].dataObject.componentSettings.ComponentSettingDTO.id);
                // $('#'+section + sectionType +'_id').html(response[0].dataObject.componentSettings.ComponentSettingDTO.id);

                $('#' + section + sectionType).val(response[0].dataObject.componentSettings.ComponentSettingDTO.value).attr('oldtext', response[0].dataObject.componentSettings.ComponentSettingDTO.value);
                //check to see if there is a toggle for this
                //if(response[0].dataObject.componentSettings.ComponentSettingDTO.componentType == "toggle"){
                //$('#'+section+'Toggle_id').val(response[0].dataObject.componentSettings.ComponentSettingDTO.id);
                var groupIdVal = '';
                groupIdVal = response[0].dataObject.componentSettings.ComponentSettingDTO.groupId;
                var groupId = $('.' + section + 'groupId');
                $(groupId).val(groupIdVal);
            }
            else {
                for (var resp = 0; resp < response[0].dataObject.componentSettings.ComponentSettingDTO.length; resp++) {
                    var section = response[0].dataObject.componentSettings.ComponentSettingDTO[resp].subSection;
                    var sectionType = response[0].dataObject.componentSettings.ComponentSettingDTO[resp].componentType;
                    var position = response[0].dataObject.componentSettings.ComponentSettingDTO[resp].position;
                    if (section == null) {
                        section = response[0].dataObject.componentSettings.ComponentSettingDTO[resp].section;
                    }
                    var curValue = response[0].dataObject.componentSettings.ComponentSettingDTO[resp].value;
                    if (position != null) {
                        position = position - 1;
                        var obj = $('.' + section + response[0].dataObject.componentSettings.ComponentSettingDTO[resp].componentType + '_id');
                        $(obj[position]).val(response[0].dataObject.componentSettings.ComponentSettingDTO[resp].id).attr('oldtext', response[0].dataObject.componentSettings.ComponentSettingDTO[resp].id);

                        var valObj = $('.' + section + sectionType);
                        //if(curValue == '')
                        $(valObj[position]).val(curValue).attr('oldtext', curValue);

                        $(valObj[position]).attr('data-value', curValue);
                        var groupIdVal = response[0].dataObject.componentSettings.ComponentSettingDTO[resp].groupId;
                        var groupId = $('.' + section + 'groupId');
                        $(groupId[position]).val(groupIdVal);

                        //if it is file object update the hidden field which is store the id of file as well
                        if ("undefined" != typeof response[0].dataObject.componentSettings.ComponentSettingDTO[resp].customFileDTO
                                && null != response[0].dataObject.componentSettings.ComponentSettingDTO[resp].customFileDTO) {
                            $('input[type=hidden][name=' + $(obj[position]).attr('name').replace("_id", "").replace("[", "\\[").replace("]", "\\]") + ']').val(curValue).attr('oldtext', curValue);
                        }
                    } else {
                        $('#' + section + sectionType + '_id').val(response[0].dataObject.componentSettings.ComponentSettingDTO[resp].id).attr('oldtext', response[0].dataObject.componentSettings.ComponentSettingDTO[resp].id);
                        var groupIdVal = '';
                        groupIdVal = response[0].dataObject.componentSettings.ComponentSettingDTO[resp].groupId;
                        var groupId = $('.' + section + 'groupId');
                        $(groupId).val(groupIdVal);
                        if (curValue == '') {
                            if (section != 'headline')
                                $('#' + section + sectionType).val(curValue);
                            else {
                                $('#' + section + sectionType).val("<span style='color:#999;'>" + $('#' + section + sectionType).attr("placeholder") + "</span>");
                            }
                        }

                        //if it is file object update the hidden field which is store the id of file as well
                        if ("undefined" != typeof response[0].dataObject.componentSettings.ComponentSettingDTO[resp].customFileDTO
                                && null != response[0].dataObject.componentSettings.ComponentSettingDTO[resp].customFileDTO) {
                            $('input[type=hidden][name=' + section + sectionType + ']').val(curValue).attr('oldtext', curValue);
                        }


                        $('#' + section + sectionType).attr('data-value', curValue).attr('oldtext', curValue);
                    }
                }

                //temporary fix
                if ("undefined" !== typeof response.adminAction && "updateCarouselItems" == response.adminAction) {
                    if ($('#fieldLanguages').length) {
                        $('#fieldLanguages').change();
                    } else {
                        if (this[0].isUnitTested !== true)
                            location.reload();
                    }
                }
            }
            if ($('#slideVal').val() != 'fromtoggle') {
                $("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' + CDN_IMG_URL + '/images/backgrounds/done.jpg"  width=50 height=50/></span>Saved</p>');
                if ($("#messageModal").is(':data(dialog)')) {
                    setTimeout(function () {
                        $("#messageModal").dialog("close");
                    }, 1000);
                }
            } else {
                $('#slideVal').val('NotSet');
            }
        }
        else {
            //flag error and report
            alert('An error occurred', response);
            $('#slideVal').val('NotSet');

            setTimeout(function () {
                $("#messageModal").dialog("close");
            }, 1000);
        }
        button.removeAttr("disabled").removeClass('disabled');
        $('#initialLoad').val('Yes');
        $('#saveAll').addClass('disabled');
        $('#saveAll').attr("disabled", "disabled");
        $('.cancelAllLink').addClass('disabled');
        $('.cancelAllLink').attr("disabled", "disabled");
        $('#saveAllCheck').val('No');
        $('#cancelAllCheck').val('No');
    }

};
Lrn.Application.Admin.prototype.initOnClickAdminFormSubmitEachTextarea = function (idx, el) {

    var $el = $(el);
    var val = $el.val();
    var tagStripper = $('<div>');
    tagStripper.html(stripScripts(val));
    val = tagStripper.text();

    if (val === $el.attr('placeholder')) {
        val = "";
        $el.attr('data-value', '');
        $el.val(val);
    }

};
Lrn.Application.Admin.prototype.initOnClickAdminFormSubmitEachTextInput = function (idx, el) {
    if ("undefined" != typeof $(el).attr('placeholder') && $(el).val() === $(el).attr('placeholder')) {
        $(el).val('');
    } else {
        $(el).attr('oldtext', $(el).val());
    }
};
Lrn.Application.Admin.prototype.initOnClickSlideTabs = function (e) {
    //var slide = $(this);
    var id = $(e.target || e.srcElement).attr('id');

    for (var i = 1; i <= 6; i++) {
        if (id == 'slideTab' + i) {
            $('#slide_' + i).show();

            $('.slideTabs').removeClass('selected');
            $('#slideTab' + i).addClass('selected');
        } else {
            $('#slide_' + i).hide();

        }
    }
};
Lrn.Application.Admin.prototype.initOnClickSlideToggle = function (index, element) {
    // a var to refer back to the checkbox
    var slideToggle = $(element);

    // create a slide toggle wrapper (to hold the slider)
    var slideWrapper = document.createElement('div');
    slideWrapper.className = 'slideToggleWrapper ui-corner-all';
    slideToggle.after(slideWrapper);

    // element for the true side (turn on)
    var trueSide = document.createElement('span');
    trueSide.className = 'trueSide ui-corner-left';
    $(trueSide).html($(this).attr('show-label') || 'ON');
    $(slideWrapper).append(trueSide);

    // element for false side (turn off)
    var falseSide = document.createElement('span');
    falseSide.className = 'falseSide ui-corner-right';
    $(falseSide).html($(this).attr('hide-label') || 'OFF');
    $(slideWrapper).append(falseSide);

    // element to slide back and forth
    var slider = document.createElement('span');
    slider.className = 'slider ui-corner-all';
    $(slideWrapper).append(slider);

    // first click turns on, second turns off
    $(slider).toggle(function (e) {
        slideToggle.prop('checked', true);
        slideToggle.attr('checked', 'checked');
        $('.enabledMsg').hide();
        $('.disabledMsg').show();
        $(this).animate({left: '50px'});
        $(slider).css({'padding-left': '10px'}); //, 'width': '35px'
        if ($('#slideVal').val() == 'FormLoad') {
            $('#slideVal').val('NotSet');
        } else {
            $('#slideVal').val('fromtoggle');
            var form = $(this).parents('form');
            $($(form).find('.adminFormSubmit')).trigger('click');
        }
    },
            function (e) {
                slideToggle.prop('checked', false);
                slideToggle.removeAttr('checked');
                $(this).animate({left: 0});
                if ($('#slideVal').val() == 'FormLoad') {
                    $('#slideVal').val('NotSet');
                } else {
                    $('#slideVal').val('fromtoggle');
                    var form = $(this).parents('form');
                    $($(form).find('.adminFormSubmit')).trigger('click');
                }
            });

    if ($(this).is(':checked')) {
        $('#slideVal').val('FormLoad');
        $(slider).click();
    }

    // hide the checkbox from the user
    $(this).hide();
};
Lrn.Application.Admin.prototype.initOnClickGetFile = function (e) {
    e.preventDefault();
    var $this = $(e.target || e.srcElement);
    var fileObj = $this.attr('id');
    var fileObj1 = fileObj;
    var buttonTagName = $this.attr('name');
    var name = fileObj.substring(0, 8);

    var rex = buttonTagName.match(/[\[]+/);
    if (!rex || rex.length === 0) {
        buttonTagName = false;
    }
    if (name == 'carousel') {
        var result = fileObj.split('[');
        fileObj1 = result[0];
        result = result[1].split(']')[0];
        fileObj1 += '_';
        fileObj1 += result;
    }
    var getfile = 'No';
    if (name == 'newresou') {
        getfile = 'Yes';
    }
    var thumObjName = fileObj.replace('customfile', 'thumbnail');

    if (buttonTagName !== false) {
        buttonTagName = buttonTagName.match(/[^\[]+/)[0];
        if (buttonTagName != 'carouselcustomfile') {
            thumObjName = buttonTagName + "[" + fileObj + "_id]";
            fileObj = buttonTagName + "[" + fileObj + "]";
        }
        buttonTagName = fileObj;
    } else {
        buttonTagName = $this.attr('name');
    }

    var fixed = false;

    var nearimg = $this.closest('div').find('img.' + fileObj1);
//	var regx = new RegExp(nearimg[0].id);
//	
//    for(var i=0,l=this.fixedImageWhitelist;i<l;++i){
//    	if(this.fixedImageWhitelist.match(regx)){
//    		fixed = true;
//    		break;
//    	}
//    }

    Lrn.Widgets.FileTool.updateConfigs({
        cropWidth: $this.data('width'),
        cropHeight: $this.data('height'),
        returnField: $this.siblings('input[name="' + fileObj + '"]'),
        returnFieldThumb: $this.siblings('input[name="' + thumObjName + '"]'),
        returnImg: nearimg,
        configType: $this.data('type'),
        getfile: getfile,
        clickThumbnailButton: $this.siblings('button[name="' + thumObjName + '"]'),
        fixedSize: fixed
    });
    Lrn.Widgets.FileTool.open();
    $('#initialLoad').val('No');

    var titlebar = $(".ui-dialog-titlebar");
    titlebar.show();
    $('.ui-dialog-titlebar-close', titlebar).show();
//    $(".ui-dialog-titlebar", ui.dialog).show();

    if (this.isUnitTested !== true) {
        //set file type
        frontFileTool.setFileType($this.data('type'));
        frontFileTool.setCropHeightWidth($this.data('height'), $this.data('width'));
        frontFileTool.fixedSize = fixed;
        frontFileTool.refreshTab();
    }
//    var custom = $(this);//$(this).parent().find('.customfile');
    var type = 'image';

    if ('noLabelChange' == $this.data('property')) {
        return;
    }

    switch ($this.data('type')) {
        case 'doc':
            type = 'document';
            break;
        case 'vid':
            type = 'video';
            break;
    }
}
Lrn.Application.Admin.prototype.initOnClickLanguageSubmit = function (e) {
    e.preventDefault();
    var button = $(e.target || e.srcElement);
    var form = button.parents('form');
    var data = form.serialize();
    $("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' + CDN_IMG_URL + '/images/backgrounds/ajax-loader.gif"  width=50 height=50/></span>Saving</p>');
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


    $.ajax({
        type: form.attr('method'),
        url: form.attr('action'),
        data: data,
        dataType: 'json',
        success: this.initOnClickLanguageSubmitAJAXResponse.bind([this, button]),
        error: function (jqXHR, textStatus, errorThrown) {
            button.removeAttr("disabled");
            //do something with this
        }
    });
};
Lrn.Application.Admin.prototype.initOnClickLanguageSubmitAJAXResponse = function (response) {
    $("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' + CDN_IMG_URL + '/images/backgrounds/done.jpg"  width=50 height=50/></span>Saved</p>');
    setTimeout(function () {
        $("#messageModal").dialog("close");
    }, 200);
    this[1].removeAttr("disabled");

};
/*
 * InitAdminList methods
 */

Lrn.Application.Admin.prototype.initAdminListEachAdminSection = function (idx, el) {
    var $this = $(el);
    $this.accordion({
        active: false,
        collapsible: true,
        header: $('.adminSectionHeader'),
        heightStyle: $('.adminSectionContent')
    });

    var preserveInput = function (index, elm) {
        var $this = $(elm);
        var text = $this.val().replace(/^\s+|\s+$/g, '');
        $this.val(text);
        if (text.length == 0)
            text = $this.attr('placeholder');
        $this.attr('oldtext', text);
    }
    $this.find('input').each(preserveInput);
    $this.find('textarea').each(preserveInput);
}
Lrn.Application.Admin.prototype.initAdminListOnclickClearSlideShowImage = function (e) {
    $this = $(e.target || e.srcElement);
    var carouselFieldset = $this.closest('fieldset');
    var clearCarouselImage = carouselFieldset.find("input[name|='clearCarouselImage']");
    var clearCarouselImageName = clearCarouselImage.attr('name');
    var clearCarouselImageNameSplit = clearCarouselImageName.split('-');
    var clearCarouselImageNameNumber = clearCarouselImageNameSplit[1];

    if (!this.clearLinkEnabled[clearCarouselImageNameNumber]) {
        return false;
    }

    //Lrn.Application.Admin.clearImage(e, $(this));
    this.clearImage(e);

    clearCarouselImage.val("Y");
    $this.siblings('.getFile').html('Upload image');

    return false;
}
Lrn.Application.Admin.prototype.initAdminListOnclickCancelLink = function (e) {
    e.stopPropagation();
    var obj = $(e.target || e.srcElement);

    var form = obj.parents('form');
    var component = obj.attr('data-id');
    $('.errormsg').hide();

    form.find('input').each(this.initAdminListOnclickCancelLinkEachReplaceInput.bind(this));
    form.find('textarea').each(this.initAdminListOnclickCancelLinkEachReplaceInput.bind(this));

    form.find('.imageWrap').find('img').each(function (idx, el) {
        var img = $(el);
        if (typeof (img.attr('oldsrc')) != 'undefined') {
            img.attr('src', img.attr('oldsrc'));
        }
    });

    $('#cancelAllCheck').val('No');
    $('#initialLoad').val('Yes');

    $('.adminSection').accordion('activate', false);
    $('#saveAll').addClass('disabled');
    $('#saveAll').attr("disabled", "disabled");
    $('.cancelAllLink').addClass('disabled');
    $('.cancelAllLink').attr("disabled", "disabled");
    this.initClearLink();
    form.find('.getFile').each(this.initSetGetFileButton.bind(this));
    if ($("#txtAccessCode").val()) {
        $("#messageModal").dialog("close");
    }
    //disable the password instruction when clicking cancell
    if ('pwdinstructiontexts' == obj.data('id')) {
        $('#pwdinstSubmit').addClass('disabled').attr('disabled', 'disabled');
    }
    if ($("#txtAccessCode").val()) {
        $("#divFileDownload").removeClass('ie8BtnInactive');
        $("#btnFileDownload").removeClass('disabled').removeClass('inactive').removeAttr('disabled').addClass('active');
    }

    return false;
};

Lrn.Application.Admin.prototype.initAdminListOnclickCancelLinkEachReplaceInput = function (idx, el) {
    var $this = $(el);
    var form = $this.parents('form');
    if ($this.attr('id') == 'headlinetext' ||
            $this.attr('id') == 'VIP_messagetitle' ||
            $this.attr('id') == 'VIP_messagetext' ||
            $this.attr('id') == 'header_taglinetitle' ||
            $this.attr('id') == 'video_tourtitle' ||
            $this.attr('id') == 'video_tourtext' ||
            $this.attr('id') == 'carouseltitle[]' ||
            $this.attr('id') == 'carouseltext[]') {
        var editor = tinymce.EditorManager.get($this.attr('id'));
        if (editor != undefined)
            editor.setContent($this.attr('oldtext'));
    } else if (form.attr('name') == 'imageCarouselForm') {
        var img = form.find('img').each(function (i, el) {
            if ($(el).attr('src') != $(el).attr('oldsrc')) {
                $(el).attr('src', $(el).attr('oldsrc'));
            }
        });
    }
    if ($("#txtAccessCode").val() === "")
        $("#btnFileDownload").addClass('disabled').attr('disabled', 'disabled');
    //check if it is the checkbox
    if ($this.is(':checkbox')) {
        if ('on' == $this.attr('oldtext')) {
            $this.prop('checked', true).attr('checked', 'checked');
        } else {
            $this.prop('checked', false).removeAttr('checked');
        }
    }

    $this.val($this.attr('oldtext'));

    //reset the videoTour visibility
    if ('video_tourvisibility' == $this.attr('id')) {
        this.videoTourVisibilityCheckboxSelect(false);
    }
    var ie = (function () {
        var undef, v = 3, div = document.createElement('div');

        while (
                div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
                div.getElementsByTagName('i')[0]
                )
            ;

        return v > 4 ? v : undef;

    }());
    if (ie && ($this.attr('id') == 'txtAccessCode' ||
            $this.attr('id') == 'txtNotificationEmail')) {
        if ($this.attr('oldtext') == "" || $this.attr('oldtext') == null) {
            $this.val($this.attr("placeholder"));
            $this.addClass('placeholder');
        }
    }
}

Lrn.Application.Admin.prototype.initAdminListOnclickSaveAll = function (e) {

    var $this = $(e.target || e.srcElement);
    e.stopPropagation();
    $('#saveAllCheck').val('Yes');
    var selTab = $('#selTab').val();
    $('#' + selTab).find(".adminFormSubmit").each(function (idx, el) {
        var $el = $(el);
        if ($el.attr('data-field') != "toggle" && !$(this).hasClass('disabled') && $el.attr('id') !== 'vc_auto_user_create_submit') {
            $el.trigger('click');
        }
    });

    //save self Registration
    $('#' + selTab).find("#saveSelfRegist").click();

    $('#' + selTab).find(".themeSubmit").each(function (idx, el) {
        $(el).trigger('click');
    });
}

Lrn.Application.Admin.prototype.initAdminListOnclickCancelAllLink = function (e) {
    var $this = $(e.target || e.srcElement);
    e.stopPropagation();
    $('#cancelAllCheck').val('Yes');
    var selTab = $('#selTab').val();
    $('#' + selTab).find(".cancelLink").each(function (idx, el) {
        $(el).trigger('click');
    });

    //clear self Registration
    $('#' + selTab).find("#clearSelfRegist").click();

    $this.addClass("disabled").attr("disabled", "disabled")
    $('#saveAll').addClass('disabled');
    $('#saveAll').attr("disabled", "disabled");
    $('.cancelAllLink').addClass('disabled');
    $('.cancelAllLink').attr("disabled", "disabled");
}
/*
 * helper functions
 */

Lrn.Application.Admin.prototype.videoTourVisibilityInit = function () {

    //initiat the checkbox
    this.videoTourVisibilityCheckboxSelect(true);

    $('#videoTourVisibility').find('input[type=checkbox]').click(function () {
        var visibleArray = [];

        $('#videoTourVisibility').find('input[type=checkbox]').each(function () {
            if ($(this).is(':checked')) {
                visibleArray.push($(this).data('value'));
            }
        });

        if (visibleArray.length > 0) {
            $('#video_tourvisibility').val(JSON.stringify(visibleArray));
            this.videoTourVisibilityCheckboxSelect(false);
        } else {
            $('#video_tourvisibility').val('');
        }
    }.bind(this));
}

Lrn.Application.Admin.prototype.videoTourVisibilityCheckboxSelect = function (setOldValue) {
    //clean all the check box first
    $('#videoTourVisibility').find('input[type=checkbox]').each(function () {
        $(this).removeAttr("checked");
    });

    if ("undefined" != typeof $('#video_tourvisibility').val() && $('#video_tourvisibility').val().length > 0) {
        var visibilityArray = JSON.parse($('#video_tourvisibility').val());

        $('#videoTourVisibility').find('input[type=checkbox]').each(function () {
            if (true == setOldValue) {
                $(this).attr('oldtext', false);
            }

            //fix IE8 not support indexOf function
            if (!Array.prototype.indexOf) {
                Array.prototype.indexOf = function (obj, fromIndex) {
                    if (fromIndex == null) {
                        fromIndex = 0;
                    } else if (fromIndex < 0) {
                        fromIndex = Math.max(0, this.length + fromIndex);
                    }
                    for (var i = fromIndex, j = this.length; i < j; i++) {
                        if (this[i] === obj)
                            return i;
                    }
                    return -1;
                };
            }

            if (-1 != visibilityArray.indexOf($(this).data('value'))) {
                $(this).attr("checked", "checked");
                if (true == setOldValue) {
                    $(this).attr('oldtext', true);
                }
            }
        });
    }
}


/*
 * We want to initialize our Clear Image buttons so that they will
 * be disabled or enabled by default when the Admin visits the 
 * admin section.
 */
Lrn.Application.Admin.prototype.initClearLink = function () {
    $('.clearLink').each(this.initClearLinkEachClearLink.bind(this));
}

Lrn.Application.Admin.prototype.initClearLinkEachClearLink = function (idx, el) {
    var parentEl = $(el).parent('fieldset');
    var siblingEl = parentEl.siblings('.imageWrap, .slideshowImgWrap, .videoImg');
    var imageEl = siblingEl.find('img');

    var slideParent = $(el).parent('div.slide');
    if (imageEl.attr('src') == imageEl.attr('data-placeholder')) {
        $(el).addClass('disabled').attr('disabled', 'disabled');
    } else {
        $(el).removeClass('disabled').removeAttr('disabled');
    }
};
/*
 * This does the main lifting for our clear image buttons.  This is triggered
 * by a click event on the clearImage button.
 */
Lrn.Application.Admin.prototype.clearImage = function (event) {
    var currentElement = $(event.target || event.srcElement);
    event.stopPropagation();
    var imgToClear = currentElement.closest('div').find('img');
    if (imgToClear.attr('src') != imgToClear.attr('data-placeholder')) {
        $('#saveAll').removeClass('disabled');
        $('#saveAll').removeAttr("disabled");
        $('.cancelAllLink').removeClass('disabled');
        $('.cancelAllLink').removeAttr("disabled");
        currentElement.addClass('disabled').attr('disabled', 'disabled');
    } else {
        currentElement.addClass("disabled").attr("disabled", "disabled");
        $('#saveAll').addClass("disabled").attr("disabled", "disabled");
        $('.cancelAllLink').addClass("disabled").attr("disabled", "disabled");
    }

    imgToClear.attr('src', imgToClear.attr('data-placeholder'));
    imgToClear.css('margin', '0');
    var classList = imgToClear.attr('class').split(/\s+/);
    var parentClass = imgToClear.attr('formparent');

    for (var i = 0; i < classList.length; i++) {
        if (classList[i] !== 'customfile') {
            var inputname = parentClass.length > 0 ? parentClass + "[" + classList[i] + "]" : classList[i];
            $('input[name="' + inputname + '"]').val('');
            currentElement.siblings('input.hiddenImageIdField').val('');
        } else if (inputname == 'bg_image[bg_imagecustomfile]') {
            $('input[name="bg_imagecustomfile"]').val('');
        } else if (inputname == 'VIP_messagecustomfile[VIP_messagecustomfile]') {
            $('input[name="VIP_messagecustomfile"]').val('');
        } else if (inputname == 'VIP_messagesignature[VIP_messagesignature]') {
            $('input[name="VIP_messagesignature"]').val('');
        }
    }
}

/*
 * We want our clear image buttons to init themselves anytime we make changes.
 * So we watch the hidden input fields where we store the images and anytime
 * they change we launch the initializer.
 */
Lrn.Application.Admin.prototype.hiddenImageInputChange = function (hiddenInput) {
    $(hiddenInput).change(this.onchangeHiddenImageInputChange.bind(this));
}

Lrn.Application.Admin.prototype.onchangeHiddenImageInputChange = function (e) {
    var $this = $(e.target || e.srcElement);
    var clearBtn = $this.siblings('p.clearLink');
    var slideshowClearBtn = $this.siblings('button.clearLink');

    if ($this.val() == '') {
        clearBtn.addClass('disabled');
        slideshowClearBtn.addClass('disabled');
        slideshowClearBtn.attr('disabled', 'disabled');
    } else {
        clearBtn.removeClass('disabled').removeAttr('disabled');
        slideshowClearBtn.removeClass('disabled');
        slideshowClearBtn.removeAttr('disabled');
    }
}
/* for dashboard */
Lrn.Application.Admin.prototype.initOnClickDashToggle = function (index, element) {
    // a var to refer back to the checkbox
    var slideToggle = $(element);

    // create a slide toggle wrapper (to hold the slider)
    var slideWrapper = document.createElement('div');
    slideWrapper.className = 'slideToggleWrapper ui-corner-all';
    slideToggle.after(slideWrapper);

    // element for the true side (turn on)
    var trueSide = document.createElement('span');
    trueSide.className = 'trueSide ui-corner-left';
    $(trueSide).html($(this).attr('show-label') || 'ON');
    $(slideWrapper).append(trueSide);

    // element for false side (turn off)
    var falseSide = document.createElement('span');
    falseSide.className = 'falseSide ui-corner-right';
    $(falseSide).html($(this).attr('hide-label') || 'OFF');
    $(slideWrapper).append(falseSide);

    // element to slide back and forth
    var slider = document.createElement('span');
    slider.className = 'slider ui-corner-all';
    $(slideWrapper).append(slider);

    // first click turns on, second turns off 
    $(slider).toggle(function (e) {
        slideToggle.prop('checked', true);
        slideToggle.attr('checked', 'checked');
        $('.enabledMsg').hide();
        $('.disabledMsg').show();
        $(this).animate({left: '50px'});
        $(slider).css({'padding-left': '10px'}); //, 'width': '35px'
        $("#flag_show_dash").val(1);
        saveDashboardStatus();
    },
            function (e) {
                slideToggle.prop('checked', false);
                slideToggle.removeAttr('checked');
                $(this).animate({left: 0});
                $("#flag_show_dash").val(0);
                saveDashboardStatus();
            });

    if ($(this).is(':checked')) {

    }

    // hide the checkbox from the user
    $(this).hide();
};