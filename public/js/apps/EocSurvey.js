if(typeof(Lrn) == 'undefined') Lrn = {};
if(typeof(Lrn.Application) == 'undefined') Lrn.Application = {};

/**
 * --- END OF COURSE SURVEY ---
 * This object handles the funtionality for the survey
 * that users take when they have completed a course.
 * @returns {Lrn.Application.EocSurvey}
 */
Lrn.Application.EocSurvey = function(){ };

/**
 * --- EOC SURVEY PROTOTYPE ---
 * We want to make EOCSurvey a subclass of Application so
 * we will set the EOCSurvey.prototype to the Lrn.Application object
 * and make sure we have the superclass available for
 * overriding methods from Lrn.Application.
 */
Lrn.Application.EocSurvey.prototype = new Lrn.Application();
Lrn.Application.EocSurvey.prototype.superclass = Lrn.Application.prototype;

/**
 * --- GET SURVEY DATA ---
 * @param id
 */
Lrn.Application.EocSurvey.prototype.getSurveyData = function(id, catalogid) {
    var surveyMgr = this;
    surveyMgr.id = id;
    $.ajax({
        dataType: 'json',
        url: '/learn/eocsurveydata?surveyid=' + id + '&catalogid='+ catalogid,
        success: function(json){
            // set the data from the response
            surveyMgr.displaySurveyData(json);
        },
        error: function(){
            alert('There was a problem with AJAX requesting the survey.');
        }
    });
};

/**
 * --- DISPLAY SURVEY DATA ---
 */
Lrn.Application.EocSurvey.prototype.displaySurveyData = function(surveydata){
    var surveyMgr = this;
    document.getElementById('survey-summary').innerHTML = surveydata.notes;
    surveyMgr.surveyQuestionsData = surveydata.surveyQuestionDetailDTOs.SurveyQuestionDetailDTO;
    surveyMgr.catalogId = surveydata.catalogId;
    var len = surveyMgr.surveyQuestionsData.length;
    for (var i=0; i<len; i++){
        surveyMgr.addSurveyQuestion(surveyMgr.surveyQuestionsData[i]);                        
                                    
    }
    document.getElementById('surveysubmit').onclick = function(){
                    surveyMgr.submitSurvey(); 
               }; 
};


/**
 * --- ADD SURVEY QUESTION ---
 * @param questiondata
 */
Lrn.Application.EocSurvey.prototype.addSurveyQuestion = function(questiondata){
    
    var parentEl = document.getElementById('survey-quesetions');
    var questionDiv = document.createElement('div');
    var hr = document.createElement("hr");
    parentEl.appendChild(hr);
    
    questionDiv.innerHTML = questiondata.question;
    questionDiv.className = "survey_summary";
    parentEl.appendChild(questionDiv);
    
    var options = questiondata.options.UserSurveyQuestionOptionDTO;
    if(options.length > 1)
    {
        for (var i =0; i<options.length; i++)
        {
            var container = document.createElement('p');
            container.className = "survey_option";
            container.style.paddingBottom='0px';
            container.style.paddingTop='0px';
            container.style.marginBottom='0px';
            container.style.marginTop='5px';
            
            // can't use DOM scripting for radio buttons
            // because IE doesn't allow dynamic setting of name
            // we're just going to do the innerHTML method
            // for the input and label
            var inputId = questiondata.questionId + "_" + options[i].questionOptionId;
            var inputName = questiondata.questionId;
            var inputValue = options[i].questionOption;
            var inputEl = '<input type="radio" id="'+inputId+'" name="'+inputName+'" value="'+inputValue+'" /> ';
            
            // create label
            var inputLabel = '<label for="' + questiondata.questionId + '">' + options[i].questionOption + '</label>';
            
            // append to container using innerHTML
            container.innerHTML = inputEl + inputLabel;
            
            // append question/choice container to parent element
            parentEl.appendChild(container);
        }
    }

    else 
    {
        var container = document.createElement('p');
        var newTextArea = document.createElement("textarea");
        newTextArea.rows = 6;
        newTextArea.cols = 66;
        newTextArea.id = options.questionOptionId;
        newTextArea.name = questiondata.questionId;
        container.appendChild(newTextArea);
        parentEl.appendChild(container);
    
    }
};

/**
 * --- SUBMIT SURVEY ---
 */
Lrn.Application.EocSurvey.prototype.submitSurvey = function() {
    var surveyMgr = this;
    var surveyData = "";
    var questionsdata = this.surveyQuestionsData;
    for (var i=0; i<questionsdata.length; i++){
        var questiondata = questionsdata[i];                        
        var options = questiondata.options.UserSurveyQuestionOptionDTO;
        if(options.length > 1){
            for (var j =0; j<options.length; j++)
            {
            
                if(document.getElementById(questiondata.questionId + "_" + options[j].questionOptionId).checked){
                    surveyData += questiondata.questionId + ":";
                    surveyData += options[j].questionOptionId+",";
                }
            }
        }else{
            surveyData += questiondata.questionId + ":";
            surveyData += options.questionOptionId + "||";
            surveyData += document.getElementById(options.questionOptionId).value+",";
            
        }
    }
    
    $.ajax({
        dataType: 'json',
        url: '/learn/eocsurveysubmit?surveyid=' + this.id + '&catalogid='+ surveyMgr.catalogId + '&surveyData='+surveyData,
        success: function(response){
            // set the data from the response
            location.href = "/learn/eocsurveycomplete";
            
        },
        error: function(){
            alert('There was a problem submitting the survey.');
        }
    });
};

/**
 * --- SURVEY COMPLETED ---
 */
Lrn.Application.EocSurvey.prototype.surveyCompleted = function() {
    var surveyEl = document.getElementById('survey');
    surveyEl.innerHTML = "Thank you for participating in this survey. Your feedback is appreciated and will be used to improve our courses.";
    
    $('#surveyclose').on('click', function(){
        window.location = '/';
    });
};