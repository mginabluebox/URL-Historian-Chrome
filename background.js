/* globals chrome, document */
console.log('Welcome to Url historian');

//MESSAGES 
valid_msg = "Welcome and thank you for your participation!!\n\nUrl historian is now active on your browser\n\nTo pause activity\n\t 1. Click the Url Historian icon\n\t 2. Slide the option button to the left.\nFor websites you wish to exclude\n\t1. Enter the website domain in Blacklist a website\n\t2. Press add button\nTo remove a website from current Blacklist\n\tClick X next to the website\nFor more information about research at CSMaP please read the redirected page"

msg_retry = "Welcome and thank your for installing Url historian!!\n\nUnfortunately the user ID you entered cannot be verified\n\nPlease check and try again"

msg_final = "Thank you for your interest in Url Historian\n Unfortunately, multiple attempts to verify the user ID provided have failed\n\nIf you have been recruited to participate in research by CSMaP or our affiliated institution\nPlease contact personell at csmap.org for assistance.\n\nOtherwise only recruited research participants are authorized to use this application\nIf you would like to participate in a study, Please contact personell above.\n\nThis application will now be disabled\nPlease remove the extension from your browser\n\n"


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

  // SET ACCESS TIME 
  
  var day = date.toISOString().split('T')[0].replace(/-/g, '/')
  var file = date.toISOString().split('T')[0].replace(/-/g, '_')
  var hour = pad(date.getHours());
  var minute = pad(date.getMinutes());
  var seconds = date.getSeconds()

  // // create filenam
  filepath = [userID, day, hour, ''].join('/') + [userID, file, hour, minute, seconds].join('_')

  if (!pause){
    if (msg === 'new') {
      return filepath + '.json' 

    } else if (msg === 'blacklisted') {
     return  filepath + '_' + msg + '.json'

    }
  } else {
    return  filepath + '_paused.json';
  }
};


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

async function listObjects(prefix) {

  var params = {
    Prefix: prefix
    }
  var keys = [];
  for (;;) {
    var data = await resource.listObjects(params).promise();

    data.Contents.forEach((elem) => {
      keys = keys.concat(elem.Key);
    });

    if (!data.IsTruncated) {
      break;
    }
    //console.log(data.NextMarker);
  }

  console.log(keys);
}

// function listObjects(path) {

//   var keys = []
//   var params = {
//     Prefix: path
// //     }
// //   resource.listObjects(params, function(err, data){
//       if (err) return callback(err);
//       if (data.Contents.length ==0) callback();
// //     console.log(data);
// //   });
// // };

function deleteObject(key) {

  console.log(key)
  resource.deleteObject({
     Key: key +'/*'
     }, function(err, data) {
      if (err) return err;
      return 'uploaded successful'
     });
};


var attempt = 3; 
// receive message from popup on user input
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.message == "setUserId") { 
    // set user id
    userID = request.userID;
    // get user id and  configuration  
  
    //VERIFY USER  CREDENTIALS         
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
          chrome.runtime.sendMessage({msg: "validation_failure"});
        }     
      }
  } else if(request.message == "delbyDate") { 
      // set user id
      var prefix = request.delbyDate;
      console.log(prefix.length);
      if (prefix.length ===1){
          listObjects(prefix[0]);
      }
      //listObjects(prefix)
      //console.log(keys)
      // get user id and  configuration  
  }
});


chrome.runtime.onStartup.addListener(function () {
  // START UP EVENT
  loadConfig(xhr)
    
  chrome.storage.sync.get('userID', function(temp) {
        userID = "" + temp.userID });
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

      //console.log(validate)

      // chrome.storage.sync.get(['isPaused'], function(temp) {
      //   pause = "" + temp.isPaused });
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
          if (!tab.url || tab.url.includes("chrome://") || tab.url.includes("csmapnyu.org")) return;
          if (m === 0 ){
           upload(changeInfo.url,'new');
            //console.log("Uploaded");
          } else {
            console.log("Blacklisted");
            upload("blacklist", "blacklisted")
            return;
          }
        });
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
