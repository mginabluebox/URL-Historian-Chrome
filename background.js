/* globals chrome, document */
console.log('Welcome to URL Historian');

//MESSAGES 
valid_msg = "Welcome and thank you for your participation!!\nURL historian is now active on your browser\n\nTo pause activity\n\tSlide the option button to the left\nTo delete browse history\n\tby Date\n\t\t1. Click \"by Date\" button\n\t\t2. Select the time zone you were in\n\t\t3. Select a date to delete\n\t\t4. Click \"Delete\" button\n\t\t5. Confirm deletion date\n\tby Time\n\t\t1. Click \"by Time\" button\n\t\t2. Select the time zone you were in \n\t\t3. Select date and time frame to delete\n\t\t4. Click \"Delete\" button\n\t\t5. Confirm deletion date and time\nFor websites you wish to exclude\n\t1. Enter the domain in \"Blacklist a website\"\n\t2. Click \"Add\" button\nTo remove a website from current blacklist\n\tClick X next to the website\n\nFor more information about research at CSMaP, please refer to the redirected page"

msg_retry = "Welcome and thank your for installing URL historian!!\n\nUnfortunately the user ID you entered cannot be verified\n\nPlease check and try again."

msg_final = "Thank you for your interest in URL Historian\n Unfortunately, multiple attempts to verify the user ID provided have failed\n\nIf you have been recruited to participate in research by CSMaP or our affiliated institution\nPlease contact personell at csmap.org for assistance.\n\nOtherwise only recruited research participants are authorized to use this application\nIf you would like to participate in a study, Please contact personell above.\n\nThis application will now be disabled\nPlease remove the extension from your browser\n\n"

var userID ;
var resource;
var pause;
var config;
var date;
var validate;
var pausedMins = 60;

function containsObjectNew(obj, list) {
  return new Promise(function(resolve) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            console.log[i]
            chrome.storage.sync.set({userID: obj}, function(){});
            chrome.storage.sync.set({isPaused: false}, function(){});
            chrome.browserAction.setIcon({path: "icon128.png"});
            alert(valid_msg);
            resolve(true);
        } 
    }
    resolve(false);
  });
}

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
  resource = new AWS.DynamoDB({
    apiVersion: '2012-08-10'
  });

  s3 = new AWS.S3({
        apiVersion: "2006-03-01",
        params: {Bucket: config.bucketName,}
      });
  s3.getObject({ Key: config.idPath}, function(err, data) {
        if(err) return err;
        getObject(data);
  });
}

// LOAD CONFIG FILE 
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

// UPLOAD TO DynamoDB
function upload(url) {
  date = new Date();
  var params = {
    TableName: 'web_browsing', 
    Item: {
      "user_id": {'S': userID},
      "visited_url": {'S': url},
      "visit_timestamp": {'N': date.getTime().toString()}
    }
  };
  console.log(params); // for demo
  resource.putItem(params, function(err, data) {
    if(err) {console.log("Error: ", err);}
    else console.log("Successfully created item: ", data); // for debug
    // if (err) console.log(err);
    // else return 'Successfully created item'; // for release
  })
}

// DynamoDB DELETE BY DATE OR BY TIME
function deleteObjects(prefix) {

  prefix[1] = prefix[1].toString();
  prefix[2] = prefix[2].toString();
  // console.log("starttime is ", prefix[1], 'endtime is ', prefix[2]);

  // SLICE ARRAY INTO BATCHES
  function chunkArray(myArray, chunk_size){
    var index = 0;
    var arrayLength = myArray.length;
    var tempArray = [];
    
    for (index = 0; index < arrayLength; index += chunk_size) {
        myChunk = myArray.slice(index, index+chunk_size);
        tempArray.push(myChunk);
    }

    return tempArray;
  }

  // QUERY PARAMETERS
  var qparam = {
    TableName: "web_browsing",
    KeyConditionExpression: "#ui = :ui AND (#vt BETWEEN :st AND :et)",
    ExpressionAttributeNames: {
      '#vt' : 'visit_timestamp',
      '#ui' : 'user_id'
    },
    ExpressionAttributeValues: {
      ':st' : {'N': prefix[1]},
      ':et' : {'N': prefix[2]},
      ':ui' : {'S': prefix[0]}
    }
  }

  var paramList = [];
  resource.query(qparam, function(err,data) {
    if (err) {console.log(err);}
    else {
      var items = data.Items;
      // QUERY RECORDS
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        // console.log('user_id: ', item.user_id.S, 'timestamp: ', item.visit_timestamp.N, 'url: ',item.visited_url.S);
        var param = {
          DeleteRequest: {
            Key: {
              "user_id": {'S' : item.user_id.S},
              'visit_timestamp' : {'N' : item.visit_timestamp.N}
            }
          }
        }
        paramList.push(param);
      }

      // SLICE RECORDS INTO BATCHES OF 25 
      var batchParams = chunkArray(paramList, 25);

      // DELETE RECORDS IF RECORD EXISTS
      if (batchParams.length !== 0) {
        for (var i = 0; i < batchParams.length; i++) {
          var dparam = {
            RequestItems: {
              "web_browsing" : batchParams[i]
            },
            ReturnConsumedCapacity: "INDEXES" // for demo

          }
          // console.log(dparam);
          resource.batchWriteItem(dparam, function(err,data) {
            if(err) console.log(err);
            else console.log(data); // for demo and debug
            // if (err) console.log(err);
            // else return 'Records deleted'; // for release
          });
        } 
      } 
    }
  });
}

var attempt = 3; 
// RECEIVE MESSAGE FROM POPUP ON USER INPUT
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.message == "setUserId") { 
    // SET USER ID
    // userID = request.userID;  
    //VERIFY USER CREDENTIALS    
    containsObjectNew(request.userID, validate).then(function(value) {
      if (value === true) {
        userID = request.userID
        chrome.tabs.create({url: "https://csmapnyu.org"});
        chrome.storage.sync.set({isDeactivated:false});
      } else {
        userID = 'undefined';
        attempt --;
        if(attempt > 0) {
          // chrome.browserAction.setIcon({path: "icon_disabled.png"});
          // chrome.storage.sync.set({userID: 'undefined'}, function(){});
          alert(msg_retry + '\nYou have ' + attempt + " attempt left.");
          // chrome.storage.sync.set({isPaused: true}, function(){});
        } else { 
          alert(msg_final);
          chrome.storage.sync.set({isDeactivated:true});
          // chrome.runtime.sendMessage({message: "validationFailure"});
          
          // chrome.browserAction.setPopup({popup: ""});
        }     
      }
    });
  } else if (request.message == "resetPausedTime"){
      pausedMins = 60;
  // } else {
  } else if (request.message = 'delete') {
      deleteObjects(request.prefix);
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
       userID = "" + temp.userID 
       console.log(userID)});
       

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
    // ENSURE USER HAS USED A VALID ID   
    if (userID !== undefined && userID !== 'undefined') { 
      var myURL = "" + tab.url;
      // DO NOTHING IF URL HASNT CHANGED
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
            if (!tab.url || tab.url.includes("chrome://") || tab.url.includes("csmapnyu.org")) return;
            // UNCOMMENT BELOW TO BLACKLIST SITES THAT WILL HAVE THE TERMS IN THE URL
              // || tab.url.toLowerCase().includes("login") || tab.url.toLowerCase().includes( "signin") 
              // || tab.url.toLowerCase().includes("logout")  || tab.url.toLowerCase().includes("log-in") 
              // || tab.url.toLowerCase().includes("signout") || tab.url.toLowerCase().includes("auth")  
              // || tab.url.toLowerCase().includes("account") || tab.url.toLowerCase().includes("mail")
              // || tab.url.toLowerCase().includes("loan") || tab.url.toLowerCase().includes("health") 
              // || tab.url.toLowerCase().includes("beneficiary") || tab.url.toLowerCase().includes("investment") 
              // || tab.url.toLowerCase().includes("instanceid") || tab.url.toLowerCase().includes("token") 
              // || tab.url.toLowerCase().includes("payments") || tab.url.toLowerCase().includes("statements") 
              // || tab.url.toLowerCase().includes("income") || tab.url.toLowerCase().includes("balance") 
              // || tab.url.toLowerCase().includes("ira") || tab.url.toLowerCase().includes("retire") 
              // || tab.url.toLowerCase().includes("tax")) return;
            if (m === 0 ){
             // upload(changeInfo.url,"new");
             upload(changeInfo.url);
            } else {
              // upload("__BLACKLIST__", "blacklisted")
              upload("__BLACKLIST__");
              return;
            }
          });
        } else if(pause) {
          if (!tab.url || tab.url.includes("chrome://") || tab.url.includes("csmapnyu.org")) return;
          // upload("__PAUSED__", "pause")
          upload("__PAUSED__");
        }
      });
    }
  });

chrome.alarms.onAlarm.addListener(function(alarm) {
  alert("URL Historian has been paused for " + pausedMins + " minutes.\nPlease re-activate at your convenience. \n\n(To re-activate: click on the icon to open URL Historian, and slide the button to the right.)\n\nThank you for contributing to our research!");
  pausedMins += 30;
});

//});