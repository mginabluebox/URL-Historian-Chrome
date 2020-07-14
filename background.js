/* globals chrome, document */
console.log('Welcome to Url historian');

//MESSAGES 

valid_msg = "Welcome and thank you for your participation!!\nURL historian is now active on your browser\n\nTo pause activity\n\t 1. Click the URL Historian icon\n\t 2. Slide the option button to the left.\nTo delete browse history\n\tby Date\n\t\t1. Click by Date button\n\t\t2. Select a date within the past seven days \n\t\t3. Click delete button\n\t\t4. Confirm deletion date\n\tby Time\n\t\t1. Click by Time button\n\t\t2. Select a date within the past seven days\n\t\t3. Click delete button\n\t\t4. Confirm deletion date and time\nFor websites you wish to exclude\n\t1. Enter the website domain in Blacklist a website\n\t2. Press add button\nTo remove a website from current Blacklist\n\tClick X next to the website\nFor more information about research at CSMaP please read the redirected page"

msg_retry = "Welcome and thank your for installing URL historian!!\n\nUnfortunately the user ID you entered cannot be verified\n\nPlease check and try again"

msg_final = "Thank you for your interest in URL Historian\n Unfortunately, multiple attempts to verify the user ID provided have failed\n\nIf you have been recruited to participate in research by CSMaP or our affiliated institution\nPlease contact personell at csmap.org for assistance.\n\nOtherwise only recruited research participants are authorized to use this application\nIf you would like to participate in a study, Please contact personell above.\n\nThis application will now be disabled\nPlease remove the extension from your browser\n\n"

var userID ;
var resource;
var pause;
var config;
var date;
var validate;

function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            console.log[i]
            chrome.storage.sync.set({userID: obj}, function(){});
            chrome.storage.sync.set({isPaused: false}, function(){});
            chrome.browserAction.setIcon({path: "icon128.png"});
            alert(valid_msg);
            return true;
        }
    }
    return false;
};

// SET CONFIGURATION PARAMETERS
function loadConfig(xhr) {
  // grab object
  function getObject(data) {
    validate = data.Body.toString().split('\n');
  };

  config = JSON.parse(xhr.response);
  AWS.config.region = config.bucketRegion; 
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId: config.poolId });
  resource = new AWS.S3({
        apiVersion: "2006-03-01",
        params: {Bucket: config.bucketName,}
      });
  resource.getObject({ Key: config.idPath}, function(err, data) {
        if(err) return err;
        getObject(data);
  });
}
// LOAD FILE 
var xhr = new XMLHttpRequest();
xhr.open("GET", chrome.extension.getURL("/.config.json"), true);
xhr.onreadystatechange = function() {
  if(xhr.readyState ===4 ){
    if(xhr.status === 200) {
    return xhr;
    }
    else {
      console.log('Cannot read config file')
    }
  }
};
xhr.send();

// CREATE OUTPUT PATH
function createPath(msg) {

  function pad(val) {
    return (val<10) ? '0' + val : val;
  }

  // SET LOCAL ACCESS TIME 
  var year = date.getFullYear();
  var month = pad(date.getMonth() + 1);
  var day = date.getDate();
  var hour = pad(date.getHours());
  var minute = pad(date.getMinutes());
  var seconds = pad(date.getSeconds());
  // // create object key
  filepath = [userID, year, month, day, hour, ''].join('/') + [userID, year, month, day, hour, minute, seconds].join('_')

  if (msg ==='pause') {
    return  filepath + '_paused.json';
  } else if(msg === 'new') {
      return filepath + '.json' 
  } else if (msg === 'blacklisted') {
     return  filepath + '_' + msg + '.json'
  }
};

// UPLOAD TO S3
function upload(url, msg) {
  date = new Date()
  var outpath = createPath(msg);
  var params= JSON.stringify({
  ID: userID,
  visited_url: url,
  timestamp: date.getTime()
  });
  console.log(outpath, params)
  resource.upload({
     Key: outpath,
     Body: params
     }, function(err, data) {
      if (err) return err;
      return 'uploaded successful'
     });
};

// DELETE BY DATE OR TIME 
async function deleteObjects(prefix) {
  var params = {
    Prefix: prefix
    }
  await resource.listObjects(params, function(err, data) {
    if (err) return err;
    if (data.Contents.length ==0) return;
    var deleteParams = {
      Delete: {Objects: []}
      };

    data.Contents.forEach(({Key}) => {
      deleteParams.Delete.Objects.push({ Key });
    });
    console.log(deleteParams.Delete.Objects)
    resource.deleteObjects(deleteParams, function(err, data) {
      if (err) return err;
      if(data.IsTruncated) deleteObjects(path);
      else return;
    });
  });
};

var attempt = 3; 
// RECEIVE MESSAGE FROM POPUP ON USER INPUT
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.message == "setUserId") { 
    // SET USER ID
    userID = request.userID;  

    //VERIFY USER CREDENTIALS         
    if (containsObject(userID, validate)) {
        chrome.tabs.create({url: "https://csmapnyu.org"});
      } else {
        attempt --
        chrome.browserAction.setIcon({path: "icon_disabled.png"});
        chrome.storage.sync.set({userID: 'Enter User ID'}, function(){});
        if(attempt > 0) {
          alert(msg_retry + '\nYou have ' + attempt + " attempt left");
          chrome.storage.sync.set({isPaused: true}, function(){});
        } else { 
          alert(msg_final);
          // chrome.runtime.sendMessage({message: "validationFailure"});
          chrome.browserAction.setPopup({popup: ""});
        }     
      }
  } else {
    var prefix;
    if(request.message == "delbyTime" ) {
      prefix = request.delbyTime
    } else if (request.message == "delbyDate" ) {
      prefix = request.delbyDate
    }
    // console.log(prefix.length);
    if (prefix.length ==1) {
        deleteObjects(prefix[0]);
    } else if(prefix.length > 1) {
      for (i=0; i < prefix.length; i++) {
        deleteObjects(prefix[i])
      }
    }
  }  
});

chrome.runtime.onStartup.addListener(function () {
  // START UP EVENT
  loadConfig(xhr);
    
  chrome.storage.sync.get('userID', function(temp) {
        userID = "" + temp.userID });
  // check  status
  chrome.storage.sync.get(['isPaused'], function(temp) {
    pause = temp.isPaused;
    if(pause) {
      chrome.browserAction.setIcon({path: "icon_disabled.png"});
    } 
  });
});


chrome.runtime.onInstalled.addListener(function(details) {

  // chrome.storage.sync.set({userID: 'Enter User ID'}, function(){})

  var reason = details.reason

  console.log(details.reason)

  if (details.reason == "install") {

  //chrome.storage.sync.set({userID: 'Enter User ID'}, function(){});

  // first installation 
    chrome.browserAction.setIcon({path: "icon_disabled.png"});
  
  // load configuration file
    loadConfig(xhr)

    // set plugin to pause
    chrome.storage.sync.set({isPaused: true}, function(){});

    } else if (details.reason == 'update') {

      loadConfig(xhr)
    
      chrome.storage.sync.get('userID', function(temp) {
       userID = "" + temp.userID });

      // check  status
      chrome.storage.sync.get(['isPaused'], function(temp) {
        pause = temp.isPaused;
        if(pause) {
          chrome.browserAction.setIcon({path: "icon_disabled.png"});
        } 
      });
    };
  });

  // LISTEN TO TAB CHANGES 
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // don't do anything if url hasn't changed    
    var myURL = "" + tab.url;
    if (!changeInfo.url) return;
    chrome.storage.sync.get(['isPaused'], function(temp){
      pause = temp.isPaused;
      if (!pause) {
        chrome.storage.sync.get({blacklist: []}, function(temp2) {
          var bl = temp2.blacklist;
          //console.log(bl)
          var m = 0;
          for (var i = 0; i < bl.length; i++){
            var t = "" + bl[i];
            if (myURL.includes(t)){
              m++;
            }
          }
          // BLACKLIST HEALTH, FINANCIAL, EMPLOYEE,TAX  
          if (!tab.url || tab.url.includes("chrome://") || tab.url.includes("csmapnyu.org") 
            || tab.url.toLowerCase().includes("login") || tab.url.toLowerCase().includes( "signin") 
            || tab.url.toLowerCase().includes("logout")  || tab.url.toLowerCase().includes("log-in") 
            || tab.url.toLowerCase().includes("signout") || tab.url.toLowerCase().includes("auth")  
            || tab.url.toLowerCase().includes("account") || tab.url.toLowerCase().includes("mail")
            || tab.url.toLowerCase().includes("loan") || tab.url.toLowerCase().includes("health") 
            || tab.url.toLowerCase().includes("beneficiary") || tab.url.toLowerCase().includes("investment") 
            || tab.url.toLowerCase().includes("instanceid") || tab.url.toLowerCase().includes("token") 
            || tab.url.toLowerCase().includes("payments") || tab.url.toLowerCase().includes("statements") 
            || tab.url.toLowerCase().includes("income") || tab.url.toLowerCase().includes("balance") 
            || tab.url.toLowerCase().includes("ira") || tab.url.toLowerCase().includes("retire") 
            || tab.url.toLowerCase().includes("tax")) return;
          if (m === 0 ){
           upload(changeInfo.url,'new');
          } else {
            upload("blacklist", "blacklisted")
            return;
          }
        });
      } else if(pause) {
        upload("paused", "pause")
      }
    });
  });

  // LISTEN TO ACTIVATION 
  chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
      var myURL = "" + tab.url;
       if (!tab.url || !tab.url.includes("chrome://")) return;
      chrome.storage.sync.get(['isPaused'], function(temp){
        pause = temp.isPaused;
        if (!pause) {
          chrome.storage.sync.get({blacklist: []}, function(temp2) {
            var bl = temp2.blacklist;
            var m = 0;
            for (var i = 0; i < bl.length; i++){
              var t = "" + bl[i];
              if (myURL.includes(t)){
                m++;
              }
            }
            if (!tab.url || tab.url.includes("chrome://") || tab.url.includes("csmapnyu.org")) return;
            if (m === 0 ) {
              upload(tab.url, "new");
            } else {
              console.log("Blacklisted");
              upload("blacklist","blacklisted")
              return;
            }
          });
        };
      });
    });
  });
//});
