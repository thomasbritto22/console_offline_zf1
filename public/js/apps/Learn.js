if (typeof (Lrn) == 'undefined')
    Lrn = {};
if (typeof (Lrn.Application) == 'undefined')
    Lrn.Application = {};

var get = location.search.substr(1).split('&');
var descriptions = [];
var $_GET = [];
for (var i = 0; i < get.length; ++i) {
    var g = get[i].split('=');
    $_GET[g[0]] = g[1];
}
delete get;
function getDescription(systemid) {
    return descriptions[systemid];
}
/**
 * --- LEARN ---
 * The Learn object is intended to handle all things
 * that relate to education in the Application. It is
 * essentially the base for a representation of LCEC
 * within the Application. Methods here will be used in
 * final version of Application, but not part of Legacy,
 * which is intended to be deleted eventually. This is not.
 * @param config
 * @returns {Lrn.Application.Learn}
 */
Lrn.Application.Learn = function (config) {
    if (config) {
        this.user = config.user || null;
        this.siteConfigs = config.siteConfigs || null;
        this.siteLabels = config.siteLabels || null;
        this.siteErrors = config.siteErrors || null;
        this.siteInstructions = config.siteInstructions || null;
        this.courseTimestamp = config.courseTimestamp;
    }
};

/**
 * --- LEARN PROTOTYPE ---
 * We want to make Learn a subclass of Application so
 * we will set the Learn.prototype to the Lrn.Application object
 * and make sure we have the superclass available for
 * overriding methods from Lrn.Application.
 */
Lrn.Application.Learn.prototype = new Lrn.Application();
Lrn.Application.Learn.prototype.superclass = Lrn.Application.prototype;
//Lrn.Application.Learn.prototype.courseTimestamp = null;

Lrn.Application.Learn.prototype.init = function () {
    // before we extend the superclass init method, 
    // we call the init method of the superclass (Application.js)
    this.superclass.init.apply(this);
    // apply a character limit to custom course descriptions

    this.initReviewLoc();

    // the reviewMgr will be an instanciation of the
    // Review.js object. We will use this for EOC reviews
    this.reviewMgr = new Lrn.Application.Reviews();

    $(document).ready(function () {

        var certrevise = $('#certRevise');
        if (certrevise.length > 0) {
            var button = certrevise.find('.mqStartBtn');
            var systemId = button.attr('data-id');
            var url = button.attr('onclick').replace('window.open(', '').replace(')', '').replace(';', '').replace("'", "").split(',');
            button.removeAttr('onclick');

            button.on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

//    			this.courseTimestamp = new Date().getTime();
                //var param2 = url.slice(2).join(',').replace(/\'/g,'');
                this.courseWindow = window.open(url[0], 'courseWindow',
                        "channelmode=0,directories=0,fullscreen=0,width=800,height=600,top=0,left=0,menubar=0,resizable=0,scrollbars=0,status=0,titlebar=0,toolbar=0"
                        );
                this.courseInterval = setInterval(function (e) {
                    if (this.courseWindow.closed) {
                        // remove the asynchronous loop
                        clearInterval(this.courseInterval);

                        var catalogId = '';
                        if (this.courseData != undefined)
                            catalogId = this.courseData.catalogId;

                        // ajax call to check if the course has been completed
                        $.ajax({
                            url: '/learn/eocCheck?systemId=' + systemId + '&moduleId=' + $_GET['moduleId'] + '&catalogId=' + catalogId,
                            contentType: 'application/json',
                            dataType: 'json',
                            success: function (response) {
                                // turn the response into an object
                                response = response.responseText ? JSON.parse(response.responseText) : response;
                                // if the course is complete

                                if (response.complete && response.lastCompletion + 30000 >= this.courseTimestamp) {
                                    // remove any previous modal
                                    certrevise.remove();

                                    // add the modal markup to the body
                                    $('body').append(response.modal);

                                    // initiate the modal
                                    this.initEOC();
                                    if (catalogId == '') {
                                        document.location.href = '/learn/queue';
                                    }
                                } else {
                                    if (catalogId == '') {
                                        document.location.href = '/learn/queue';
                                    }
                                }

                            }.bind(this)
                        });
                    }
                }.bind(this), 100);

            }.bind(this));
        }
    }.bind(this));

    // Just a test to see how the tooltip works in bootstrap
    // this.showToolTip();
};
Lrn.Application.Learn.prototype.deleteAllCookies = function () {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + '=""; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"';
    }
};

/**
 * --- INIT QUEUE VIEW ---
 * Does random things to get the various parts of the queue
 * page to work. Switching between views, etc.
 */
Lrn.Application.Learn.prototype.initQueueView = function () {
    var siteLabels = Lrn.Applications.Learn.siteLabels;
    if ($('#pendingCertReviews')) {
        $('#pendingCertReviews').dialog({
            title: siteLabels.Notification,
            modal: true,
            width: 500,
            height: 240,
            resizable: false,
            open: function (event, ui) {
                $('.ui-dialog-titlebar-close').html('<i class="fa fa-times secondaryTextIcons" aria-hidden="true"></i><i class="material-icons secondaryTextIcons" aria-hidden="true">&#xE5CD;</i><span aria-label="' + siteLabels.close + '" class="arialHiddenSpan"></span>');
                //$('.ui-dialog').removeAttr('aria-labelledby');
                $('.ui-dialog').focus();
                //$('.ui-dialog').attr('aria-label',siteLabels.Notification);   
                $('.ui-dialog').attr('aria-describedby','pendingCert');
            },
            buttons: [{text: siteLabels.close, 'class': 'customSecondaryBtn', click: function () {
                       $('#pendingCertReviews').dialog("close");
                    }}]
        });
    }
    if ($('#returnedCerts')) {
        $('#returnedCerts').dialog({
            title: siteLabels.Notification,
            modal: true,
            width: 500,
            height: 240,
            resizable: false,
            open: function (event, ui) {
                $('.ui-dialog-titlebar-close').html('<i class="fa fa-times secondaryTextIcons" aria-hidden="true"></i><i class="material-icons secondaryTextIcons" aria-hidden="true">&#xE5CD;</i><span aria-label="' + siteLabels.close + '" class="arialHiddenSpan"></span>');
                //$('.ui-dialog').removeAttr('aria-labelledby');
                $('.ui-dialog').focus();
               // $('.ui-dialog').attr('aria-label',siteLabels.Notification);
                $('.ui-dialog').attr('aria-describedby','returnCert');
            },
            buttons: [{text: siteLabels.close, 'class': 'customSecondaryBtn', click: function () {
                        $('#returnedCerts').dialog("close");
                        $('.ui-dialog').focus();
                    }}]
        });
    }    
    $('.ui-dialog-titlebar-close').live('keydown', function(e) {     
        var keyCode = e.keyCode || e.which;     
            if (keyCode == 9) {       
                $(".ui-button").focus();
        }
   }); 
    //change course info url on laguage change to get info page for the selected language
    $('.mqItemLangSelect').live('change', {thisObj: this}, function (e, triggerListView) {
        var elem = this;
        var selected_sysid = $('option:selected', this).attr('data-systemid');
        var selected_coursenm = $('option:selected', this).attr('data-cousename');
        selected_course_description = getDescription(selected_sysid);
        /*if($('option:selected', this).attr('data-cusdesc') == '')
         selected_course_description = $('option:selected', this).attr('data-description');
         else
         selected_course_description = $('option:selected', this).attr('data-cusdesc');
         */

        //var selected_course_cusDesc = $('option:selected', this).attr('data-cusdesc');
        var selected_img = $('option:selected', this).attr('data-imgurl');

        var vars = [], hash, onclick_url, courseLink;
        onclick_url = $('option:selected', this).attr('data-onclick');
        courseLink = $('option:selected', this).attr('data-courseLink');
        var q = onclick_url.split('?')[1];
        if (q != undefined) {
            q = q.split('&');
            for (var i = 0; i < q.length; i++) {
                hash = q[i].split('=');
                vars.push(hash[1]);
                vars[hash[0]] = hash[1];
            }
        }
        var value = vars['systemId'];
        value = value.replace("'", "");
        value = value.replace(";", "");
        onclick_url = onclick_url.replace('systemId=' + value, 'systemId=' + selected_sysid);
        courseLink = courseLink.replace('systemId=' + value, 'systemId=' + selected_sysid);

        $(elem).closest('.column').find('.mqStartBtn').attr('onclick', 'try {' + onclick_url + ';} catch( e ) { }');
        $(elem).closest('.column').find(".course-title-link").attr('href', courseLink);
        $(elem).closest('.column').find(".course-img-link").attr('href', courseLink);
        $(elem).closest('.column').find(".course-img").attr('src', selected_img);
        $(elem).closest('.column').find(".course-img").attr('alt', unescapeHtml(selected_coursenm));
        $(elem).closest('.column').find(".course-title").text(unescapeHtml(selected_coursenm));
        $(elem).closest('.column').find(".courseDescription").html(unescapeHtml(selected_course_description));
        // $(elem).closest('.column').find("#customDescription").html(selected_course_cusDesc);        
        if (false != triggerListView) {
            //trigger the change to list view as well
            $('select[rowid=' + $(this).closest('.mqItem').attr('id') + ']').val($('option:selected', this).val());
            $('select[rowid=' + $(this).closest('.mqItem').attr('id') + ']').trigger('change', false);
        }
    });
};

Lrn.Application.Learn.prototype.getDesc = function () {
    alert("ss");
};
/**
 * --- REFRESH QUEUE ---
 * Makes a call to get an updated queue of channels,
 * then replaces the current queue when returned successful.
 */
Lrn.Application.Learn.prototype.refreshQueue = function () {
    var siteErrors = Lrn.Applications.Learn.siteErrors;
    // do an AJAX call to retrieve the list of channels
    $.ajax({
        //dataType: 'json',
        url: '/learn/refreshqueue',
        success: function (response) {
            $('#contentWrapper').removeClass('waiting');
            $('#contentWrapper').html(response);
        },
        error: function () {
            var errorComment = 'An Error Occurred';
            if (siteErrors) {
                errorComment = siteErrors.CEA019 || null;
            }
            alert(errorComment);
        }
    });
};

/**
 * --- INIT COURSE LAUNCH BUTTON
 * This essentially adds a click event handler so that
 * the button actually does something. We are going to make
 * it check the value of text vs. video to specify which
 * mode to present this course in.
 * @param systemId
 * @param destination
 */
Lrn.Application.Learn.prototype.initCourseLaunch = function (systemId, destination, media, curriculumId) {
    var learnMgr = this;

    $('#launchBtn_' + systemId).on('click', function () {
        var courseStartTime = new Date().getTime();
        $modeSelected = $('[name=playbackMode]:checked').val();

        // by default, media is on. if the user selected
        // basic, we can exploit "media=on" to replace it with 'off'.
        // in both cases, it doesn't matter what it is, just change it.
        if ($modeSelected == 'basic' || "undefined" == typeof $modeSelected) {
            destination = destination.replace(/media=(on|off)/i, 'media=off');
            //make sure if the URI was encoded
            destination = destination.replace(/\%26media\%3D(on|off)/i, '%26media%3Doff');
        }
        // else if enhanced, make sure we turn back to media=on. This is
        // mostly used to change back after user REselects the enhanced option.
        else if ($modeSelected == 'enhanced') {
            destination = destination.replace(/media=(on|off)/i, 'media=on');
            //make sure if the URI was encoded
            destination = destination.replace(/\%26media\%3D(on|off)/i, '%26media%3Don');
        }
//        $.removeCookie('edge-auth',{domain: '.lrn.com',path: '/'});
        // launch course window
        learnMgr.courseWindow = window.open(
                destination,
                'courseWindow',
                "channelmode=0,directories=0,fullscreen=0,width=800,height=600,top=0,left=0,menubar=0,resizable=1,scrollbars=0,status=1,titlebar=0,toolbar=0"
                );

        // learnMgr.courseTimestamp = new Date().getTime();

        //make sure to clear the interval if there is existed before
        clearInterval(learnMgr.courseInterval);

        // check every 500 milliseconds whether or not the course
        // window has been closed. If so, check if the course was
        // completed and show the EOC dialog.
        learnMgr.courseInterval = window.setInterval(function () {
            // is the course window open?
            if (learnMgr.courseWindow.closed) {
                // remove the asynchronous loop
                clearInterval(learnMgr.courseInterval);

                // ajax call to check if the course has been completed
                $.ajax({
                    url: '/learn/eocCheck?systemId=' + systemId + '&curriculumId=' + curriculumId + '&moduleId=' + $_GET['moduleId'] + '&catalogId=' + learnMgr.courseData.catalogId
                }).complete(function (response) {
                    // turn the response into an object
                    response = response.responseText ? JSON.parse(response.responseText) : response;
                    // if the course is complete
                    if (response.complete) {
                        // remove any previous modal
                        $('#eocDialog').remove();

                        // add the modal markup to the body
                        $('body').append(response.modal);

                        // initiate the modal
                        Lrn.Applications.Learn.initEOC();
                    }
                });

            }
        }, 500);
    });
};

/**
 * --- REFRESH PREVIEW ---
 * Retrieves the components for this channel.
 */
Lrn.Application.Learn.prototype.refreshPreview = function (channelId) {
    var siteErrors = Lrn.Applications.Learn.siteErrors;
    // do an AJAX call to retrieve the list of components
    $.ajax({
        //dataType: 'json',
        url: '/learn/refreshpreview?curriculumId=' + channelId,
        success: function (response) {
            // now create the list of components based on our response
            $('#contentWrapper').removeClass('waiting');
            $('#contentWrapper').html(response);
        },
        error: function () {
            var errorComment = 'An Error Occurred';
            if (siteErrors) {
                errorComment = siteErrors.CEA019 || null;
            }
            alert(errorComment);

        }
    });
};

/**
 * --- INIT END OF COURSE ---
 * Inits the dialog and dialog controls for the user
 * at the end of the course.
 */
Lrn.Application.Learn.prototype.initEOC = function () {

    var siteInstructions = Lrn.Applications.Learn.siteInstructions;
    var siteTitle = siteInstructions && siteInstructions.CongratulationsYourAlmostDone ? siteInstructions.CongratulationsYourAlmostDone : '';
    $('#eocDialog').dialog({
        modal: true,
        resizable: false,
        width: 550,
        // height: 320,
        title: siteTitle,
        draggable: false,
        open: function () {
            $('.ui-dialog-titlebar-close').addClass('secondaryBgColor');
            $('#eocRateReviewIcon').addClass('fa fa-star');
            $('#eocRateReviewIconMaterial').addClass('material-icons');
            $('#eocHistoryIcon').addClass('fa fa-history');
            $('#eocHistoryIconMaterial').addClass('material-icons');
            $('#eocPrintIcon').addClass('fa fa-print');
            $('#eocPrintIconMaterial').addClass('material-icons');
            $('#eocCertPrintIcon').addClass('fa fa-print');
            $('#eocCertPrintIconMaterial').addClass('material-icons');
            var liEl = $('.eocOptionList').children();
            liEl.slice(0, 1).css({'margin-right': '10px', 'margin-bottom': '10px'});
            liEl.slice(2, 3).css({'margin-right': '10px'});
            liEl.slice(1, 2).css({'margin-bottom': '10px'});
        },
        close: function () {
            // if they close the dialog using the x, 
            // send them to the queue.
            document.location.href = '/learn/queue';
        }
    });



    // $('returnMqBtn').live('click', function(){
    //     $('#eocDialog').dialog('close');
    //     document.location.href = '/learn/queue';
    // });

    // make the entire option clickable. have it send
    // users to the page that the link would send them too.
    $('.eocOption').on('click', function (e) {
        e.preventDefault();
        // if this is a print window, open in a new tab/window
        var linkURL = $(this).find('a').attr('href');
        if (linkURL.indexOf('/learn/printlegacy') != -1) {
            window.open(linkURL, 'printWindow', 'menubar=0,scrollbars=0,status=0,titlebar=0,toolbar=0,resizable=1');
        }
        else
            document.location.href = linkURL;
    });
};

/**
 * --- DISPLAY TOP BAR FOR VIEW CERTIFICATE ---
 * Creates and populates a top bar for displaying
 * print and exit and other buttons
 * on top of the view certificate iframe
 * with CSS from learn.css under #certificate_header_content.
 */
Lrn.Application.Learn.prototype.buildEocCertControls = function () {
    var learnMgr = this;

    var printBtn = document.createElement('span');
    printBtn.id = 'printBtn';
    printBtn.alt = 'Print Completion Certificate';
    printBtn.className = 'printBtn';
    $('#certificate_header_content').append(printBtn);
    $(printBtn).on('click', function () {
        learnMgr.printIFrameContent("legacyFrame");
    });

    var divider = document.createElement('span');
    divider.id = 'divider1';
    divider.className = 'divider';
    divider.innerHTML = "<hr>";
    $('#certificate_header_content').append(divider);

    var exitBtn = document.createElement('span');
    exitBtn.id = 'exitBtn';
    exitBtn.className = 'exitBtn';
    exitBtn.innerHTML = "EXIT";
    $('#certificate_header_content').append(exitBtn);
    $(exitBtn).on('click', function () {
        window.location = "/";
    });

    var nextButton = document.createElement('span');
    nextButton.id = 'nextBtn';
    nextButton.className = 'next';
    nextButton.innerHTML = "NEXT";
    $('#f_top').append(nextButton);
    $(nextButton).on('click', function () {
        window.location = '/learn/eocsurvey?id=63150&catalogid=' + learnMgr.catalogid;
    });
};

/**
 * --- INIT REVIEWS ---
 * Make sure we activate everything about reviews.
 */
Lrn.Application.Learn.prototype.initReviews = function (useDialog) {
    if (useDialog)
        this.reviewMgr.initDialog();
    else
        this.reviewMgr.init();
};

/**
 * --- PRINT IFRAME CONTENT ---
 * print iframe content 
 * currently used to print completion certificate
 * @param: iframeName - name of the iframe to print
 */
Lrn.Application.Learn.prototype.printIFrameContent = function (iframeName) {
    //for now we are printing the whole page. as domain security is not allowign to print iframe
    window.focus();
    window.print();
};

Lrn.Application.Learn.prototype.onmessageResubmitComplete = function (e) {
    if (e.origin.match(/lrn.com/i)) {
        $('#certRevise').hide();
    }
};

Lrn.Application.Learn.prototype.showToolTip = function () {
    $('.course-title-link').tooltip('toggle');
}

Lrn.Application.Learn.prototype.initReviewLoc = function () {
    var path = window.location.pathname.split('/');
    $('span.' + path[2]).addClass('onReviews');
}

Lrn.Application.Learn.prototype.createRatingsTooltip = function () {
    this.reviewMgr.initRatingControls();
}
