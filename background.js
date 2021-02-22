// -----------Temporary Variables------------ //
// PARAMS IN CHROME SYNC STORAGE: userID, validate, attempt, isDeactivated, paused, pausedMins, blacklist, spanish
var resource; //temp
var pause; //temp
var date; //local
var landingPage = "https://csmapnyu.org/2020/08/25/csmap-independent-panel-thank-you/";
var landingPageSpanish = "https://csmapnyu.org/2021/02/12/csmap-independent-panel-thank-you-spanish/";

// MESSAGES 
valid_msg = "Thank you for contributing to our research!\n\nURL Historian is now active on your browser. You can always click \"Help\" for instructions on how to use our extension. \n\nIf you have any further questions: \nFor technical inquiries regarding the extension, please contact nyu-smapp-engineers@nyu.edu \nFor questions about the data we collect and how your data is used in research projects, please contact csmap-surveys@nyu.edu"
msg_retry = "Unfortunately, the User ID you entered cannot be verified.\n\nPlease enter the ID provided in your survey. If you need help to recover your User ID, please contact us at nyu-smapp-engineers@nyu.edu for assistance."
msg_final = "Thank you for your interest in URL Historian.\n\nUnfortunately, multiple attempts to verify the User ID entered have failed.\n\nIf you are a recruited participant, please contact nyu-smapp-engineers@nyu.edu for assistance.\n\nIf you are not a recruited participant and would like to contribute to a CSMaP study, feel free to contact us at the email above. \n\nURL Historian is now disabled. Please uninstall it from your browser."

valid_msg_spanish = "¡Gracias por contribuir a nuestra investigación!\n\nURL Historian ahora está activo en tu navegador web. \n\nSi tienes más pregundas: \nPara dudas técnicas respecto a la extensión, por favor contactar a nyu-smapp-engineers@nyu.edu \nPara preguntas respecto a la información que recolectamos y cómo usamos tu información en los proyectos de investigación, por favor contacta a csmap-surveys@nyu.edu"
msg_retry_spanish = "Desafortunadamente, el ID de Usuario que introdujiste no pudo ser verificado.\n\nPor favor introduce el ID que se te suministró en tu encuesta. Si necesitas ayuda para recuperar tu ID de Usuario, por favor contáctanos en nyu-smapp-engineers@nyu.edu para recibir asistencia."
msg_final_spanish = "Gracias por tu interés en URL Historian.\n\nDesafortunadamente, múltiples intentos para verificar el ID de Usuario que introdujiste han fallado.\n\nSi eres un participante reclutado, por favor contacta a nyu-smapp-engineers@nyu.edu para asistencia.\n\nSi no eres un participante reclutado y te gustaría contribuir a este estudio de CSMaP, siéntete libre de contactarnos en el anterior correo electrónico. \n\nURL Historian está ahora desactivado. Por favor desinstálalo de tu navegador web."

// -----------Functions------------ //
// CONFIGURE ALERT FOR PAUSING TOO LONG
function setMsgAlert(pausedMins){
  chrome.storage.sync.get("spanish", function(temp){
    msg_alert = `URL Historian has been paused for ${pausedMins} minutes.\nPlease re-activate at your convenience. \n\n(To re-activate: click on the icon to open URL Historian, and slide the button to the right.)\n\nThank you for contributing to our research!`
    msg_alert_spanish = `URL Historian ha sido pausado por ${pausedMins} minutos.\nPor favor reactívalo a tu conveniencia. \n\n(Para reactivar: haz clic en el ícono para abrir URL Historian y desliza el botón a la derecha.)\n\n¡Gracias por contribuir a nuestra investigación!`
    if (temp.spanish) alert(msg_alert_spanish);
    else alert(msg_alert);
  });
}

// VALIDATE USER ID
function containsObjectNew(obj, list) {
  return new Promise(function(resolve) {
    // var i;
    // for (i = 0; i < list.length; i++) {
    //     if (list[i] === obj) {
    //         chrome.storage.sync.set({userID: obj,isPaused:false});
    //         chrome.browserAction.setIcon({path: "icon128.png"});
    //         alert(valid_msg);
    //         resolve(true);
    //     } 
    // }
    // chrome.storage.sync.set({userID: undefined});
    // resolve(false);
    if (***REMOVED***) {
      // console.log("Verified User ID:", obj);
      chrome.storage.sync.set({userID: obj, isPaused: false});
      chrome.browserAction.setIcon({path: "images/icon128.png"});
      chrome.storage.sync.get('spanish',function(temp){
        spanish = temp.spanish;
        if (spanish) alert(valid_msg_spanish);
        else alert(valid_msg);
      })
      
      resolve(true);
    }
    resolve(false);
  });
}
// 
// SET CONFIGURATION PARAMETERS XML ver
// function loadConfig(xhr) {
//   // grab object
//   function getObject(data) {
//     validate = data.Body.toString().split('\n');
//   };
// // console.log(xhr.response)
//   config = JSON.parse(xhr.response);
//   AWS.config.region = config.bucketRegion; 
//   AWS.config.credentials = new AWS.CognitoIdentityCredentials({
//           IdentityPoolId: config.poolId });
//   resource = new AWS.DynamoDB({
//     apiVersion: '2012-08-10'
//   });

//   s3 = new AWS.S3({
//         apiVersion: "2006-03-01",
//         params: {Bucket: config.bucketName,}
//       });
//   s3.getObject({ Key: config.idPath}, function(err, data) {
//         if(err) return err;
//         getObject(data);
//   });
// }

// // LOAD CONFIG FILE 
// var xhr = new XMLHttpRequest();
// xhr.open("GET", chrome.extension.getURL("/config.json"), true);
// xhr.onreadystatechange = function() {
//   if(xhr.readyState ===4 ){
//     if(xhr.status === 200) {
//     return xhr;
//     }
//     else {
//       console.log('Cannot read config file')
//     }
//   }
// };
// xhr.send();

// SET CONFIGURATION PARAMETERS fetch ver
// function loadConfigFIRST() {
//   fetch(chrome.runtime.getURL("/config.json"))
//   .then((response) => {
//     return response.json();
//   })
//   .then((config) => {
//     AWS.config.region = config.bucketRegion; 
//     AWS.config.credentials = new AWS.CognitoIdentityCredentials({
//             IdentityPoolId: config.poolId });
//     s3 = new AWS.S3({
//           apiVersion: "2006-03-01",
//           params: {Bucket: config.bucketName}
//         });
//     s3.getObject({ Key: config.idPath }, function(err, data) {
//           if(err) return err;
//           else chrome.storage.sync.set({validate: data.Body.toString().split('\n')});
//     });
//   })
// }

// LOAD AWS CONFIGURATION AND FETCH API
async function loadConfig() {
  let response = await fetch(chrome.runtime.getURL("/config.json"))
  let config = await response.json();
  AWS.config.region = config.bucketRegion; 
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId: config.poolId });
  return new AWS.DynamoDB({
    apiVersion: '2012-08-10'
  });
}

// UPLOAD TO DynamoDB
async function upload(url,userID) {
  resource = await loadConfig();
  date = new Date();
  var params = {
    TableName: 'web_browsing', 
    Item: {
      "user_id": {'S': userID},
      "visited_url": {'S': url},
      "visit_timestamp": {'N': date.getTime().toString()}
    }
  }
  // console.log(params);  
  resource.putItem(params, function(err, data) {
    // if(err) {console.log( err);}
    // else console.log("Successfully created item ", params); // for debug
    if (err) console.log(err);
    else return 'Successfully created item'; // for release
  })
}

// DynamoDB DELETE BY DATE OR BY TIME
async function deleteObjects(prefix) {
  resource = await loadConfig();
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
  // QUERY ALL MATCHING RECORDS
  var paramList = [];
  resource.query(qparam, function(err,data) {
    // if (err) {console.log(err);} // for debug
    if (err) return err; // for release
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
              "visit_timestamp" : {'N' : item.visit_timestamp.N}
            }
          }
        }
        paramList.push(param);
      }

      // SLICE RECORDS INTO BATCHES OF 25 
      var batchParams = chunkArray(paramList, 25);

      // DELETE RECORD IF RECORD EXISTS
      if (batchParams.length !== 0) {
        for (var i = 0; i < batchParams.length; i++) {
          var dparam = {
            RequestItems: {
              "web_browsing" : batchParams[i]
            }
            // ReturnConsumedCapacity: "INDEXES" // for demo

          }
          resource.batchWriteItem(dparam, function(err,data) {
            // if(err) console.log(err);
            // else console.log(dparam); // for demo and debug
            if (err) console.log(err);
            else return 'Records deleted'; // for release
          });
        } 
      } 
    }
  });
}

// -----------Chrome Listeners------------ //
chrome.runtime.onStartup.addListener(function () {    
  // loadConfigFIRST();
  chrome.storage.sync.get(['isPaused'], function(temp) {
    if(temp.isPaused) {
      chrome.browserAction.setIcon({path: "images/icon_disabled.png"});
      chrome.storage.sync.set({pausedMins:60, attempt:10});
    } 
  });
});

chrome.runtime.onInstalled.addListener(function(details) {
  // loadConfigFIRST();
  var reason = details.reason;
  if (reason === "install") {
    chrome.storage.sync.set({isPaused: true, pausedMins: 60, attempt: 10, spanish:false, isDeactivated:false});
    chrome.browserAction.setIcon({path: "images/icon_disabled.png"}); 
  } 
  else if (reason === 'update') {
    // alert('updated')
    chrome.storage.sync.get(['isPaused','spanish'], function(temp) {
      if(temp.spanish) chrome.browserAction.setPopup({popup:"popup_spanish.html"});
      else chrome.browserAction.setPopup({popup:"popup.html"});
      if(temp.isPaused) {
        chrome.browserAction.setIcon({path: "images/icon_disabled.png"});
        chrome.storage.sync.set({pausedMins:60, attempt:10});
      } 
    });
  }
});

// RECEIVE MESSAGE FROM POPUP ON USER INPUT
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.message == "setUserId") { 
    //VERIFY USER CREDENTIALS    
    chrome.storage.sync.get(['validate','attempt','spanish'], function(temp){
      var validate = temp.validate;
      var attempt = temp.attempt;
      var spanish = temp.spanish;
      containsObjectNew(request.userID, validate).then(function(value) {
        if (value === true) {
          if (spanish) chrome.tabs.create({url: landingPageSpanish});
          else chrome.tabs.create({url: landingPage});
          chrome.storage.sync.set({isDeactivated:false});
        } 
        else {
          attempt --;
          if(attempt > 0) {
            if (spanish) alert(msg_retry_spanish + '\n\nTienes ' + attempt + " intentos restantes.");
            else alert(msg_retry + '\n\nYou have ' + attempt + " attempts left.");
            chrome.storage.sync.set({'attempt': attempt});
          } else { 
            if (spanish) alert(msg_final_spanish);
            else alert(msg_final);
            chrome.storage.sync.set({isDeactivated:true});
          }  
        }
      });
    });
  } else if (request.message == "resetPausedTime"){
      chrome.storage.sync.set({pausedMins: 60});
  } else if (request.message = 'delete') {
      deleteObjects(request.prefix);
  }
});

// LISTEN TO TAB CHANGES 
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  // Do nothing if URL hasn't changed
  if (!changeInfo.url) return;
  // ENSURE USER HAS USED A VALID ID   
  chrome.storage.sync.get(['userID', 'isPaused','blacklist'], function(temp) {
    userID = temp.userID;
    pause = temp.isPaused;
    var bl = temp.blacklist === undefined ? [] : temp.blacklist;
    if (userID === undefined || userID === 'undefined') return;
    var myURL = "" + tab.url;
    if (!pause) {
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
        // var m = 0;
        for (var i = 0; i < bl.length; i++){
          var t = "" + bl[i];
          if (myURL.includes(t)){
            upload("__BLACKLIST__", userID);
            return;
          }
        }
        upload(myURL, userID);

    } else if (pause) {
      if (!tab.url || tab.url.includes("chrome://") || tab.url.includes("csmapnyu.org")) return;
      // upload("__PAUSED__", "pause")
      upload("__PAUSED__", userID);
    }
  });
});

chrome.alarms.onAlarm.addListener(function(alarm) {
  chrome.storage.sync.get("pausedMins",function(temp){
    pausedMins = temp.pausedMins;
    setMsgAlert(pausedMins);
    pausedMins += 360;
    chrome.storage.sync.set({"pausedMins": pausedMins});
  });
});