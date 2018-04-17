if(typeof Lrn == 'undefined') Lrn = {};
if(typeof Lrn.Widget == 'undefined') Lrn.Widget = {};

/*$( document ).ready(function() {
    $("div.dataTables_filter input").unbind();
});*/

Lrn.Widget.Queue = function(mode, id, labels, defLanguage, DEFAULT_LANGUAGE_INTENG, DEFAULT_LANGUAGE_UKENG){
    this.htmlTableId = '#moduleList';
    this.htmlFrameTableId = '#dynamic';
    this.htmlFilterCourse = '#filterCourse';
    this.htmlImageQWraper = '#mqItemWrap';
    this.htmlSearchDivBoxId = this.htmlTableId + 'AllFilter';
    this.htmlViewToggleId = '#toggleView';
    this.htmlEmptyTextDivBoxId = '#emptyRecord';
    this.htmlEmptyListTextDivBoxId = '#emptyListRecord';
    this.htmlEmptyQueueTextBoxId = '#emptyQueueTextBox';
    this.htmlDataTableFilterTextId = '#moduleList_info';
    this.htmlDataTableEmptyTextClass = '.dataTables_empty';
    //this.htmlToggleViewButtonId = '#acc_toggle_view';
    this.htmlToggleViewButtonId = '#toggleView';
    
    this.ajaxUrl= '/learn/lazyqueue';
    this.ajaxReturnCertUrl = '/learn/certstatus';
    this.ajaxModeUrl= '/profile/myqueuelayout';
    this.queueModes = {list:{name:'List', id:this.htmlFrameTableId}, image:{name:'Image', id:this.htmlImageQWraper}};
    this.siteLabels = labels;
    this.htmlQLanguageClass = 'qLanguageDropdown';
    this.htmlCourseLinkClass = 'courseLink';
    this.datesConstant = {first:'Jan 1, 3000', second:'Jan 2, 3000', third:'Jan 3, 3000'};
    
    this.ajaxOriMyQueueData = null;
    this.queueSearchString = null;
    this.lazyLoadObj = null;
    this.serverLayoutId = null;
    this.queueListVewData = {aaData:[]};
    this.queueImageViewData = [];
    this.queueImageSearchData = [];
    this.queueFilterBy = 'all';
    this.queueIsEmpty = false;  
    this.textSearchReturnsEmpty = false;
    this.mode = this.queueModes.list.name;
    this.filterFunctions = {
        all: this.all,
        inProgress: this.inProgress,
        pastDue: this.pastDue,
        completed: this.completed,
        series: this.series,
        notStarted: this.notStarted,
        noDueDate: this.noDueDate.bind(this),
        optional: this.optionalCourse,
        selectAny: this.selectAnyCourse
    };
    
    this.oTable = null;
    this.oTableOptional = null;
    this.oTableSelectAny = null;
    
    this.rowSelectedLanguage = {};

    this.currentCursor = 0;
    
    this.setMode(mode);
    if("undefined" != typeof id && "" != id){
        this.serverLayoutId = id;
    }
    this.siteDefLang = defLanguage;
    this.DEFAULT_LANGUAGE_INTENG = DEFAULT_LANGUAGE_INTENG;
    this.DEFAULT_LANGUAGE_UKENG = DEFAULT_LANGUAGE_UKENG;
    
};

Lrn.Widget.Queue.prototype = new Lrn.Widget();
Lrn.Widget.Queue.prototype.superclass = Lrn.Widget.prototype;

Lrn.Widget.Queue.prototype.init = function(){
    this.renderListView(this.htmlFrameTableId, this.htmlTableId);
    this.loadQueueData(false);
    this.initFilterSearch();
    this.initTextSearch();
    this.initToggleClick();
    this.initListViewLanguageChange();
    this.initCourseLinkClick();
    initPlaceholderText();
};

Lrn.Widget.Queue.prototype.loadQueueData = function(needRefresh){
    request = $.ajax({
        url: this.ajaxUrl,
        type: "post",
        dataType: "json",
        timeout: 10000,
        async: false,
        data: {refresh:needRefresh},
        success: (function(response){
            this.ajaxOriMyQueueData = response;
            if(response.length == 0){
            	this.queueIsEmpty = true;
            	this.showEmptyAllCompleteAssignementText(true);
            	
            	//clear all empty record text because we are not allow to display
            	var oSetting = this.oTable.fnSettings();
            	oSetting.oLanguage.sEmptyTable = "";
            	oSetting.oLanguage.sZeroRecords = "";
                
                var oSetting = this.oTableOptional.fnSettings();
            	oSetting.oLanguage.sEmptyTable = "";
            	oSetting.oLanguage.sZeroRecords = "";
                
                var oSetting = this.oTableSelectAny.fnSettings();
            	oSetting.oLanguage.sEmptyTable = "";
            	oSetting.oLanguage.sZeroRecords = "";
                
            }else{
            	this.queueIsEmpty = false;
            	this.showEmptyAllCompleteAssignementText(false);
            }
            
            this.processData(this.ajaxOriMyQueueData, this.queueFilterBy);
        }).bind(this),
        error: (function(jqXHR, textStatus, errorThrown){
            this.ajaxOriMyQueueData = null;
        }).bind(this)
    });
};

Lrn.Widget.Queue.prototype.processData = function(oriData, filter){
    //set the all data record variables to empty
    this.queueListVewData = {aaData:[]};
    this.queueImageViewData = [];
    this.queueImageSearchData = [];
    
    this.queueImageViewDataMandatory = [];
    this.queueImageViewDataOptional = [];
    this.queueImageViewDataSelectAny = [];
    
    this.queueImageViewDataCerts = [];
    this.queueImageViewDataAimSurvey = [];
    
    this.setCursor(0);
    this.rowSelectedLanguage = {};
    
    if ("undefined" != typeof oriData.length && oriData.length > 0){
        for(i in oriData){
            if (false != this.filterFunctions[filter](oriData[i])){
                this.queueListVewData.aaData.push(this.buildDataTableData(oriData[i]));
                if( "undefined" != typeof oriData[i].category ) {
                    //this.queueImageViewData.push(oriData[i]);
                    switch( oriData[i].category ) {
                        case "module":
                           if( "undefined" != typeof oriData[i].type ) {
                                if( this.mandatoryCourse(oriData[i]) ){
                                    this.queueImageViewDataMandatory.push(oriData[i]);
                                } else if(this.optionalCourse(oriData[i])) {
                                    this.queueImageViewDataOptional.push(oriData[i]);                                    
                                } else if(this.selectAnyCourse(oriData[i])) {
                                    this.queueImageViewDataSelectAny.push(oriData[i]);
                                }
                            }
                            break;
                        case "certRevise":
                        case "certReview":
                            this.queueImageViewDataCerts.push(oriData[i]);
                            break;
                        case "aimSurvey":
                            this.queueImageViewDataAimSurvey.push(oriData[i]);
                            break;                        
                    }
                }
            }
        }
       
        $.merge( this.queueImageViewDataCerts, $.merge( this.queueImageViewDataMandatory,this.queueImageViewDataAimSurvey) );
        $.merge( this.queueImageViewData, $.merge( this.queueImageViewDataCerts, $.merge( this.queueImageViewDataSelectAny, this.queueImageViewDataOptional ) ) );
        //assigned all data to search
        this.queueImageSearchData = this.queueImageViewData;
    }
    
    //make sure the search box is empty
    $(this.htmlSearchDivBoxId).find('input[type=text]').val('');
    this.oTable.fnFilterAll('');

    //reload new data
    this.dynamicLoad(this.htmlTableId, this.queueListVewData);
};

Lrn.Widget.Queue.prototype.setCursor = function(position){
    this.currentCursor = position;
};

Lrn.Widget.Queue.prototype.getCursor = function(position){
    return this.currentCursor;
};

Lrn.Widget.Queue.prototype.renderListView = function(dynamicDiv, dataTableId){

    //move the filter record to the top page
    $('div.courseOptions').prepend('<div id="'+this.htmlSearchDivBoxId.replace(/[#]/g,'')+'" class="dataTables_filter"><label for="dtSearch">'+this.siteLabels['Search']+': </label> <input id="dtSearch" type="text" placeholder=""><button type="button" role="button" id="dtSearchBtn" aria-label="search" class="viewIcon contentTextIcons font-style4"><span class="fa fa-search"></span><i class="material-icons">&#xE8B6;</i></button></div>');
    
    $(this.htmlSearchDivBoxId).find('label').addClass('contentTextIcons font-style4');
    $(this.htmlSearchDivBoxId).find('input').attr('placeholder', this.siteLabels.EnterTitleOrModuleID);
    //make emtpy tag themable
    $(this.htmlDataTableEmptyTextClass).addClass('contentTextIcons');
    initPlaceholderText();
    
    var tableId = dataTableId.replace(/[#]/g,'');    
    
    $(dynamicDiv).append('<p id="' +tableId+ '_Title" class="statusHeader contentTextIcons">'+ this.siteLabels.Mandatory +'</p><table cellpadding="0" cellspacing="0" border="0" class="display borders" id="' +tableId+ '" style="width: 100%;"><thead class="secondaryBgColor"></thead></table>');
        //render the dataTable
        this.oTable = $(dataTableId).dataTable({
            "aaData": null,
            "bPaginate": false,
            "sDom" : "t" ,
            "fnCreatedRow": function ( row, data, dataIndex) {
               
                 $('.dtCourseTitle',row).attr("tabindex", "0");
                }            ,
            "oLanguage": {
                "sZeroRecords": "<p class='dataTblPtag'>"+this.siteLabels['NoModsToDisplay']+"</p>",
                "sInfoFiltered": "",
                "sInfo": this.builtShowingRecordTranslateText(),
                "sInfoEmpty": this.builtShowingRecordTranslateText(),
                "sSearch":  this.siteLabels['Search']+':'
            },
            "aoColumns": [
                  {"mData": null, "sTitle": this.siteLabels.Status, "bSortable": false, "sWidth": 85, "sClass": "dtCourseStatus contentTextIcons font-style4", "sContentPadding": "mmm"},
                  {"mData": "noneTranslateDueDate", "bSearchable": false, "sTitle": "<p class='dataTblPtag dataTblBtn' role='button'>"+this.siteLabels.Due+"</p>", "bSortable": true, "sType": "date", "sWidth": 140, "sClass": "not-tablet-p dtDueDate contentTextIcons font-style4", "sContentPadding": "mmm", "mRender": function (data, type, rowData){
                	 
                          //$('#'+tableId).before('<p>Mandatory</p>');
                          
                          if (type === 'display'){
                		  if (this.optionalCourse(rowData)){
                			  return this.showOptionalText(rowData);
                		  }
                		  
                		  if (this.noDueDate(rowData)){
                			  return this.siteLabels.NoDueDate;
                		  }
                		  
                          return rowData.dueDate;
                	  }
                	  
                	  //no due date
                	  if(this.noDueDate(rowData)){
                		  return this.datesConstant.first;
                	  }
                	  
                	  //empty
                	  if(!this.optionalCourse(rowData) && this.notACourse(rowData) && ("undefined" == typeof rowData.dueDate || "" == rowData.dueDate || null == rowData.dueDate)){
                		  return this.datesConstant.third;
                	  }
                	  
                	  //optional or have dueDate
                      return !this.optionalCourse(rowData) ? rowData.noneTranslateDueDate : this.datesConstant.second;
                  }.bind(this)},
                  {"mData": "title", "sTitle": "<p class='dataTblPtag dataTblBtn' role='button'>"+this.siteLabels.ModuleTitle+"</p>", "bSortable": true, "bSearchable": true, "sClass": "dtCourseTitle contentTextIcons font-style4", "sContentPadding": "mmm", "mRender": function (data, type, rowData){
                	  if (type === 'display') {
                          return data;
                	  }
                	  
                	  return data != null ? data.replace(/<[^>]*>?/g, '') : '';
                  }},
                  {"mData": null, "sTitle": this.siteLabels.Language, "bSortable": false, "bSearchable":false, "sWidth": 160, "sClass": "desktop dtCourseLanguage contentTextIcons font-style4", "sContentPadding": "mmm"},
                  {"mData": "catalogId", "sTitle": this.siteLabels.CatalogID, "bSortable": false, "bSearchable": true, "bVisible": false, "sClass": "never"}
            ],
            "fnRowCallback": (this.modifyDTRow).bind(this),
            "fnDrawCallback": function(oSettings){ 
                if(oSettings.bSorted){  
                    var table = dataTableId;
                    $(table).find('th > span.fa').remove();
                    $(table).find('th.sorting').append('<span class="fa fa-sort"></span>');  
                    if(oSettings.aaSorting[0][1] == 'asc'){ 
                        $(table).find('th.sorting_asc').append('<span class="fa fa-caret-up"></span>'); 
                    }
                    if(oSettings.aaSorting[0][1] == 'desc'){
                        $(table).find('th.sorting_desc').append('<span class="fa fa-caret-down"></span>'); 
                    }
                }
                //left align the empty queue message
                $('td.dataTables_empty').css({"text-align":"left"});
                $('#'+tableId).find('select').change().delay(500);
            }
        });            

$(dynamicDiv).append('<p id="' +tableId+ '_SelectAny_Title" class="statusHeader contentTextIcons">'+this.siteLabels.Selectany+'</p><table cellpadding="0" cellspacing="0" border="0" class="display borders" id="' +tableId+ '_SelectAny" style="width: 100%;"><thead class="secondaryBgColor"></thead></table>');
        //render the dataTable
        this.oTableSelectAny = $(dataTableId+'_SelectAny').dataTable({
            "aaData": null,
            "bPaginate": false,
            "sDom" : "t" ,
            "fnCreatedRow": function ( row, data, dataIndex) {
               
                 $('.dtCourseTitle',row).attr("tabindex", "0");
             },
            "oLanguage": {
                "sZeroRecords": "<p class='dataTblPtag'>"+this.siteLabels['NoModsToDisplay']+'</p>',
                "sInfoFiltered": "",
                "sInfo": this.builtShowingRecordTranslateText(),
                "sInfoEmpty": this.builtShowingRecordTranslateText()
            },
            "aoColumns": [                 
                  {"mData": null, "sTitle": this.siteLabels.Status, "bSortable": false, "sWidth": 85, "sClass": "dtCourseStatus contentTextIcons font-style4", "sContentPadding": "mmm"},
                  {"mData": "noneTranslateDueDate", "bSearchable": false, "sTitle": "<p class='dataTblPtag dataTblBtn' role='button'>"+this.siteLabels.Due+"</p>", "bSortable": true, "sType": "date", "sWidth": 140, "sClass": "not-tablet-p dtDueDate contentTextIcons font-style4", "sContentPadding": "mmm", "mRender": function (data, type, rowData){
                	 
                          //$('#'+tableId).before('<p>Mandatory</p>');
                          
                          if (type === 'display'){
                		  if (this.optionalCourse(rowData)){
                			  return this.showOptionalText(rowData);
                		  }
                		  
                		  if (this.noDueDate(rowData)){
                			  return this.siteLabels.NoDueDate;
                		  }
                		  
                          return rowData.dueDate;
                	  }
                	  
                	  //no due date
                	  if(this.noDueDate(rowData)){
                		  return this.datesConstant.first;
                	  }
                	  
                	  //empty
                	  if(!this.optionalCourse(rowData) && this.notACourse(rowData) && ("undefined" == typeof rowData.dueDate || "" == rowData.dueDate || null == rowData.dueDate)){
                		  return this.datesConstant.third;
                	  }
                	  
                	  //optional or have dueDate
                      return !this.optionalCourse(rowData) ? rowData.noneTranslateDueDate : this.datesConstant.second;
                  }.bind(this)},
                  {"mData": "title", "sTitle": "<p class='dataTblPtag dataTblBtn' role='button'>"+this.siteLabels.ModuleTitle+"</p>", "bSortable": true, "bSearchable": true, "sClass": "dtCourseTitle contentTextIcons font-style4", "sContentPadding": "mmm", "mRender": function (data, type, rowData){
                	  if (type === 'display') {
                          return data;
                	  }
                	  
                	  return data != null ? data.replace(/<[^>]*>?/g, '') : '';
                  }},
                  {"mData": null, "sTitle": this.siteLabels.Language, "bSortable": false, "bSearchable":false, "sWidth": 160, "sClass": "desktop dtCourseLanguage contentTextIcons font-style4", "sContentPadding": "mmm"},
                  {"mData": "catalogId", "sTitle": this.siteLabels.CatalogID, "bSortable": false, "bSearchable": true, "bVisible": false, "sClass": "never"},
                  {"mData": "group", "sTitle": this.siteLabels.group, "bSortable": false, "bSearchable": false, "bVisible": false, "sClass": "never"}
            ],
            "fnRowCallback": (this.modifyDTRow).bind(this),
            "fnDrawCallback": (this.addSelectAnyGrouping ).bind(this)
        }).rowGrouping({
            iGroupingColumnIndex: 5,
            fnGroupLabelFormat: function (label, oGroup) {
                return '<p class="font-style4 contentTextIcons font-margin font-completion"></p>';
            }
        });        
        
    $(dynamicDiv).append('<p id="' +tableId+ '_Optional_Title" class="statusHeader contentTextIcons">'+this.siteLabels.Optional+'</p><table cellpadding="0" cellspacing="0" border="0" class="display borders" id="' +tableId+ '_Optional" style="width: 100%;"><thead class="secondaryBgColor"></thead></table>');
        //render the dataTable
        this.oTableOptional = $(dataTableId+'_Optional').dataTable({
            "aaData": null,
            "bPaginate": false,
            "sDom" : "t" ,
            "fnCreatedRow": function ( row, data, dataIndex) {
               
                $('.dtCourseTitle',row).attr("tabindex", "0");
            },
            "oLanguage": {
                "sZeroRecords": "<p class='dataTblPtag'>"+this.siteLabels['NoModsToDisplay']+"</p>",
                "sInfoFiltered": "",
                "sInfo": this.builtShowingRecordTranslateText(),
                "sInfoEmpty": this.builtShowingRecordTranslateText()
            },
            "aoColumns": [
                  {"mData": null, "sTitle": this.siteLabels.Status, "bSortable": false, "sWidth": 85, "sClass": "dtCourseStatus contentTextIcons font-style4", "sContentPadding": "mmm"},
                  {"mData": "noneTranslateDueDate", "bSearchable": false, "sTitle": "<p class='dataTblPtag dataTblBtn' role='button'>"+this.siteLabels.Due+"</p>", "bSortable": true, "sType": "date", "sWidth": 140, "sClass": "not-tablet-p dtDueDate contentTextIcons font-style4", "sContentPadding": "mmm", "mRender": function (data, type, rowData){
                	 
                          //$('#'+tableId).before('<p>Mandatory</p>');
                          
                          if (type === 'display'){
                		  if (this.optionalCourse(rowData)){
                			  return this.showOptionalText(rowData);
                		  }
                		  
                		  if (this.noDueDate(rowData)){
                			  return this.siteLabels.NoDueDate;
                		  }
                		  
                          return rowData.dueDate;
                	  }
                	  
                	  //no due date
                	  if(this.noDueDate(rowData)){
                		  return this.datesConstant.first;
                	  }
                	  
                	  //empty
                	  if(!this.optionalCourse(rowData) && this.notACourse(rowData) && ("undefined" == typeof rowData.dueDate || "" == rowData.dueDate || null == rowData.dueDate)){
                		  return this.datesConstant.third;
                	  }
                	  
                	  //optional or have dueDate
                      return !this.optionalCourse(rowData) ? rowData.noneTranslateDueDate : this.datesConstant.second;
                  }.bind(this)},
                  {"mData": "title", "sTitle": "<p class='dataTblPtag dataTblBtn' role='button'>"+this.siteLabels.ModuleTitle+"</p>", "bSortable": true, "bSearchable": true, "sClass": "dtCourseTitle contentTextIcons font-style4", "sContentPadding": "mmm", "mRender": function (data, type, rowData){
                	  if (type === 'display') {
                          return data;
                	  }
                	  
                	  return data != null ? data.replace(/<[^>]*>?/g, '') : '';
                  }},
                  {"mData": null, "sTitle": this.siteLabels.Language, "bSortable": false, "bSearchable":false, "sWidth": 160, "sClass": "desktop dtCourseLanguage contentTextIcons font-style4", "sContentPadding": "mmm"},
                  {"mData": "catalogId", "sTitle": this.siteLabels.CatalogID, "bSortable": false, "bSearchable": true, "bVisible": false, "sClass": "never"}
            ],
            "fnRowCallback": (this.modifyDTRow).bind(this),
            "fnDrawCallback": function(oSettings){ 
                if(oSettings.bSorted){  
                    var table = dataTableId+'_Optional';
                    $(table).find('th > span.fa').remove();
                    $(table).find('th.sorting').append('<span class="fa fa-sort"></span>');  
                    if(oSettings.aaSorting[0][1] == 'asc'){ 
                        $(table).find('th.sorting_asc').append('<span class="fa fa-caret-up"></span>'); 
                    }
                    if(oSettings.aaSorting[0][1] == 'desc'){
                        $(table).find('th.sorting_desc').append('<span class="fa fa-caret-down"></span>'); 
                    }
                }
                //left align the empty queue message
                $('td.dataTables_empty').css({"text-align":"left"});
                $('#'+tableId + '_Optional').find('select').change().delay(500);
            }
        });
    
};

Lrn.Widget.Queue.prototype.addSelectAnyGrouping = function (oSettings)
{
    if (oSettings.bSorted) {
        var table = this.htmlTableId + "_SelectAny";
        $(table).find('th > span.fa').remove();
        $(table).find('th.sorting').append('<span class="fa fa-sort"></span>');
        if (oSettings.aaSorting[0][1] == 'asc') {
            $(table).find('th.sorting_asc').append('<span class="fa fa-caret-up"></span>');
        }
        if (oSettings.aaSorting[0][1] == 'desc') {
            $(table).find('th.sorting_desc').append('<span class="fa fa-caret-down"></span>');
        }
    }
    //left align the empty queue message
    $('td.dataTables_empty').css({"text-align": "left"});
    $(this.htmlTableId + "_SelectAny").find('select').change().delay(500);

    if (oSettings.aiDisplay.length == 0)
    {
        return;
    }

    var nTrs = $(this.htmlTableId + "_SelectAny tbody tr");
    for (var i = 0; i < nTrs.length; i++)
    {
        var iDisplayIndex = oSettings._iDisplayStart + i;

        var dataObj = oSettings.aoData[ oSettings.aiDisplay[iDisplayIndex] ];
        if(dataObj !== undefined)
            $(this.htmlTableId + "_SelectAny").find('.' + dataObj._aData['group']).find('p').html(this.builSelectAnyGroupingText({modulesRemaining: dataObj._aData['modulesRemaining'], reqCourseCnt: dataObj._aData['reqCourseCnt'], totalModules: dataObj._aData['totalModules']}));
    }
};

Lrn.Widget.Queue.prototype.dynamicLoad = function(tableId, data)
{
    $(tableId).show();
    $(tableId+'_Title').show();
    
    $(tableId+'_SelectAny').show();
    $(tableId+'_SelectAny_Title').show();
    
    $(tableId+'_Optional').show();
    $(tableId+'_Optional_Title').show();
        
    var showMandatoryTable = false;
    var showSelectAnyTable = false;
    var showOptionalTable = false;
    
    for (var i in data.aaData){
        if( data.aaData[i].type == 'mandatory' || data.aaData[i].category == 'certRevise' || data.aaData[i].category == 'certReview' || data.aaData[i].category == 'aimSurvey') {
            showMandatoryTable = true;
        } else if( data.aaData[i].type == 'selectany' ) {
            showSelectAnyTable = true;
        } else if( data.aaData[i].type == 'optional' ) {
            showOptionalTable = true;
        }
    };
    
    if( !showMandatoryTable ) {
        $(tableId+'_Title').hide();
        $(tableId).hide();
    }
    if( !showSelectAnyTable ) {
        $(tableId+'_SelectAny_Title').hide();
        $(tableId+'_SelectAny').hide();
    }
    if( !showOptionalTable ) {
        $(tableId+'_Optional_Title').hide();
        $(tableId+'_Optional').hide();
    }
    
    var oTable = $(tableId).dataTable();
    oSettings = this.oTable.fnSettings();
    
    oTable.fnClearTable();
    
    for (var i in data.aaData){
        if( data.aaData[i].type == 'mandatory' || data.aaData[i].category == 'certRevise' || data.aaData[i].category == 'certReview' || data.aaData[i].category == 'aimSurvey') {
            var rowData = jQuery.extend({}, data.aaData[i]);
            oTable.oApi._fnAddData(oSettings,  rowData);
        }
    };
    
    oTable.fnDraw();

    var oTable = $(tableId+'_Optional').dataTable();
    oSettings = this.oTableOptional.fnSettings();
    
    oTable.fnClearTable();
    
    for (var i in data.aaData){
        if( data.aaData[i].type == 'optional') {
            var rowData = jQuery.extend({}, data.aaData[i]);
            oTable.oApi._fnAddData(oSettings,  rowData);
        }
    };
    
    oTable.fnDraw();
    
    var oTable = $(tableId+'_SelectAny').dataTable();
    oSettings = this.oTableSelectAny.fnSettings();
    
    oTable.fnClearTable();
    
    for (var i in data.aaData){
        if( data.aaData[i].type == 'selectany') {
            var rowData = jQuery.extend({}, data.aaData[i]);
            oTable.oApi._fnAddData(oSettings,  rowData);
        }
    };
    
    oTable.fnDraw();  
    if(this.mode === this.queueModes.list.name){
        if(!showMandatoryTable && !showSelectAnyTable && !showOptionalTable && !$(this.htmlEmptyQueueTextBoxId).is(':visible')){
            $(this.htmlEmptyListTextDivBoxId).show();
        }else{
            $(this.htmlEmptyListTextDivBoxId).hide();
        }
    }
};

Lrn.Widget.Queue.prototype.clearImageViewQueue = function(){
    $(this.htmlImageQWraper).find('.mqItem').remove();
    $('.courseSeparator').remove();
    
    if (true == this.queueIsEmpty){
    	$(this.htmlEmptyTextDivBoxId).hide();
    }else{
    	$(this.htmlEmptyTextDivBoxId).show();
    }
}

Lrn.Widget.Queue.prototype.modifyDTRow = function(nRow, aData, iDisplayIndex, iDisplayIndexFull){
	var iconsStr = this.buildStatusIcons(aData);
	
	// If the ID is CertReview then append certReview at the end
	if ( 'certReview'== aData.id ){
		this.htmlCourseLinkClass += aData.id;
	}
	else {
		// Restore Default otherwise
		this.htmlCourseLinkClass = 'courseLink';
	}
	
	var cTitle = aData.title != null ? aData.title.replace(/<[^>]*>?/g, ''): '';
	var titleStr = '<a href="' +aData.destination+ '" class="' +this.htmlCourseLinkClass+ ' contentTitles" data-windowopen="' +this.windowOpenStatus(aData)+ '" data-certificationid="' +aData.certificationId+ '">' +this.buildChainIcon(aData)+ '<span class="courseTitle">' +cTitle + '</span></a>';
	var titleObj = $(titleStr);
	var languageDropdown = '';
	
	//assigned the course Id to 
	$(nRow).data("rowId", aData.id);
    $(nRow).find('td:nth-child(1)').html(iconsStr);
    $(nRow).find('td.dtCourseTitle').addClass('contentTitles');
    $(nRow).addClass('borderBottomThin');
    if (aData.languages.length > 1){
    	languageDropdown = $('<select>', {'class': this.htmlQLanguageClass, 'rowid': aData.id, 'rowType':aData.type});
    	var userLangEbld = 'N';
    	var defOption = '';
    	var userLangSystemId = '';
    	var langSysId = '';
    	var enSystemId = '';
    	var enUKSystemId = '';
    	var enIESystemId = '';
    	for(i in aData.languages){
    		if(aData.userModulePrefLang != null && aData.userModulePrefLang == aData.languages[i].langCode){
    			userLangEbld = 'Y';
    			langSysId = aData.languages[i].systemId;
    		}
    		if(this.siteDefLang == aData.languages[i].langCode){    			
    			userLangSystemId = aData.languages[i].systemId;
    		}
			if(this.DEFAULT_LANGUAGE_INTENG == aData.languages[i].langCode){
    			enIESystemId = aData.languages[i].systemId;
    		}
			if(this.DEFAULT_LANGUAGE_UKENG == aData.languages[i].langCode){
    			enUKSystemId = aData.languages[i].systemId;
    		}
			if (aData.systemId == aData.languages[i].systemId){
				defOption = aData.languages[i].langCode;
			}
    	}
    	if(userLangEbld == 'N'){
    		if(userLangSystemId != ''){
    			userLangEbld = 'Y';
    			langSysId = userLangSystemId;
    		} else if(enIESystemId != ''){
    			userLangEbld = 'Y';
    			langSysId = enIESystemId;
    		} else if(enUKSystemId != ''){
    			userLangEbld = 'Y';
    			langSysId = enUKSystemId;
    		}
    	}
    	
    	for(i in aData.languages){
    		var optionObj = $('<option>', {value : aData.languages[i].langCode}).text(aData.languages[i].language).data('title', aData.languages[i].title).data('url', aData.languages[i].destination);
    		
    		if("undefined" !== typeof this.rowSelectedLanguage['row'+aData.id]){
    			//if the language already selected before
    			if(this.rowSelectedLanguage['row'+aData.id] == optionObj.val()){
    				optionObj.attr("selected", "selected");
    			}
    		}else if(langSysId == aData.languages[i].systemId){
    			userLangEbld = 'Y';
    			//select default language
    			optionObj.attr("selected", "selected");
    			titleStr = '<a href="' +aData.destination+ '" class="' +this.htmlCourseLinkClass+ ' contentTitles" data-windowopen="' +this.windowOpenStatus(aData)+ '" data-certificationid="' +aData.certificationId+ '">' +this.buildChainIcon(aData)+ '<span class="courseTitle">' +aData.languages[i].title.replace(/<[^>]*>?/g, '')+ '</span></a>';
    			titleObj = $(titleStr);
    			defOption = aData.languages[i].langCode;
    		}   		
    		languageDropdown.append(optionObj);
    	}
	    	if(userLangEbld == 'N' && defOption != ''){
	    		languageDropdown.val(defOption).attr('selected','selected');
	    	}
    	titleObj.attr('href', languageDropdown.find("option:selected").data('url'));
    }else if(aData.languages.length == 1){
    	languageDropdown = aData.languages[0].language;
    }
    $(nRow).find('td:nth-child(3)').html(titleObj[0]);
    $(nRow).find('td.dtCourseLanguage').html(languageDropdown);
    return nRow;
};

Lrn.Widget.Queue.prototype.initFilterSearch = function(){
    $(this.htmlFilterCourse).change({qObj:this}, function(e){
        e.data.qObj.clearImageViewQueue();
        e.data.qObj.queueFilterBy = $(this).val();
        e.data.qObj.processData(e.data.qObj.ajaxOriMyQueueData, e.data.qObj.queueFilterBy);
        e.data.qObj.lazyLoadObj.init();
    });
 };

Lrn.Widget.Queue.prototype.initListViewLanguageChange = function(){
	$('.' +this.htmlQLanguageClass).live('change', {qObj: this}, function(e, triggerImageView){
		var type = $(this).attr('rowtype');
                var dataTableObject;
                switch(type){
                    case 'mandatory':
                        dataTableObject = e.data.qObj.oTable;
                        break;
                    case 'selectany':
                        dataTableObject = e.data.qObj.oTableSelectAny;
                        break;
                    case 'optional':
                        dataTableObject = e.data.qObj.oTableOptional;
                        break;
                    default : 
                        dataTableObject = e.data.qObj.oTable;
                        break;
                }
		var idx = dataTableObject.fnGetPosition($(this).closest('tr')[0]);
		var id = $(this).closest('tr').data('rowId');
		
		//change the course title and url
		$(this).closest('td').siblings('td').find('span.courseTitle').html($(this).find("option:selected").data('title'));
		$(this).closest('td').siblings('td').find('a.courseLink').attr('href', $(this).find("option:selected").data('url'));
		
		//mark the selected language
		e.data.qObj.rowSelectedLanguage['row'+$(this).closest('tr').data('rowId')] = $(this).find("option:selected").val();
		
		//update dataTable data for the search
		dataTableObject.fnUpdate($(this).closest('tr').find('td:nth-child(3)').html(), idx, 2, false, false);
		
		if(false != triggerImageView){
			//trigger the change on imageView as well
			$('#'+id).find('select.mqItemLangSelect').val($(this).find("option:selected").val()).trigger('change', false);
		}
	});
}

Lrn.Widget.Queue.prototype.initTextSearch = function(){
    
   //$("div.dataTables_filter input").unbind();
    $( "#dtSearchBtn" ).click({qObj:this},function(e) {
        
        // initial blank search on click of serach button
        var searchStr = "";
        e.data.qObj.oTable.fnFilterAll(searchStr);
        e.data.qObj.queueImageSearchData = e.data.qObj.queueImageViewData;
        // blank search  completed
    	var searchStr = $("#dtSearch").val();
        if("" == $.trim(searchStr) ||searchStr == $("#dtSearch").attr('placeholder')) {
            searchStr = "";
        }
        //console.log(searchStr);
        e.data.qObj.oTable.fnFilterAll(searchStr);
        e.data.qObj.textSearchReturnsEmpty = false;
        if($('.dataTables_empty').length > 0)
            e.data.qObj.textSearchReturnsEmpty = true;
        
    	e.data.qObj.queueImageSearchData = [];
    	e.data.qObj.setCursor(0);
        //console.log(searchStr);
    	if("" == $.trim(searchStr)){
            e.data.qObj.queueImageSearchData = e.data.qObj.queueImageViewData;
    	}else{
    		var re = /[; ,]*(\w+)[; ,]*/g;
    		searchStr = searchStr != '' ? searchStr.replace(re, "(?=.*$1)") : '';

    		for(var i in e.data.qObj.queueImageViewData){
    			var name = e.data.qObj.queueImageViewData[i].name;
    			
    			if ("undefined" != typeof e.data.qObj.rowSelectedLanguage['row'+e.data.qObj.queueImageViewData[i].id]){
    				for(var j in e.data.qObj.queueImageViewData[i].languages){
    					if (e.data.qObj.queueImageViewData[i].languages[j].language == e.data.qObj.rowSelectedLanguage['row'+e.data.qObj.queueImageViewData[i].id]){
    						name =  e.data.qObj.queueImageViewData[i].languages[j].courseShortName;
    					}
    				}
    			}
    			
    			if(("undefined" != typeof e.data.qObj.queueImageViewData[i].catalogId && -1 != e.data.qObj.queueImageViewData[i].catalogId.search(new RegExp(searchStr, "i")))
    				|| ("undefined" != typeof e.data.qObj.queueImageViewData[i].name && -1 != name.search(new RegExp(searchStr, "i")))){
    				e.data.qObj.queueImageSearchData.push(e.data.qObj.queueImageViewData[i]);
    			}
    		}
    	}
    	
    	e.data.qObj.clearImageViewQueue();
    	e.data.qObj.lazyLoadObj.init();
    	
        //make empty tag themable
        $(e.data.qObj.htmlDataTableEmptyTextClass).addClass('contentTextIcons');
    });
}

Lrn.Widget.Queue.prototype.initToggleClick = function(){
    $(this.htmlViewToggleId).click({qObj:this}, function(e){
        e.data.qObj.toggleView(e.data.qObj.mode);
    });
}

Lrn.Widget.Queue.prototype.initCourseLinkClick = function(){
    if(this.htmlCourseLinkClass != "courseLinkcertReview"){
	$("." +this.htmlCourseLinkClass).live('click', {qObj:this}, function(e){
        if(true == $(this).data('windowopen')){
        	e.preventDefault();
        	var element = $(this)[0];
        	
        	var certificateWindow = window.open($(this).attr('href'), '_blank' ,'channelmode=0,directories=0,fullscreen=0,width=900,height=600,top=0,left=0,menubar=0,resizable=0,scrollbars=1,status=0,titlebar=0,toolbar=0');
        	
			var interval = setInterval(function(){
				if(certificateWindow.closed) {
					this.lazyLoadObj.spinner.fadeIn();
				    //ajax call to check the return certification is completed or not
					request = $.ajax({
				        url: this.ajaxReturnCertUrl,
				        type: "post",
				        dataType: "json",
				        data: {certId: $(element).data('certificationid')},
				        timeout: 10000,
				        async: false,
				        success: (function(response){
				            if("undefined" != typeof response.completed && true == response.completed){
				            	//if the return certificate is completed then refesh my queue;
				                this.loadQueueData(true);
				            	this.clearImageViewQueue();
				            	this.lazyLoadObj.init()
				            }
				            
				            this.lazyLoadObj.spinner.fadeOut();
				        }).bind(this),
				        error: (function(jqXHR, textStatus, errorThrown){
				        	this.lazyLoadObj.spinner.fadeOut();
				        }).bind(e.data.qObj)
				    });
				    
		        	clearInterval(interval);
				}
    		}.bind(e.data.qObj), 100);
        }
    });}
	
	/* Click event for CertReview link */
	// Making the popup object to handle unfocus event
	var certificateWindow = '';
	$(".courseLinkcertReview").live('click', {qObj:this}, function(e){
		
        if(true == $(this).data('windowopen')){
        	e.preventDefault();
        	var element = $(this)[0];
        	
        	certificateWindow = window.open($(this).attr('href'), '_blank' ,'channelmode=0,directories=0,fullscreen=0,width=' +($(document).width()-50)+ ',height=600,menubar=0,resizable=1,scrollbars=1,status=0,titlebar=0,toolbar=0,location=1');
        	
			var interval = setInterval(function(){
				if(certificateWindow.closed) {
					this.lazyLoadObj.spinner.fadeIn();
				    //ajax call to check the return certification is completed or not
					request = $.ajax({
				        url: this.ajaxReturnCertUrl,
				        type: "post",
				        dataType: "json",
				        data: {certId: $(element).data('certificationid')},
				        timeout: 10000,
				        async: false,
				        success: (function(response){
				            if("undefined" != typeof response.completed && true == response.completed){
				            	//if the return certificate is completed then refesh my queue;
				                this.loadQueueData(true);
				            	this.clearImageViewQueue();
				            	this.lazyLoadObj.init()
				            }
				            
				            this.lazyLoadObj.spinner.fadeOut();
				        }).bind(this),
				        error: (function(jqXHR, textStatus, errorThrown){
				        	this.lazyLoadObj.spinner.fadeOut();
				        }).bind(e.data.qObj)
				    });
				    
		        	clearInterval(interval);
				}
    		}.bind(e.data.qObj), 100);
        }
    });
	
	$(window).unload(function(e) {
		if (null != certificateWindow && false == certificateWindow.closed){
			certificateWindow.close();
		}
	});
	
	$(window).on('beforeunload', function(e){
		var path = location.pathname.split("/");
		
		if (null != certificateWindow && false == certificateWindow.closed && !(path[1] == "profile" && path[2] == "edit")){
			return "Your LCEC Admin window will be closed. Please save your changes!";
		}
	});  
	
}

Lrn.Widget.Queue.prototype.toggleView = function(mode){
    if(mode == this.queueModes.image.name){
        this.setMode(this.queueModes.list.name, true);
    }else{
        this.setMode(this.queueModes.image.name, true);
    }
}

Lrn.Widget.Queue.prototype.setMode = function(mode, ServerUpdate){
    
    if(true == ServerUpdate){
        this.serverModeUpdate(mode);
    }
   
    if(mode == this.queueModes.image.name){
        this.mode = this.queueModes.image.name;
        $(this.queueModes.image.id).show();
        $(this.htmlEmptyListTextDivBoxId).hide();
        $(this.queueModes.list.id).hide();
       // $(this.htmlToggleViewButtonId).html(this.siteLabels.ListView);
       //$(this.htmlToggleViewButtonId).attr('aria-pressed', true);
        $(this.htmlToggleViewButtonId).attr('aria-label', this.siteLabels.ListView);
        $(this.htmlViewToggleId).html('<span class="fa fa-th-list"></span><i class="material-icons toggleBtn">&#xE8EF;</i>');
    }else{
        //$(this.htmlToggleViewButtonId).html(this.siteLabels.ImgView);
        //$(this.htmlToggleViewButtonId).attr('aria-pressed', true);
        $(this.htmlToggleViewButtonId).attr('aria-label', this.siteLabels.ImgView);
        $(this.htmlViewToggleId).html('<span class="fa fa-list-ul"></span><i class="material-icons toggleBtn">&#xE8EE;</i>');
        this.mode = this.queueModes.list.name;
        $(this.queueModes.list.id).show();
        
        if(!$(this.htmlEmptyTextDivBoxId).is(':visible')){
            $(this.htmlEmptyListTextDivBoxId).hide();
        }else if(!$(this.htmlEmptyQueueTextBoxId).is(':visible') && !this.textSearchReturnsEmpty){
            $(this.htmlEmptyListTextDivBoxId).show();
        }      
        $(this.queueModes.image.id).hide();
    }
    this.hideShowModuleWrappers(this.queueIsEmpty);
}

Lrn.Widget.Queue.prototype.serverModeUpdate = function(mode){
    var serverMode = null;
    
    if(mode == this.queueModes.image.name){
        serverMode = 'imageView';
        //$(this.htmlToggleViewButtonId).html(this.siteLabels.ListView);
        $(this.htmlToggleViewButtonId).attr('aria-label', this.siteLabels.ListView);
        $(this.htmlViewToggleId).html('<span class="fa fa-th-list"></span><i class="material-icons toggleBtn">&#xE8EF;</i>');
    }else{
        serverMode = 'listView';
        //$(this.htmlToggleViewButtonId).html(this.siteLabels.ImgView);
        $(this.htmlToggleViewButtonId).attr('aria-label', this.siteLabels.ImgView);
        $(this.htmlViewToggleId).html('<span class="fa fa-list-ul"></span><i class="material-icons toggleBtn">&#xE8EE;</i>');
    }
    
    request = $.ajax({
        url: this.ajaxModeUrl,
        type: "post",
        dataType: "json",
        data: {layout: serverMode, layout_id: (null==this.serverLayoutId ? '' : this.serverLayoutId)},
        timeout: 10000,
        async: false,
        success: (function(response){
            if(false != response && false != response.success){
                //update layoutId
            	if("undefined" != typeof response.dataObject 
            	   && "undefined" != typeof response.dataObject.userSettingsList
            	   && "undefined" != typeof response.dataObject.userSettingsList.UserSettingDTO){
            		this.serverLayoutId = response.dataObject.userSettingsList.UserSettingDTO.id;
            	}
            }
        }).bind(this),
        error: (function(jqXHR, textStatus, errorThrown){
        }).bind(this)
    });
}

//helper functions
Lrn.Widget.Queue.prototype.all = function(record){
    return true;
};

//in progress check
Lrn.Widget.Queue.prototype.inProgress = function(record){
    if("undefined" != typeof record.inProgress && 'true' == record.inProgress){
        return true;
    }
    
    return false;
};

//passed due check
Lrn.Widget.Queue.prototype.pastDue = function(record){
    if(record.optional != 2 && record.optional != 3 && record.dueDate !== null && true == record.pastDueDate && record.moduleCompleted != "true"){
        return true;
    }
    
    return false;
};

//completed check
Lrn.Widget.Queue.prototype.completed = function(record){
    if ("undefined" != typeof record.moduleCompleted && "true" == record.moduleCompleted){
        return true;
    }
    
    return false;
};

//chain check
Lrn.Widget.Queue.prototype.series = function(record){
    if (record.total){
        return true;
    }
    
    return false;
};

//notStarted check
Lrn.Widget.Queue.prototype.notStarted = function(record){
	if(false == this.inProgress(record) && false == this.completed(record)){
		return true;
	}
	
	return false;
};

//noDueDate check
Lrn.Widget.Queue.prototype.noDueDate = function(record){
	if(!this.notACourse(record) && !this.optionalCourse(record) && ("undefined" == typeof record.dueDate || "" == record.dueDate || null == record.dueDate)){
		return true;
	}
	
	return false;
};

Lrn.Widget.Queue.prototype.buildDataTableData = function(record){
    var row = {};
    
    row.id = record.id;
    row.title = record.name;
    row.catalogId = record.catalogId || null;
    row.dueDate = this.optionalCourse(record) ? '' : record.dueDate;
    row.category = record.category;
    row.pastDue = record.pastDue;
    row.pastDueDate = record.pastDueDate;
    row.noneTranslateDueDate = record.noneTranslateDueDate || '';
    row.moduleCompleted = record.moduleCompleted;
    row.completionDate = record.completionDate;
    row.moduleChainId = record.moduleChainId;
    row.optional = record.optional;
    row.inProgress = record.inProgress;
    row.total = record.total;
    row.sequence = record.sequence;
    row.systemId = record.systemId;
    row.destination = this.buildCourseUrl(record);
    row.sentBackForRevision = record.sentBackForRevision;
    row.notACourse = record.notACourse;
    row.certificationId = record.certificationId || null;
    row.userModulePrefLang = record.userModulePrefLang || null;
    row.type = record.type;
    row.group = record.group;
    row.totalModules = record.totalModules;
    row.modulesRemaining = record.modulesRemaining;
    row.reqCourseCnt = record.reqCourseCnt;
            
    row.languages = [];
    if("undefined" != typeof record.languages && null != record.languages && record.languages.length>0){
        for(var i in record.languages){
            row.languages.push({
                langCode: record.languages[i].language,
                title: record.languages[i].courseShortName,
                moduleId: record.languages[i].moduleId,
                language: record.languages[i].label,
                systemId: record.languages[i].systemId,
                destination: this.buildCourseUrlForLanguage(row.destination, record.languages[i].systemId)
            });
        }
    }

    return row;
};

Lrn.Widget.Queue.prototype.buildStatusIcons = function(rowData){
    var icons = ''; 
    
    var pastDueText = this.siteLabels.PastDue;
    var inProgressText = this.siteLabels.InProgress;
    var completedText = this.siteLabels.Completed;
    
    if(this.completed(rowData)){
        icons = '<p class="completed defaultStyle"><span class="read-only">'+completedText+'</span></p><p class="traditionalStyle contentTextIcons"><span class="read-only">'+completedText+'</span><i class="material-icons complete" aria-hidden="true" title="'+completedText+'">&#xE86C;</i></p>';
    }else{
        if(this.pastDue(rowData)){            
            //if select any module which is not required & is past due then do not show status icon of past due
            if( this.selectAnyCourse( rowData ) ) {
                if( rowData.modulesRemaining == 0 && rowData.moduleCompleted != "true" ) {
                     icons = '';
                } else {
                    icons = '<p class="pastDue defaultStyle"><span class="read-only">'+pastDueText+'</span></p><p class="traditionalStyle  contentTextIcons"><span class="read-only">'+pastDueText+'</span><i class="material-icons due" aria-hidden="true" title="'+pastDueText+'">&#xE000;</i></p>';
                }
            } else {
		    icons = '<p class="pastDue defaultStyle"><span class="read-only">'+pastDueText+'</span></p><p class="traditionalStyle  contentTextIcons"><span class="read-only">'+pastDueText+'</span><i class="material-icons due" aria-hidden="true" title="'+pastDueText+'">&#xE000;</i></p>';
            }
            
        }
        if(this.inProgress(rowData)){
            icons += '<p class="inProgress defaultStyle"><span class="read-only">'+inProgressText+'</span></p><p class="traditionalStyle  contentTextIcons"><span class="read-only">'+inProgressText+'</span><i class="material-icons wip" aria-hidden="true" title="'+inProgressText+'">&#xE422;</i></a></p>';
        }        
    }

    return icons;
};

Lrn.Widget.Queue.prototype.buildChainIcon = function(rowData){
    var chains = '';
    if(this.series(rowData)){
        var total = parseInt(rowData.sequence,10) + parseInt(rowData.total,10) - 1;
        chains =    '<span class="contentTextIcons">'+rowData.sequence+'/'+total+'</span> '+
                    '<span class="fa fa-link contentTextIcons"></span> '+
                    '<span role="img" aria-label="Chain" aria-hidden="true" tabindex="0" class="material-icons chain-middle-content contentTitles">&#xE260;</span><span class="arialHiddenSpan" >Chain</span>';

     }
    
    return chains;
};

Lrn.Widget.Queue.prototype.buildCourseUrl = function(rowData){
	var url = '';
	
	url = rowData.destination;
	if(this.completed(rowData)){
		url = rowData.destination.replace(/curriculumId=[0-9]+/,"curriculumId=-1");
	}

	return url;
};

Lrn.Widget.Queue.prototype.buildCourseUrlForLanguage = function(url, languageSystemId){
	var languageUrl = '';
	var vars = []
	
    var q = url.split('?')[1];
    if(q != undefined){
        q = q.split('&');
        for(var i = 0; i < q.length; i++){
            hash = q[i].split('=');
            vars.push(hash[1]);
            vars[hash[0]] = hash[1];
        }
    }
    
    if ("undefined" != typeof vars['systemId']){
    	languageUrl = url.replace('systemId='+vars['systemId'], 'systemId='+languageSystemId);
    }
    
    return languageUrl;
};

Lrn.Widget.Queue.prototype.showOptionalText = function(rowData){
	var optional = '';
	
	if(this.optionalCourse(rowData)){
		optional = this.siteLabels.Optional;
	}
	
	return optional;
};

Lrn.Widget.Queue.prototype.mandatoryCourse = function(rowData){
	if(("undefined" != typeof rowData.type) && ("mandatory" == rowData.type)){
		return true;
	}
	
	return false;
};

Lrn.Widget.Queue.prototype.optionalCourse = function(rowData){
	if(("undefined" != typeof rowData.optional) && ("2" == rowData.optional || "3" == rowData.optional)){
		return true;
	}
	
	return false;
};

Lrn.Widget.Queue.prototype.selectAnyCourse = function(rowData){
	if(("undefined" != typeof rowData.type) && ("selectany" == rowData.type)){
		return true;
	}
	
	return false;
};

Lrn.Widget.Queue.prototype.windowOpenStatus = function(rowData){
	if(("undefined" != typeof rowData.sentBackForRevision && true == rowData.sentBackForRevision) || rowData.category == "aimSurvey"){
		return true;
	}
	
	return false;
};

Lrn.Widget.Queue.prototype.notACourse = function(rowData){
	if("undefined" != typeof rowData.notACourse && true == rowData.notACourse){
		return true;
	}
	
	return false;
};

Lrn.Widget.Queue.prototype.builSelectAnyGroupingText = function( rowData ){
        var modulesCompletedText = this.siteLabels.COMPLETED;
        if( rowData.modulesRemaining > 0 ) {
          modulesCompletedText = this.siteLabels.NREMAINING.replace("%N%", rowData.modulesRemaining );
        }
        var completeXofYText = this.siteLabels.CompleteXofY.replace("%X%", rowData.reqCourseCnt ).replace("%Y%", rowData.totalModules );
        
        return completeXofYText + ': ' + modulesCompletedText;
};

Lrn.Widget.Queue.prototype.builtShowingRecordTranslateText = function(){
	return this.siteLabels['ShowingEntries'].replace("%numRecords%", "_TOTAL_");
};

Lrn.Widget.Queue.prototype.showEmptyAllCompleteAssignementText = function(display){
    if (true == display) {
        $(this.htmlEmptyQueueTextBoxId).show();
        $(this.htmlDataTableFilterTextId).hide();
        $(this.htmlDataTableEmptyTextClass).hide();
        $(this.htmlEmptyTextDivBoxId).removeClass('contentTextIcons');
        $(this.htmlEmptyTextDivBoxId).addClass('contentTitles');
    } else {
        $(this.htmlEmptyQueueTextBoxId).hide();
        $(this.htmlDataTableFilterTextId).show();
        $(this.htmlDataTableEmptyTextClass).show();
        $(this.htmlEmptyTextDivBoxId).addClass('contentTextIcons');
        $(this.htmlEmptyTextDivBoxId).removeClass('contentTitles');
    }
    this.hideShowModuleWrappers(display);
}

/**
 * Function to show/hide queue list/image wrapper
 * 
 * Show/hide if queue is completely empty based on layout mode i.e. imageview/listview
 * 
 * @param boolean isEmptyQueue
 * @returns void
 */
Lrn.Widget.Queue.prototype.hideShowModuleWrappers = function(isEmptyQueue){
    
    var tableId = (this.mode === this.queueModes.image.name) ? this.htmlImageQWraper : this.htmlFrameTableId;
    
    if(false === isEmptyQueue){
        $(tableId).show();
    }else{
        $(tableId).hide();
    }
};
//end helper functions
