// ==UserScript==
// @name      Syrnia Botcheck Bot
// @namespace   http://github.com/Makeshift
// @author      PatchworkTiger
// @include     http://www.syrnia.com/*
// @version     0.7
// @description      Bots the unbottable botcheck
// @grant GM_log
// @grant GM_xmlhttpRequest
// ==/UserScript==
//Configs
//Safetimes
var stopTime = 0; //Stops at midnight
var startTime = 4; //Starts at 4am
var username = "YOURUSERNAME"; //You don't have to fill out these values, but if you get logged out it will not log you back in.
var password = "YOURPASSWORD";

//Global variables
apikey = "YOURAPIKEY";
var startDate = Date.now();
var lastCheckDate = 0;
count = 0;
var _MS_PER_MINUTE = 1000 * 60;
previous = 0;
start = "true";
setInterval(function() {
    location.reload();
}, 3600000); //Reload every hour to fix potential issues


//Basically main
setTimeout(checkBotcheck, 5000);

//Botcheck checker
function checkBotcheck() {
    if (safeTimer()) {
        checkOffline();
        checkLogin();
        doMainAction();
        if (unsafeWindow.$('botImage') != null) {
            //Try converting the picture into base64
            // userLog("We found a botcheck! Let's convert it to Base64 to send it to our captcha service", "notice"); //Broken?
            var base64 = getBase64Image(document.getElementById("botImage"));
            sendToAPI(base64);
        } else if (document.getElementById("LocationContent")) {
            var nowDate = Date.now();
            if (dateDiff(startDate, nowDate) - 1 == previous) {
                previous = dateDiff(startDate, nowDate);
                userLog("Hey!  We've been botting for " + dateDiff(startDate, nowDate) + " minutes and have attempted " + count + " botchecks(Including retries).", "notice");
            } else if (dateDiff(startDate, nowDate) == 0) {
                if (start == "true") {
                    userLog("Hey!  We've done our setting up, please make sure you're ready to skip botchecks! We refresh every hour to fix potential problems(maybe) and we attempt to continue work as long as the work doesn't contain \"attack\"", "notice");
                    start = "false";
                }
            }
            setTimeout(checkBotcheck, 10000);
        } else {
            setTimeout(checkBotcheck, 10000);
        }
    } else {
        setTimeout(checkBotcheck, 10000);
    }
}

//Convert to base64
function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL("image/png");
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

//Post it to the api
function sendToAPI(base64) {
    base64 = encodeURIComponent(base64);
    GM_xmlhttpRequest({
        method: "POST",
        url: "http://2captcha.com/in.php",
        data: "method=base64&key=" + apikey + "&body=" + base64,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        onload: function(response) {
            var responseString = response.responseText;
            GM_log("Debug(Send): " + responseString);
            if (responseString == "ERROR_WRONG_USER_KEY" || responseString == "ERROR_KEY_DOES_NOT_EXIST" || responseString == "ERROR_ZERO_BALANCE" || responseString == "ERROR_ZERO_CAPTCHA_FILESIZE" || responseString == "ERROR_TOO_BIG_CAPTCHA_FILESIZE" || responseString == "ERROR_WRONG_FILE_EXTENSION" || responseString == "ERROR_IMAGE_TYPE_NOT_SUPPORTED") {
                userLog("There has been a pretty severe error:" + responseString + ", you should disable the plugin and report this.", "error");
                throw new Error("Stopping execution");
            } else if (responseString == "ERROR_IP_NOT_ALLOWED" || responseString == "IP_BANNED") {
                userLog("For some reason your IP has been banned from the service. You should disable the plugin and report this.", "error");
                throw new Error("Stopping execution");
            } else if (responseString == "ERROR_NO_SLOT_AVAILABLE") {
                userLog("The server is at maximum capacity, we are resubmitting in 15s.", "warning");
            } else {
                userLog("Captcha sent, awaiting response", "success"); //Should really if this to deal with other responses sooner
                setTimeout(parseResponse, 15000, responseString);
            }
        }
    });
}
//Parse the response from the server
function parseResponse(prevResponse) {
    var captchaID = prevResponse.split("|");
    GM_xmlhttpRequest({
        method: "GET",
        url: "http://2captcha.com/res.php?key=" + apikey + "&action=get&id=" + captchaID[1],
        onload: function(response) {
            var getResponse = response.responseText;
            if (getResponse == "CAPCHA_NOT_READY" || getResponse == "CAPTCHA_NOT_READY") {
                userLog("Captcha is not ready yet. Let's wait 10 seconds", "warning");
                captchaID = null;
                setTimeout(parseResponse, 10000, prevResponse);
                //Deal with errors
            } else if (getResponse == "ERROR_KEY_DOES_NOT_EXIST" || getResponse == "ERROR_WRONG_ID_FORMAT") {
                userLog("Fatal error! We have to quit out of the script. The error was: " + getResponse, "error");
                throw new Error("Stopping execution");
            } else if (getResponse == "ERROR_WRONG_CAPTCHA_ID") {
                userLog("Our ID is wrong, so the server is probably having issues. Wait 15s and attempting resubmit.", "warning");
                setTimeout(checkBotcheck, 15000);
            } else if (getResponse == "ERROR_CAPTCHA_UNSOLVABLE") {
                userLog("Server thought the captcha was unsolvable, so we're going to resend it.", "warning");
                setTimeout(checkBotcheck, 5000);
            } else {
                GM_log("Debug(Response): " + getResponse);
                //Assuming we're all good
                var captchaArray = getResponse.split("|");
                var captchaAnswer = captchaArray[1];
                submitToCaptcha(captchaAnswer);
                count++;
                setTimeout(userLog, 3000, "We think the botcheck is: " + captchaAnswer + ". We are going to wait 15 seconds to see if it was. We have attempted to solve " + count + " botchecks (including retries).", "success");
                setTimeout(checkBotcheck, 15000);
            }
        }
    });

}
//Submit our result into the captcha
function submitToCaptcha(answer) {
    var botInputField = document.getElementById('botInputField');
    botInputField.value = answer;
    var locationContent = document.getElementById('LocationContent'); //get the location content
    var botButton = locationContent.getElementsByClassName('button'); //get the button itself inside location
    lastCheckDate = Date.now();
    botButton[0].click();
}

//On screen user notifications
function userLog(notice, type) {
    GM_log(notice);
    //var locationContent = document.getElementById('LocationContent');
    var locationContent = document.getElementById('centerContent');
    var msgbox = document.getElementById('Msgbox');
    if (msgbox != null) {
        Msgbox.remove();
    }
    if (type == "error") {
        var box = "<div id=\"Msgbox\" style=\"color:#555;border-radius:10px;font-family:Tahoma,Geneva,Arial,sans-serif;font-size:11px;padding:10px 36px;margin:10px;font-weight:bold;text-transform:uppercase;background:#ffecec 10px 50%;border:1px solid #f5aca6;\">Notice: <span>" + notice + "</div>";
    } else if (type == "success") {
        var box = "<div id = \"Msgbox\" style=\"color:#555; border-radius:10px; font-family:Tahoma,Geneva,Arial,sans-serif;font-size:11px;  padding:10px 36px;  margin:10px;background:#e9ffd9 10px 50%;border:1px solid #a6ca8a;\"><span>Success: </span>" + notice + "</div>";
    } else if (type == "warning") {
        var box = "<div id = \"Msgbox\" style=\"color:#555; border-radius:10px; font-family:Tahoma,Geneva,Arial,sans-serif;font-size:11px;padding:10px 36px;margin:10px;background:#fff8c4 10px 50%;border:1px solid #f2c779;\"><span>Warning: </span>" + notice + "</div>";
    } else { //notice and other
        var box = "<div id = \"Msgbox\" style=\"color:#555; border-radius:10px; font-family:Tahoma,Geneva,Arial,sans-serif;font-size:11px;padding:10px 36px;margin:10px;background:#e3f7fc 10px 50%;border:1px solid #8ed9f6;\"><span>Notice: </span>" + notice + "</div>";
    }
    //locationContent.innerHTML = box + locationContent.innerHTML;
    locationContent.innerHTML = locationContent.innerHTML + box;
}


//Time and date
// a and b are javascript Date objects
function dateDiff(a, b) {

    return Math.floor((b - a) / _MS_PER_MINUTE);
}
//Disables execution if we're in our safe times
function safeTimer() {
    var d = new Date();
    if (d.getHours() >= stopTime && d.getHours() <= startTime) {
        console.log("Checking disabled - Within safetimes")
        return false;
    } else {
        return true;
    }
}
//Checks if we're logged in, and logs us in if we're not
function checkLogin() {
    if (document.getElementById("usernameInput")) {
        console.log("We're not logged in. Logging in...");
        document.getElementById("usernameInput").value = username;
        document.getElementsByName("password")[0].value = password;
        $('loginform').submit();
        return false;
    }
}

function checkOffline() {
    if (document.getElementById("cf-error-banner")) {
        setTimeout(location.reload(), 10000);
    }
}
var mainCount = 0;
//Does the main action for the content area, possibly dangerous if the main action is attacking! This does not manage the left hand menu.
function doMainAction() {

    if (!document.getElementById("workCounter")) {
        console.log("Workcounter not found?");
            var locCont = document.getElementById("LocationContent").innerHTML;
            if (locCont.indexOf('locationText') > -1) {
                if (locCont.indexOf('attack') == -1) {
                    console.log("We should be able to go...");
                    locationText('work', 'other');
                    return false;
                } else {
                    userLog("We do not automate attacks due to potential for loss!", "warning");
                }
            } else {
                locationText('work', 'fishing', 'Small fishing boat'); //Change this to what you're doing!
            }
        } else if (document.getElementById("workCounter").value == 0) {
                mainCount++;
                if (mainCount == 3) {
                    mainCount = 0;
                    location.reload();
                }
            }
        }
