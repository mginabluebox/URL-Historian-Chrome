/* globals chrome, document */

var background = {

  userID: "",
  config: {},
  creds: {},
  init: function() {

    this.loadConfig();
    // s3.getObject({
    //   Bucket: this.config.bucketName, 
    //   Key: this.config.idPath
    //   }, 
    //   function(err, data) {
    //     var ids = data.Body.toString();
    //     id_list = ids.split('\n');
    //     console.log(id_list);
    //   });

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if(request.fn in background) {
        background[request.fn](request, sender, sendResponse);
      }

    });
  },

  setID: function(request, sender, sendResponse) {
    this.userID = request.userID;
    if(this.userID === ""){
      alert("Please enter your user ID to continue!");
    } 
    else {
      //var id_list = this.readObject(this.creds, this.config)
      console.log(this.userID)
      this.creds.getObject({
        Bucket: this.config.bucketName, 
        Key: this.config.idPath
        }, 
        function(err, data) {
          if(err){  
            console.log(err, err.stack);
          } else 
            { var ids = data.Body.toString();
              list = ids.split('\n');
              console.log(list)
              var i;
              for (i = 0; i < list.length; i++) {
                
                if (list[i] === this.userID) {
                  console.log(list[i]);
                  //chrome.storage.sync.set({userID: this.userID}, function(){});
                  //chrome.storage.sync.set({isPaused: false}, function(){});
                  console.log('set id to ', this.userID)
                }
              }

              return false;
            }
      });

      //chrome.tabs.create({url: "https://csmapnyu.org"});
    }
    
  },

  getID: function(request, sender, sendResponse){
      sendResponse(this.userID);
  },

  loadConfig: function() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", chrome.extension.getURL("/.config.json"), true);
    xhr.onreadystatechange = function() {
      if(xhr.readyState ===4 ){
        if(xhr.status === 200) {
          background.config = JSON.parse(xhr.response);
          AWS.config.region = background.config.bucketRegion; // Region
          AWS.config.credentials = new AWS.CognitoIdentityCredentials({
              IdentityPoolId: background.config.poolId,
          });
          background.creds = new AWS.S3({
            apiVersion: "2006-03-01",
            params: {
            Bucket: background.config.bucketName,
            }
          });
        }
        else {
          console.log('Cannot read config file')
        }
      }
    };
    
    xhr.send()
  },

  getConfig: function(request, sender, sendResponse){
      sendResponse(background.config);
  },

};

// startup 
background.init();

