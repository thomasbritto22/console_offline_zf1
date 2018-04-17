/* 
 * Adding custom error handler for javascript
 */
function appendErrorMessage(errCode,errMsg){
    
 $( ".content" ).prepend( '<div id="errorWrapper" class="contentWrapper"><div id="errorTop"><p class="messageTop"><span>Sorry, there is no data to display.</span><br></p></div><div id="errorBottom"><p class="messageBottomDash"></p></div></div>' );

}


function customErrorMessage(errCode){
    var errMsg = "";
    switch(errCode){
        case "ER0001":
            errMsg = "Dasboard Id is not present in database";
            break;
        case "ER0002":
            errMsg = "Site id is getting null from database";
            break;
        case "ER0003":
            errMsg = "Dashboard id should not be null or blank";
            break;
        case "ER0004":
            errMsg = "Site id should not be null or blank";
            break;
        case "ER0005":
            errMsg = "Dashboard id should not be null or blank";
            break;
    }
    appendErrorMessage(errCode,errMsg);
}