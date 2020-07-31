
var console = chrome.extension.getBackgroundPage().console;

//console.log('Hello')
var currID;
var attempt = 10; 
async function setUserID() {
  var msg = "Welcome to URL Historian. Please enter your User ID!"
  var userInputID = "" + document.getElementById("userID").value;
  chrome.storage.sync.get('userID', function(temp) {
    currID = "" + temp.userID; 
  });

  console.log(userInputID, currID);
  if (userInputID === '') { 
    alert(msg);
  } else if(!(userInputID === currID)) {
    chrome.runtime.sendMessage({userID: userInputID, message:"setUserId"});
    }
  }
  // } else {
  //   chrome.runtime.sendMessage({userID: userInputID, message:"setUserId"});
  // }

// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//   console.log("getting request");
//   if (request.message == "validationFailure") {
//   //  To do something
//     console.log("got request");
//     // chrome.browserAction.setIcon({path: "icon_disabled.png"});
//     document.getElementById("userID").disabled = true
//     document.getElementById("userInput").disabled = true;
//     document.getElementById("btSubmit").disabled = true;
//     document.getElementById("btAdd").disabled = true
//     document.getElementById("cbPause").disabled = true
//     // chrome.browserAction.setPopup({popup: ""});
//     console.log('popup disabled')
//   }
// });

//remove items from blacklist 
var remove = document.getElementsByClassName("remove");
for (var i = 0; i < remove.length; i++) {
  remove[i].onclick = function() {
    var div = this.parentElement;
    div.parentNode.removeChild(div);
    chrome.storage.sync.get({blacklist: []}, function(temp) {
      var bl = temp.blacklist;
      for (var j = 0; j < bl.length; j++) {
        if (bl[j] === remove[i]){
            bl.splice(j, 1);
        }
      }
    })
  }
}

//gets nonempty website name to add to blacklist
function addElement() {
  var inputValue = document.getElementById("userInput").value;
  if (inputValue === '') {
    alert("Please enter website domain to add to the Blacklist!");
  } else {
    addToBlacklist(inputValue);
  }
  document.getElementById("userInput").value = "";
}

//adds nonduplicate website name to blacklist
function addToBlacklist(str) {
  chrome.storage.sync.get({blacklist: []}, function(temp){
    var bl = temp.blacklist;
    var check = 0;
    for (var i = 0; i < bl.length; i++) {
      if (bl[i] === str) {
        check++;
      }
    }
    if (check === 0) {
      bl.push(str);
      bl.sort();
      chrome.storage.sync.set({blacklist: bl}, function(){
      })
      newElement(str);
    }
  })
}

//creates a new list item for blacklist item and adds neccesary html
function newElement(myStr) {
  var li = document.createElement("li");
  var s = document.createTextNode(myStr);
  li.appendChild(s);
  document.getElementById("currBlacklist").appendChild(li);
  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  //var txt = document.createTextNode("-");
  span.className = "remove";
  txt.className = "rmText";
  span.appendChild(txt);
  li.appendChild(span);
  for (var i = 0; i < remove.length; i++) {
    remove[i].onclick = function() {
      var div = this.parentElement;
      removeItem(div);
    }
  }
}

//removes a list item from the website blacklist
function removeItem(div) {
  var str = div.innerText.substring(0, div.innerText.length - 1);
  chrome.storage.sync.get({blacklist: []}, function(temp){
    var bl = temp.blacklist;
    for (var i = 0; i < bl.length; i++) {
      if (bl[i] === str) {
        bl.splice(i, 1);
      }
    }
    chrome.storage.sync.set({blacklist: bl}, function(){
    })
  })

  div.parentNode.removeChild(div);
}

//displays the blacklist onto popup.html
function writeList(){
  chrome.storage.sync.get(['userID'], function(temp) {
    var id = temp.userID;
    var pl = document.getElementById("userID").placeholder = id;
  });
  chrome.storage.sync.get(['isPaused'], function(temp) {
    var paused = temp.isPaused;
    var pauseLabel = document.getElementById("lbPause");
    var pauseCheckbox = document.getElementById("cbPause");
    if(paused){
      pauseLabel.innerHTML = "Paused";
      pauseCheckbox.checked = false;

    } else {
      pauseLabel.innerHTML = "Active";
      pauseCheckbox.checked = true;
    }
  });
  chrome.storage.sync.get({blacklist: []}, function(temp) {
    var bl = temp.blacklist.sort();
    for (var i = 0; i < bl.length; i++) {
      newElement(bl[i]);
    }
  });
}

// Alarm user how long they have paused the extension
// First alarm fires 1hr after the extension is paused, and then fires every other 30 mins
var alarmOnPause = {

        onHandler : function(e) {
            // chrome.alarms.create("alarmUser", {delayInMinutes: 0.1, periodInMinutes: 0.1} ); // for testing
            chrome.alarms.create("alarmUser", {delayInMinutes: 60, periodInMinutes: 30} );
        },

        offHandler : function(e) {
            chrome.alarms.clear("alarmUser");
        }

};


function pauseExtension(){
  chrome.storage.sync.get(['isPaused', 'userID'], function(temp) {
    // console.log(temp.userID + " " + temp.isPaused);
    if (temp.userID === undefined) {
      document.getElementById("cbPause").checked = false;
      alert("Welcome to URL Historian. Please log in with your User ID!");
    } else {
      var paused = !temp.isPaused;
      chrome.storage.sync.set({isPaused: paused});
      var pauseLabel = document.getElementById("lbPause");
      if(paused){
        chrome.browserAction.setIcon({path: "icon_disabled.png"});
        pauseLabel.innerHTML = "Paused";
        // CREATE ALARM
        alarmOnPause.onHandler();
      } else {
        chrome.browserAction.setIcon({path: "icon128.png"});
        pauseLabel.innerHTML = "Active";
        // CLEAR ALARM
        alarmOnPause.offHandler();
        chrome.runtime.sendMessage({message:"resetPausedTime"});
      }
    }
  });
}
  // Get value from chrome.storage using key
  // Asynchronous. Used in async functions and with 'await' keyword
  async function getSyncStorageValue(key) {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.get(key, function(temp){ 
          resolve(temp);
        });
      }
      catch (ex) {
        reject(ex);
      }
    });
  }

// Request Data Deletion
$( function() {

// <---- General methods and variables ---->
  // Update and highlight validate tips in dialogs
  function updateTips(id,text){
    $(id)
      .text(text)
      .addClass( "ui-state-highlight" );

      setTimeout(function() {
        $(id).removeClass( "ui-state-highlight", 1500 );
      }, 300 );
  }

  // Format user selections into S3 folder paths for data deletion
  // Return an array of ID/yyyy/mm/dd or an array of ID/yyyy/mm/dd/hh
  function formatDateTime(currID, date, timezone, starttime=null, endtime=null) {
    var startTime;
    var endTime; 
    var day = date.toISOString().slice(0, 10);
    currID = currID.toString();
    if (starttime !== '' && endtime == '') { // by single hour
      starttime = (starttime<10) ? " 0"+starttime+":00" : " "+starttime+":00";
      startTime = moment.tz(day+starttime, timezone).valueOf();
      // console.log([[currID, startTime.format("YYYY/MM/DD/HH")].join('/')]);
      return [currID, startTime, startTime + (60*60*1000)];
    } else if (starttime == '' && endtime == '') { // by date
        starttime = ' 00:00';
        startTime = moment.tz(day+starttime, timezone).valueOf();
        // console.log([currID, startTime, startTime + (24*60*60)]);
        return [currID, startTime, startTime + (24*60*60*1000)];
    } else { // by time range
      starttime = (starttime<10) ? " 0"+starttime+":00" : " "+starttime+":00";
      endtime = (endtime<10) ? " 0"+endtime+":00" : " "+endtime+":00";

      startTime = moment.tz(day+starttime, timezone).valueOf();
      endTime = moment.tz(day+endtime, timezone).valueOf();

      // console.log([currID, startTime, endTime+(60*60)]);
      return [currID, startTime, endTime+(60*60*1000)];
    }

      // //CONVERT TO UTC
      // startTime = moment.tz(day+starttime, timezone).utc();
      // endTime = moment.tz(day+endtime, timezone).utc();

      // var timeRange = [[currID,startTime.format("YYYY/MM/DD/HH")].join("/")];
      // var time = startTime.clone();
      // while (!time.isSame(endTime)) {
      //   time.add(1,"hour");
      //   timeRange.push([currID,time.format("YYYY/MM/DD/HH")].join("/"));
      // }
      // // console.log(timeRange);
      // return timeRange;
  }

// <--- Time Zone --->
// Code modified from https://matall.in/posts/building-an-usable-timezone-selector/
  const _t = (s) => {
    if (i18n !== void 0 && i18n[s]) {
      return i18n[s];
    }
    return s;
  };

  const i18n = {
    "Etc/GMT+12": "International Date Line West",
    "Pacific/Midway": "Midway Island, Samoa",
    "Pacific/Honolulu": "Hawaii",
    "America/Juneau": "Alaska",
    "America/Dawson": "Pacific Time (US and Canada); Tijuana",
    "America/Boise": "Mountain Time (US and Canada)",
    "America/Chihuahua": "Chihuahua, La Paz, Mazatlan",
    "America/Phoenix": "Arizona",
    "America/Chicago": "Central Time (US and Canada)",
    "America/Regina": "Saskatchewan",
    "America/Mexico_City": "Guadalajara, Mexico City, Monterrey",
    "America/Belize": "Central America",
    "America/New_York": "Eastern Time (US and Canada)",
    "America/Indiana/Indianapolis": "Indiana (East)",
    "America/Bogota": "Bogota, Lima, Quito",
    "America/Glace_Bay": "Atlantic Time (Canada)",
    "America/Caracas": "Caracas, La Paz",
    "America/Santiago": "Santiago",
    "America/St_Johns": "Newfoundland and Labrador",
    "America/Sao_Paulo": "Brasilia",
    "America/Argentina/Buenos_Aires": "Buenos Aires, Georgetown",
    "America/Godthab": "Greenland",
    "Etc/GMT+2": "Mid-Atlantic",
    "Atlantic/Azores": "Azores",
    "Atlantic/Cape_Verde": "Cape Verde Islands",
    "GMT": "Dublin, Edinburgh, Lisbon, London",
    "Africa/Casablanca": "Casablanca, Monrovia",
    "Atlantic/Canary": "Canary Islands",
    "Europe/Belgrade": "Belgrade, Bratislava, Budapest, Ljubljana, Prague",
    "Europe/Sarajevo": "Sarajevo, Skopje, Warsaw, Zagreb",
    "Europe/Brussels": "Brussels, Copenhagen, Madrid, Paris",
    "Europe/Amsterdam": "Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna",
    "Africa/Algiers": "West Central Africa",
    "Europe/Bucharest": "Bucharest",
    "Africa/Cairo": "Cairo",
    "Europe/Helsinki": "Helsinki, Kiev, Riga, Sofia, Tallinn, Vilnius",
    "Europe/Athens": "Athens, Istanbul, Minsk",
    "Asia/Jerusalem": "Jerusalem",
    "Africa/Harare": "Harare, Pretoria",
    "Europe/Moscow": "Moscow, St. Petersburg, Volgograd",
    "Asia/Kuwait": "Kuwait, Riyadh",
    "Africa/Nairobi": "Nairobi",
    "Asia/Baghdad": "Baghdad",
    "Asia/Tehran": "Tehran",
    "Asia/Dubai": "Abu Dhabi, Muscat",
    "Asia/Baku": "Baku, Tbilisi, Yerevan",
    "Asia/Kabul": "Kabul",
    "Asia/Yekaterinburg": "Ekaterinburg",
    "Asia/Karachi": "Islamabad, Karachi, Tashkent",
    "Asia/Kolkata": "Chennai, Kolkata, Mumbai, New Delhi",
    "Asia/Kathmandu": "Kathmandu",
    "Asia/Dhaka": "Astana, Dhaka",
    "Asia/Colombo": "Sri Jayawardenepura",
    "Asia/Almaty": "Almaty, Novosibirsk",
    "Asia/Rangoon": "Yangon Rangoon",
    "Asia/Bangkok": "Bangkok, Hanoi, Jakarta",
    "Asia/Krasnoyarsk": "Krasnoyarsk",
    "Asia/Shanghai": "Beijing, Chongqing, Hong Kong SAR, Urumqi",
    "Asia/Kuala_Lumpur": "Kuala Lumpur, Singapore",
    "Asia/Taipei": "Taipei",
    "Australia/Perth": "Perth",
    "Asia/Irkutsk": "Irkutsk, Ulaanbaatar",
    "Asia/Seoul": "Seoul",
    "Asia/Tokyo": "Osaka, Sapporo, Tokyo",
    "Asia/Yakutsk": "Yakutsk",
    "Australia/Darwin": "Darwin",
    "Australia/Adelaide": "Adelaide",
    "Australia/Sydney": "Canberra, Melbourne, Sydney",
    "Australia/Brisbane": "Brisbane",
    "Australia/Hobart": "Hobart",
    "Asia/Vladivostok": "Vladivostok",
    "Pacific/Guam": "Guam, Port Moresby",
    "Asia/Magadan": "Magadan, Solomon Islands, New Caledonia",
    "Pacific/Fiji": "Fiji Islands, Kamchatka, Marshall Islands",
    "Pacific/Auckland": "Auckland, Wellington",
    "Pacific/Tongatapu": "Nuku'alofa"
  }

  const timezones = Object.keys(i18n);

  const selectorOptions = moment.tz.names()
    .filter(tz => {
      return timezones.includes(tz)
    })
    .reduce((memo, tz) => {
      memo.push({
        name: tz,
        offset: moment.tz(tz).utcOffset()
      });
      
      return memo;
    }, [])
    .sort((a, b) => {
      return a.offset - b.offset
    })
    .reduce((memo, tz) => {
      const timezone = tz.offset ? moment.tz(tz.name).format('Z') : '';

      return memo.concat(`<option value="${tz.name}">(UTC${timezone}) ${_t(tz.name)}</option>`);
    }, "");

  // document.querySelector("#timezone1").innerHTML = ["<option value=''> --Select-- </option>", selectorOptions].join('');
  document.querySelector("#timezone1").innerHTML = selectorOptions;
  document.querySelector("#timezone2").innerHTML = selectorOptions;

// <---- Delete history by date ---->
  // Format date time for confirmation window
  function formatPrintDateTime(date,time=null) {
    if (time === null) {
      return moment(date.toISOString().slice(0,10)).format("LL");
    }
   return moment(date.toISOString().slice(0,10) + ((time<10) ? " 0"+time+":00" : " "+ time+":00")).format("LLL");
  }
  // Get date selected by user
  async function getDateforByDate(values) {
    var date = $("#datepicker1").datepicker("getDate");
    var currID = await getSyncStorageValue('userID');
    var timezone = $("#timezone1").val();
    currID = '' + currID.userID;
    //console.log("currid: " +  currID);
    // ENSURE USER IS LOGGED IN
    if (currID === 'undefined') {
      updateTips("#validateTips1", "Please log in with your UserID first.")
    } 
    else if (date !== null && date instanceof Date && timezone !== '') {
      var formattedDate = formatDateTime(currID, date, timezone, starttime='',endtime='');
      var abbr = moment.tz.zone(timezone).abbr(date.getTime());
      var printDate = formatPrintDateTime(date);
      // POP A CONFIRMATION WINDOW TO PREVENT USER ERRORS
      if(confirm("You are about to delete all history on:\n\n\t" + printDate+ " " + abbr + "\n\nClick OK to continue.")){
        // console.log(formattedDate[0]);
        // chrome.runtime.sendMessage({delbyDate: formattedDate, message:'delbyDate'});
        chrome.runtime.sendMessage({prefix: formattedDate, message:'delete'});
        $.datepicker._clearDate("#datepicker1");
        $(this).dialog( "close" );
      }
    } else {  
      updateTips("#validateTips1","Please select a valid date.");
    } 
  }

  // Dialog window config
  dialog1 = $( "#deleteByDateForm" ).dialog({
      autoOpen: false,
      height: 200,
      width: 340,
      modal: true,
      buttons: [
          {text: "Delete",
           click: getDateforByDate},
          {text: "Cancel",
          click: function() {
            $.datepicker._clearDate("#datepicker1");
            $(this).dialog( "close" );
        }}
      ]
  });

  // Initialize by Date 
  $("#btDeleteDate").button().removeClass();
  $( "#btDeleteDate" ).button().on("click", function() {
    $("#validateTips1").text("Select a date on which you wish to delete history and the time zone you were in.");
    dialog1.dialog('open');
    $( "#datepicker1" ).datepicker({
      showOtherMonths: true,
      selectOtherMonths:true,
      minDate: -6, maxDate: 0
    }).blur(); 
    $("#timezone1").val("America/New_York");
    $("#timezone1").select2();

  });

// <---- Delete history by time range ---->
  // Get date and time frame selected by user
  async function getDateTime(){
    var date = $("#datepicker2").datepicker("getDate");
    var startTime = $("#startTime").val(); 
    var endTime = $("#endTime").val(); 
    var singleTime = $("#singleTime").val();
    var currID = await getSyncStorageValue('userID');
    var timezone = $("#timezone2").val();
    currID = '' + currID.userID;

    if (currID === 'undefined') {
      updateTips("#validateTips2", "Please log in with your UserID first.")
    } 
    else if (date !== null && timezone !== '') {
      // DELETE BY HOUR RANGE
      if (startTime !== '' && endTime !== '' && parseInt(startTime) <= parseInt(endTime)) {
        var formattedTime = formatDateTime(currID, date, timezone, starttime=startTime, endtime=endTime);
        
        var printST = formatPrintDateTime(date, startTime);
        var printET = formatPrintDateTime(date, endTime);
        var abbr = moment.tz.zone(timezone).abbr(date.getTime());

        // POP A CONFIRMATION WINDOW TO PREVENT USER ERRORS
        if(confirm("You are about to delete history in the following time frame (inclusive):\n\n\tfrom: " + printST + " " + abbr +"\n\tto: " + printET + " " + abbr +"\n\nClick OK to continue.")){
          // console.log(timeRange);
          //chrome.runtime.sendMessage({delbyTime : timeRange, message:'delbyTime'});
          chrome.runtime.sendMessage({prefix: formattedTime, message:'delete'});
          $.datepicker._clearDate("#datepicker2");
          dialog2.dialog( "close" );
        }
      // DELETE BY SINGLE HOUR
      } else if (singleTime !== '') {
        var timeSingle = formatDateTime(currID, date, timezone, starttime=singleTime, endTime = '');

        var printST = formatPrintDateTime(date,singleTime);
        var abbr = moment.tz.zone(timezone).abbr(date.getTime());
        // POP A CONFIRMATION WINDOW TO PREVENT USER ERRORS
        if(confirm("You are about to delete history of the following hour: \n\n\t" + printST + " " + abbr + "\n\nClick OK to continue.")){
          // console.log(timeSingle);
          // chrome.runtime.sendMessage({delbyTime : timeSingle, message:'delbyTime'});
          chrome.runtime.sendMessage({prefix: timeSingle, message:'delete'});
          $.datepicker._clearDate("#datepicker2");
          dialog2.dialog( "close" );
        }
      } else {  
        updateTips("#validateTips2","Please select a valid time frame.")
      }
    } else {  
      updateTips("#validateTips2","Please select a valid time frame.")
    }
  }

  // Config by Time initialization
  function launchTime() {
    $("#timezone2").val("America/New_York");
    $("#validateTips2").text("Select a time frame to delete history and the time zone you were in. ");
    $( "#datepicker2" ).datepicker({
          showOtherMonths: true,
          selectOtherMonths: true,
          minDate: -6, maxDate: 0
        }).blur(); 
    $('#singleTime').prop('disabled', false);
    $("#startTime").prop('disabled', false);
    $("#endTime").prop('disabled', false);
    $("#startTime").val('');
    $("#endTime").val('');
    $("#singleTime").val('');
    

    $("#startTime").change(function() {
      $("#endTime option").removeAttr('disabled');
      var value = $("#startTime option:selected").val();
      if (value === '') return;
      for (var i = 0; i <= value; i++){
        $("#endTime option[value="+ i +"]").attr('disabled','disabled');
      }
      $('#singleTime').prop('disabled', true);
    });

    $("#singleTime").change(function() {
      $('#endTime').prop('disabled', true);
      $('#startTime').prop('disabled',true);
    });
    $("#timezone2").select2();
  }

  // Dialog window config 
  dialog2 = $( "#deleteByTimeForm" ).dialog({
      autoOpen: false,
      height: 280,
      width: 330,
      modal: true,
      buttons: [
        {text: "Delete",
         click: getDateTime},
         {text: "Reset",
         click: function (){
          $.datepicker._clearDate("#datepicker2");
          launchTime();}
         },
        {text: "Cancel",
        click: function() {
          $.datepicker._clearDate("#datepicker2");
          dialog2.dialog( "close" );
        }}
      ]
  });

  // Initialize by Time 
  $("#btDeleteTime").button().removeClass();
  $("#btDeleteTime").button().on("click", function() {
    dialog2.dialog( "open" );
    launchTime();
  });

// <---- Help button ---->
  // Initialize Help
  $("#btHelp").button().removeClass();
  $("#btHelp").button().on("click", function(){
    alert("To pause activity\n\tSlide the option button to the left\nTo delete browse history\n\tby Date\n\t\t1. Click \"by Date\" button\n\t\t2. Select the time zone you were in\n\t\t3. Select a date to delete\n\t\t4. Click \"Delete\" button\n\t\t5. Confirm deletion date\n\tby Time\n\t\t1. Click \"by Time\" button\n\t\t2. Select the time zone you were in \n\t\t3. Select date and time frame to delete\n\t\t4. Click \"Delete\" button\n\t\t5. Confirm deletion date and time\nFor websites you wish to exclude\n\t1. Enter the domain in \"Blacklist a website\"\n\t2. Click \"Add\" button\nTo remove a website from current blacklist\n\tClick X next to the website\n\nFor more information about research at CSMaP, please visit https://csmapnyu.org/");
  }); 

});

// Disalbe extension after three attempts
getSyncStorageValue("isDeactivated").then(function(isDeactivated) {
  // console.log("what is isDeactivated: ", isDeactivated);
if (isDeactivated.isDeactivated !== undefined) {
  isDeactivated = isDeactivated.isDeactivated;
  // console.log("isDeactivated:", isDeactivated);
  if (isDeactivated === true) {
    document.getElementById("userID").disabled = true;
    document.getElementById("btSubmit").disabled = true;
    document.getElementById("btAdd").disabled = true;
    document.getElementById("cbPause").disabled = true;
    document.getElementById("btDeleteDate").disabled = true;
    document.getElementById("btDeleteTime").disabled = true;
    document.getElementById("userInput").disabled = true;
  }
}
})


//link buttons to appropriate functions once website is loaded
window.addEventListener('DOMContentLoaded', (event) => {
  document.querySelector('#btSubmit').addEventListener('click', setUserID);
  document.querySelector('#btAdd').addEventListener('click', addElement);
  document.querySelector('#cbPause').addEventListener('change', pauseExtension);
  writeList();
});