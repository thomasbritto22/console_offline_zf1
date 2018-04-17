if (typeof (Lrn) == 'undefined')
    Lrn = {};
if (typeof (Lrn.Application) == 'undefined')
    Lrn.Application = {};

Number.prototype.pad = function (l) {
    var str = '' + this;
    while (str.length < l) {
        str = '0' + str;
    }
    return str;
};

/**
 * --- NOTIFICATIONS CONSTRUCTOR ---
 * The notifications object is responsible for displaying
 * multiple panels of information for the user. The notifications
 * page is a place for the user to see different 'feeds' of
 * information related to them. For now this is only their
 * completion history, but eventually it will hold panels for
 * 3rd party apps like from social networking sites.
 * @param config
 * @returns {Lrn.Application.Notifications}
 */
Lrn.Application.Notifications = function (config) {
    // set up internal values from config
    if (config) {
        this.user = config.user || null;
        this.siteConfigs = config.siteConfigs || null;
        this.siteLabels = config.siteLabels || null;
        this.siteErrors = config.siteErrors || null;
        this.siteInstructions = config.siteInstructions || null;
    }
};

/**
 * --- NOTIFICATIONS PROTOTYPE ---
 * We want to make Notifications a subclass of Application so
 * we will set the Notifications.prototype to the Lrn.Application object
 * and make sure we have the superclass available for
 * overriding methods from Lrn.Application.
 */
Lrn.Application.Notifications.prototype = new Lrn.Application();
Lrn.Application.Notifications.prototype.superclass = Lrn.Application.prototype;

/**
 * --- PROPERTY: CONFIG ---
 * An array where we can store various settings for this object.
 */
Lrn.Application.Notifications.prototype._config = {
    filterType: null,
    filterValue: null,
    filterDates: null,
    sortMode: null,
    sortColumn: null,
    // we need a mapping for filter types to class names
    // this will help us get filter values from HTML elements
    filterTypeClassMap: {
        title: '.collapsedWrapper .title',
        catalogId: '.collapsedWrapper .catalogId',
        timeSpent: '.collapsedWrapper .timeSpent'
    }
};

/**
* --- NOTIFICATIONS INITIALIZATION ---
* This method redefines the method from Application by first
* calling that method, then doing some extra Notification specific
* functionality.
*/
Lrn.Application.Notifications.prototype.init = function(){
    // before we extend the superclass init method, 
    // we call the init method of the superclass (Application.js)
    this.superclass.init.apply(this);
    
    // the reviewMgr will be an instanciation of the
    // Review.js object. We will use this for reviews
    this.reviewMgr = new Lrn.Application.Reviews();
    this.reviewMgr.initRatingControls();
    initPlaceholderText();
    this.calendarPath = "/images/icons/calendar.png";
    
};


/**
 * --- INIT HISTORY ---
 * Responsible for creating, appending and populating
 * the history panel. Delegates the tasks of getting
 * history data and creating the history list itself.
 */
Lrn.Application.Notifications.prototype.initHistory = function () {
    this.initDescriptions();
    this.initDates();
    this.initHistoryList();
    this.initFiltering();
    this.initSorting();
    $('#printHistory').on('click', function (e) {
        e.preventDefault();
        window.open($(this).attr('href'), 'printHistory');
    });
};

/**
 * --- INIT PRINT HISTORY ---
 * Responsible for creating, appending and populating
 * the history panel FOR PRINTING. Delegates the tasks of getting
 * history data and creating the history list itself.
 */
Lrn.Application.Notifications.prototype.initPrintHistory = function () {
    // this.initHistoryList();
    // this.initDescriptions();
    // this.initRatingTooltips();
    // this.initHistory();
   
    $('#printHistory').on('click', function (e) {
        e.preventDefault();
        if (isMobile.Android()) {
            androidPrintTip();
        } else {
            window.print();
        }
    });
};

/**
 * --- INIT DESCRIPTIONS ---
 * Takes long descriptions and shortens them with a 'more' link,
 * or a 'less' link when fully displayed.
 */
Lrn.Application.Notifications.prototype.initDescriptions = function () {
    $('.description').each(function (index, elem) {
        // get description text. remove beginning and trailing spaces.
        var desc = $(this).html();//countingWordPrep($(this).text());
        var shortDesc = $(this).html();//thisManyWords($(this).text(), 40);
        //console.log(shortDesc);
        if (desc != shortDesc) {
            $(this).html('');
            $(this).html('<div class="shortDesc"><div class="customDesc">' + shortDesc + '</div> <a href="#" class="moreDesc primaryTextIcons">' + Lrn.Applications.Notifications.siteLabels.More + '...</a></div>');
            $(this).append('<div class="longDesc">' + desc + ' <a href="#" class="lessDesc primaryTextIcons">' + Lrn.Applications.Notifications.siteLabels.Less + '...</a></div>');
            $('.longDesc').hide();
            $('.moreDesc').on('click', function () {
                $(this).parent().hide();
                $(this).parent().next().show();
                return false;
            });
            $('.lessDesc').on('click', function () {
                $(this).parent().hide();
                $(this).parent().prev().show();
                return false;
            });
        }
    });
};

/**
 * --- INIT RATING TOOLTIPS ---
 * Enable the tooltips for the avg ratings for a course.
 */
Lrn.Application.Notifications.prototype.initRatingTooltips = function () {
    $('.tooltip').each(function (index, elem) {
        var tooltip = new Lrn.Widget.Tooltip(elem);

        // is this a mobile device?
        if (isMobile.any()) {
            // this is added for the tooltip to hide
            // when a click/tap is made on the document
            // for mobile devices
            $(this).find('.ratingsTooltipArrow').on('click', function (e) {
                e.stopPropagation();

                if (e.srcElement.nextElementSibling.style.display === 'none' || e.srcElement.nextElementSibling.style.display === '') {
                    tooltip.show($(e.target));
                } else {
                    tooltip.hide($(e.target));
                }
            });
        }
        else {
            // set hover states of down arrow
            // on hover: show tooltip
            // off hover: hide tooltip
            $(elem).parent().find('.tooltipArrow').hover(
                    function () {
                        tooltip.show($(this));
                        $(this).blur();
                    },
                    function () {
                        tooltip.hide();
                    }
            );
        }
    });
};

/**
 * --- INIT HISTORY LIST ---
 * For now, this method is used to just activate (or re-activate) the
 * history list. (re-activate is for after a refresh).
 */
Lrn.Application.Notifications.prototype.initHistoryList = function () {
//    var that = this;

    // activate the accordion behavior for our history items.
    // due to limitations in accordion plugin (cannot close all),
    // we must apply an accordion to EACH item, with special settings.
    // active = false makes all closed by default
    // collapsible = true allows us to close everything (enables close all)
    // heightStyle = 'content' to let the expandable size to content, not fixed.
    
    $('.expandable').each(function (index, element) {
        $(element).accordion({
            active: false,
            collapsible: true,
            heightStyle: 'content',
            activate: function (event, ui) {
                var active = $(this).accordion("option", "active");
                //$(this).find("article").removeAttr("role");
               //$(this).find("article").attr("role", "list");
                //$(this).find(".expandable .ui-accordion").attr("tabindex", "0");

                if (active !== false) {
                    $(this).find(".ui-accordion-header").attr("aria-label","Collapse: "+$(this).find(".ui-accordion-header").attr("aria-label").replace("Expand:","")).attr("alt","Collapse").attr("tabindex","0");
                } else {
                    $(this).find(".ui-accordion-header").attr("aria-label","Expand: "+$(this).find(".ui-accordion-header").attr("aria-label").replace("Collapse:","")).attr("alt","Expand").attr("tabindex","0");
                }
            },
            create: function (event, ui) {
                    $(this).find(".ui-accordion-header").attr("aria-label","Expand: "+$(this).find(".ui-accordion-header").attr("aria-label").replace("Collapse:","")).attr("alt","Expand").attr("tabindex","0");
                // $(this).find("article").removeAttr("role");
            }
        });
//        $(element).find(".ui-accordion-header-icon").attr("aria-label","Click to expand");
        var img = $(element).find('.ui-accordion-content').find('.left').find('img');
        if (img.length > 0) {
            var src = img.attr('src');
            var test = new Image();
            test.onerror = function () {
                test.src = CDN_IMG_URL + '/images/samples/defaultModuleImage.jpg';
                test.onload = null;
                test.onerror = null;
                img.attr('src', this.src);
                delete test;
            };
            test.onload = function () {
                delete test;
            };
            test.src = src;
        }
    });
    // this is just to make our history list sortable (bells and whistles)
    // may not be necessary or desired *USE WITH DISCRETION
    //$('.sortable').sortable();
    $('.expandable').removeAttr('role');
    $('#historyList article').removeAttr('role');
    $('.expandedWrapper').removeAttr('aria-labelledby');  
    
    this.initRatingReviews();    
    $(".historyPage").find('a').parent().attr('tabindex', 0);
    $('.sortBar li a').each(function(){
        var aria_label = $(this).attr("aria-label");
        if($(this).hasClass('sortDesc')){
            aria_label = aria_label.replace("descending", "ascending");
        }else{
            aria_label= aria_label.replace("ascending", "descending");
        }
        $(this).attr("aria-label", aria_label);
    });
};

/**
 * --- INIT RATINGS AND REVIEWS ---
 * The history page is using a single dialog for the ratings and reviews.
 * This method initializes any elements that are required for each history
 * item to launch it's version of the ratings and review dialog.
 */
Lrn.Application.Notifications.prototype.initRatingReviews = function () {
    this.reviewMgr.init();
    this.reviewMgr.initDialog();
};

/**
 * --- INITIALIZE FILTERING ---
 * Applies event handlers and show/hide methods to various
 * elements related to filtering history page results.
 */
Lrn.Application.Notifications.prototype.initFiltering = function () {

    var that = this;

    // turn off any events first, before adding them again.
    // this will prevent the event from being added to the 
    // event stack multiple times (1 click = 4 click events)
    $('#filterBar .filterForm').off('submit');
    $('#clearFilterDates').off('click');
    $('#filterBar').removeAttr( 'role' );
    // submit an ajax request to refresh the history
    // based on the filter form criteria.
     $('#filterBar .filterForm').on('submit', function () {
        // check that the dates in the fields are valid ones
        var hasTo = false;
        var hasFrom = false;
        var errCheck = false;
        
        that.updateHiddenField();
        var errmsg= Lrn.Applications.Language.siteErrors.CEF002;
        var from_msg= errmsg.replace("or To", "");
        var to_msg= errmsg.replace("From or", "");
       
        $("#errorTODate").html('');
        $("#errorFromDate").html('');               
       
        if(Lrn.Application.Notifications.prototype.validateDate($('#historyFilter_to').val())==false){
            hasTo = false;
            errCheck =true;            
            $("#errorTODate").html(to_msg).addClass('errormsg-dates');
            $("#historyFilter_to").attr('aria-labelledby','errorTODate');
        }
        if(Lrn.Application.Notifications.prototype.validateDate($('#historyFilter_to').val())==true){
                      
            $("#errorTODate").html('').removeClass('errormsg-dates');
            $("#historyFilter_to").removeAttr('aria-labelledby','errorTODate');
        }
        if(Lrn.Application.Notifications.prototype.validateDate($('#historyFilter_from').val())==false){
            hasFrom = false;
            errCheck =true;           
            $("#errorFromDate").html(from_msg).addClass('errormsg-dates');
            $("#historyFilter_from").attr('aria-labelledby','errorFromDate');
        } 
        if(Lrn.Application.Notifications.prototype.validateDate($('#historyFilter_from').val())==true){
                      
            $("#errorFromDate").html('').removeClass('errormsg-dates');
            $("#historyFilter_from").removeAttr('aria-labelledby','errorFromDate');
        }  
        if ($('#bootlegHistoryFilter_to').val() != '')
            hasTo = true;
        if ($('#historyFilter_from').val() != '')
            hasFrom = true;
        // only make the request if we have at least one date
        // no 'from' means search starts from beginning of history.*
        // no 'to' means search stops at today.*
        // * handled by PHP
        if(errCheck){
            $(".errormsg-dates:first").parent().find('input').focus();
        }
        if (!errCheck) {
            
            $("#errorFromDate").html('');
            $("#errorTODate").html('');
            // fade out the history to let the user know we are requesting
            $('#historyList').css({opacity: 0.3});

            $.ajax({
                type: $(this).attr('method'),
                url: $(this).attr('action') + '?queryDate=' + (new Date().getTime()),
                data: $(this).serialize(),
                success: function (response) {
                    $('#historyList').css({opacity: 1});

                    // replace current list HTML with response
                    // then re-init to get accordion functionality
                    $('#historyWrapper').html(response);
                    that.initHistory();
                    that.reviewMgr.initRatingControls();
                   
                },
                error: function (response) {
                    $('#historyList').css({opacity: 1});
                    //'There was a problem refreshing the history'
                    alert(Lrn.Applications.Notifications.siteErrors.CEA026);
                }
            });
        }

        // make sure the form doesn't redirect the url
        return false;
    });
    
    $('#clearFilterDates').on('click', function () {
        
        //clear date validation errors
        $("#errorFromDate").html('').removeClass('errormsg-dates');
        $("#errorTODate").html('').removeClass('errormsg-dates');
        $("#historyFilter_to").removeAttr('aria-labelledby');
        $("#historyFilter_from").removeAttr('aria-labelledby');
        
        // fade out the history to let the user know we are requesting
        $('#historyList').css({opacity: 0.3});

        that.resetFilterSort();

        initPlaceholderText();
        $('#historyFilter_from').attr('placeholder','mm/dd/yyyy');
        $('#historyFilter_to').attr('placeholder','mm/dd/yyyy');

    });

};

/**
 * --- INITIALIZE SORTING ---
 * Adds events to the sorting bar elements to add sorting functionality.
 * Makes ajax request to get sorted list, then replaces current HTML with new.
 */
Lrn.Application.Notifications.prototype.initSorting = function () {
    var mgr = this;

    // when any sort control is clicked, stop from redirecting
    // then make ajax calls with sort params, and get updated view
    $('.sortBar li a').on('click', function (e) {
        e.preventDefault();

        // first clear all sort styles for all sort items
        $('.sortBar li a').removeClass('sortAsc');
        $('.sortBar li a').removeClass('sortDesc');

        // if we have no sort column, this is the first sorting
        if (!mgr._config['sortColumn']) {
            mgr._config['sortColumn'] = $(this).attr('id');
            mgr._config['sortMode'] = 'SORT_ASC';
        }
        // if this isn't the same sort column, make sure we first sort asc
        else if (mgr._config['sortColumn'] != $(this).attr('id')) {
            mgr._config['sortColumn'] = $(this).attr('id');
            mgr._config['sortMode'] = 'SORT_ASC';
        }
        // otherwise, just toggle the sorting asc/desc desc/asc.
        else if (mgr._config['sortColumn'] == $(this).attr('id')) {
            mgr._config['sortMode'] = (mgr._config['sortMode'] == 'SORT_DESC') ? 'SORT_ASC' : 'SORT_DESC';
        }

        // use our sortMode to determine which class to apply to our sort column
        if (mgr._config['sortMode'] == 'SORT_ASC')
            $('#' + mgr._config['sortColumn']).addClass('sortAsc').attr("aria-label", $('#' + mgr._config['sortColumn']).attr("aria-label").replace("descending", "ascending"));
        if (mgr._config['sortMode'] == 'SORT_DESC')
            $('#' + mgr._config['sortColumn']).addClass('sortDesc').attr("aria-label", $('#' + mgr._config['sortColumn']).attr("aria-label").replace("ascending", "descending"));

        // fade out the history to let the user know we are requesting
        $('#historyList').css({opacity: 0.3});

        // make the call to get the updated/sorted history list.
        $.ajax({
            url: '/notifications/refreshHistory?queryDate=' + (new Date().getTime()),
            data: {
                sort: true,
                column: mgr._config['sortColumn'],
                dir: mgr._config['sortMode']
            },
            success: function (response) {
                $('#historyList').css({opacity: 1});

                // replace current list HTML with response
                // then re-init to get accordion functionality
                $('#historyWrapper').html(response);
                mgr.initHistory();
                for(var i = 0 ;i < $('.historyHeaderTitle').length ; i++){
                    // Code for border retain
                    var headerTitleArray = $('.historyHeaderTitle');
                    if( $('.historyHeaderTitle').hasClass('sortAsc') || $('.historyHeaderTitle').hasClass('sortDesc') ) {
                            $('.sortAsc').addClass('titleFocusBorder');
                      $('.sortDesc').addClass('titleFocusBorder');
                    }
                }               
                $("article:first").focus();
            },
            error: function (response) {
                $('#historyList').css({opacity: 1});
                //'There was a problem refreshing the history'
                alert(Lrn.Applications.Notifications.siteErrors.CEA026);
            }
        });
    });
};

Lrn.Application.Notifications.prototype.updateHiddenField = function () {
    var day = $('#historyFilter_to').val();

    var sDay = day.split('/');
    sDay[1] = parseInt(sDay[1], 10) + 1;

    var date = new Date(sDay.join('/'));
    sDay[0] = date.getMonth() + 1;
    sDay[1] = date.getDate().pad(2);
    sDay[2] = date.getFullYear();
    var datetext = sDay.join('/');

    $('#bootlegHistoryFilter_to').val(datetext);
};

/**
 * --- INITIALIZE DATE PICKERS ---
 * Instanciates jquery ui date pickers for users to choose
 * dates easily.
 */
Lrn.Application.Notifications.prototype.initDates = function () {
    
    $(function () {
        var controller = this;
        // we need a date object to get the year range until current year
        var dpDate = new Date();
        $("#historyFilter_from").datepicker({
            showOn: 'button',
            buttonImageOnly: false,
            buttonText: '<i class="fa fa-calendar secondaryTextIcons" aria-hidden="true" aria-label="calendar"></i><i class="material-icons secondaryTextIcons" aria-label="calendar">&#xE916;</i>',
            dayNamesShort: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            showButtonPanel: true,
            closeText: '<i class="fa fa-times secondaryTextIcons" aria-hidden="true" aria-label="close"></i><i class="material-icons close">&#xE5CD;</i>',
            changeMonth: false,
            changeYear: false,
            dateFormat: 'mm/dd/yy',
            defaultDate: "+1d",
            numberOfMonths: 1,
            onClose: function (selectedDate) {
                // only validate if not empty
                
                if ($(this).val() != 'mm/dd/yyyy' && $(this).val() != '') {
                    if (Lrn.Application.Notifications.prototype.validateDate($(this).val())) {
                        $(this).removeClass('invalid');
                       //$("#historyFilter_to").datepicker("option", "minDate", selectedDate);
                    }
                    else $(this).addClass('invalid');
                }
            },
            onSelect: function (dateText, inst) {
                $('#historyFilter_from').removeClass('placeholder');
                $('#historyFilter_from').attr('placeholder','');
            }
        });

        $("#historyFilter_to").datepicker({
            showOn: 'button',
            buttonImageOnly: false,
            buttonText: '<i class="fa fa-calendar secondaryTextIcons" aria-hidden="true" aria-label="calendar"></i><i class="material-icons secondaryTextIcons" aria-label="calendar">&#xE916;</i>',
            dayNamesShort: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            showButtonPanel: true,
            closeText: '<i class="fa fa-times secondaryTextIcons" aria-hidden="true" aria-label="close"></i><i class="material-icons close">&#xE5CD;</i>',
            changeMonth: false,
            changeYear: false,
            dateFormat: 'mm/dd/yy',
            defaultDate: "+1d",
            numberOfMonths: 1,
            onClose: function (selectedDate) {
                // only validate if not empty
                if ($(this).val() != 'mm/dd/yyyy' && $(this).val() != '') {
                    if (Lrn.Application.Notifications.prototype.validateDate($(this).val())) {
                        $(this).removeClass('invalid');
                       // $("#historyFilter_from").datepicker("option", "maxDate", selectedDate);
                    }
                    else $(this).addClass('invalid');
                }
            },
            onSelect: function (dateText, inst) {
                Lrn.Application.Notifications.prototype.updateHiddenField();
                $('#historyFilter_to').removeClass('placeholder');
                $('#historyFilter_to').attr('placeholder',''); 
            }
        }); 
        $('.ui-datepicker-trigger:eq(0)').insertAfter(".historyFilter_fromArea");
        $('.ui-datepicker-trigger:eq(1)').insertAfter(".historyFilter_toArea");

        $('.ui-datepicker-trigger').attr('aria-describedby', 'datepickerLabel');
        dayTripper('historyFilter_from');        
    });
};

/**
 * --- RESET FILTERING AND SORTING ---
 * Resets the fields and icons for any sorting or filtering that
 * has been applied to the history list. Also makes a call to
 * refresh the list and get the original data back.
 */
Lrn.Application.Notifications.prototype.resetFilterSort = function () {
    var controller = this;

    // clear date fields
    $('#historyFilter_from').val('');
    $('#historyFilter_to').val('');

    // move the sort icon back to the completion date, in asc mode
    $('.sortAsc').removeClass('sortAsc');
    $('.sortDesc').removeClass('sortDesc');
    $('#completionDate').addClass('sortAsc');

    // get a clean list of history, sorted by completed date ascending
    $.ajax({
        type: 'POST',
        url: '/notifications/refreshHistory?queryDate=' + (new Date().getTime()),
        data: {
            clearFilter: true,
            clearSort: true
        },
        success: function (response) {
            $('#historyList').css({opacity: 1});

            // replace current list HTML with response
            // then re-init to get accordion functionality
            $('#historyWrapper').html(response);
            controller.initHistory();
            controller.reviewMgr.initRatingControls();
        },
        error: function (response) {
            $('#historyList').css({opacity: 1});
            //'There was a problem refreshing the history'
            alert(Lrn.Applications.Notifications.siteErrors.CEA026);
        }
    });
};

/**
 * --- VALIDATE DATE ---
 * Used to validate the dates that are entered in the completion date filtering fields.
 * @param date {string}
 * @returns {Boolean}
 */
Lrn.Application.Notifications.prototype.validateDate = function (date) {
    // assume the date is invalid to begin with
    var isValid = false;

    // format is for mm/dd/yyyy nothing before 1994
    var format = /^(0[\d]|1[012])\/([0-2][\d]|3[01])\/(199[4-9]|20[\d]{2})$/;

    // if the date is in a valid format, check it is real
    if (format.test(date)) {
        var dParts = date.split("/");

        // create a date object to confirm the date is real
        // reduce the month by 1 because months are 0 based.
        var d = new Date(dParts[2], dParts[0] - 1, dParts[1]);

        if (d.getFullYear() == dParts[2] && d.getMonth() == dParts[0] - 1 && d.getDate() == dParts[1]) {
            isValid = true;
        }
        // else mark as invalid
        else
            isValid = false;
    }

    return isValid;
}; 

