/* globals chrome, document */
console.log('Welcome to Url historian');

var myID = "User ID";
var p = false;

// chrome.runtime.onStartup.addListener(function() {

//   var myID = localStorage.getItem("userID");
   chrome.storage.sync.set({isPaused: p}, function(){});
//   chrome.storage.sync.set({userID: myID}, function(){
//   });
//   var bl = localStorage.getItem('blacklist');
//   chrome.storage.sync.set({blacklist: bl}, function(){
//   });
  
// });
chrome.runtime.onInstalled.addListener(function() {
  var bucketRegion = "us-east-1";
  var bucketName = "plugin-browsing-data";
  AWS.config.region = 'us-east-1'; // Region
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:0a3c0c55-0f25-4158-b7b5-57db8e393ac4',
  });
  
  var s3 = new AWS.S3({
    apiVersion: "2006-03-01",
    params: {
      Bucket: bucketName
    }
  });

  var message = "Welcome to Url Historian. Please enter your user ID"
  var uploadToS3 = function(url) {
      chrome.storage.sync.get('userID', function(temp) {
      var currID = "" + temp.userID;
      if (currID === "undefined") {
        var currID = window.prompt(message);
        chrome.storage.sync.set({userID: currID}, function() {
          alert(currID + " successfully saved as your user ID " )
        });
        chrome.storage.local.set({UserID: currID}, function(){
        });
      } 
      var f = JSON.stringify({
      name: currID,
      visited_url: url,
      timestamp: new Date().getTime()
      });
      // s3.upload({
      //    Bucket: bucketName,
      //    Key: (currID + " " + Date()),
      //    Body: f
      //    });
      console.log("Uploaded to s3", f)
      
    });
  };

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // don't do anything if url hasn't changed
    var myURL = "" + tab.url;
    if (!changeInfo.url) return;
    chrome.storage.sync.get(['isPaused'], function(temp){
      var pause = temp.isPaused;
      if (!pause){
        chrome.storage.sync.get({blacklist: []}, function(temp2) {
          var bl = temp2.blacklist;
          console.log(bl)
          var m = 0;
          for (var i = 0; i < bl.length; i++){
            var t = "" + bl[i];
            if (myURL.includes(t)){
              m++;
            }
          }
          if (!tab.url || tab.url.includes("chrome://")) return;
          if (m === 0 ){
            uploadToS3(changeInfo.url);
            //console.log("Uploaded");
          } else {
            console.log("Blacklisted");
            return;
          }
        });
      }
    });
  })

  chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
      var myURL = "" + tab.url;
       if (!tab.url || !tab.url.includes("chrome://")) return;
      chrome.storage.sync.get(['isPaused'], function(temp){
        var pause = temp.isPaused;
        if (!pause){
          chrome.storage.sync.get({blacklist: []}, function(temp2) {
            var bl = temp2.blacklist;
            var m = 0;
            for (var i = 0; i < bl.length; i++){
              var t = "" + bl[i];
              if (myURL.includes(t)){
                m++;
              }
            }
            if (!tab.url || tab.url.includes("chrome://")) return;
            if (m === 0 ) {
              uploadToS3(tab.url);
            } else {
              console.log("Blacklisted");
              return;
            }
          });
        };
      });
  });
 });
});
