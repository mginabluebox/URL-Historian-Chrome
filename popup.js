
// var console = chrome.extension.getBackgroundPage().console;

//console.log('Hello')
var currID;
function setUserID() {
  var msg = "Welcome to Url his Historian. Please enter your user ID!"
  var userInputID = "" + document.getElementById("userID").value;
  chrome.storage.sync.get('userID', function(temp) {
    currID = "" + temp.userID; 
    // console.log(currID);
  });

  console.log(userInputID, currID)
  if (userInputID === '') { 
    alert(msg);
  } else if(!(userInputID == currID)) {
    chrome.runtime.sendMessage({userID: userInputID, message:"setUserId"}); 
  } else {
    chrome.runtime.sendMessage({userID: userInputID, message:"setUserId"});
  }

};


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message == "validationFailure") {
  //  To do something
    // chrome.browserAction.setIcon({path: "icon_disabled.png"});
    document.getElementById("userID").disabled = true
    document.getElementById("userInput").disabled = true;
    document.getElementById("btSubmit").disabled = true;
    document.getElementById("btAdd").disabled = true
    document.getElementById("cbPause").disabled = true
    chrome.browserAction.setPopup({popup: ""});
    console.log('popup disabled')
  }
});


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

function pauseExtension(){
  chrome.storage.sync.get(['isPaused'], function(temp) {
    var paused = !temp.isPaused;
    chrome.storage.sync.set({isPaused: paused});
    var pauseLabel = document.getElementById("lbPause");
    if(paused){
      chrome.browserAction.setIcon({path: "icon_disabled.png"});
      pauseLabel.innerHTML = "Paused";
    } else {
      chrome.browserAction.setIcon({path: "icon128.png"});
      pauseLabel.innerHTML = "Active";
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
  function formatDateTime(currID, date, starttime=null, endtime=null) {
    function pad(val) {
      return (val<10) ? '0' + val : val;
    }
    var startTime;
    var endTime; 
    // GET LOCAL TIME
    var day = [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('/')

    if (starttime == '' && endtime == '') {
      return [[currID, day].join('/')]
    } else if (starttime !== '' && endtime == '') {
      startTime = pad(starttime);
      return [[currID, day, startTime].join('/')]
    } else if (starttime !== '' && endtime !=='') {
      startTime = starttime;
      endTime = endtime;
      var timeRange =[];
      for (var hour = startTime; hour <= endTime; hour++) {
        timeRange.push([currID, day, pad(hour)].join('/'));
      }
      return timeRange;
    }
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

// <---- Delete history by date ---->
  // Get date selected by user
  async function getDateforByDate(values) {
    var date = $("#datepicker1").datepicker("getDate");
    var currID = await getSyncStorageValue('userID');
    currID = '' + currID.userID;
    //console.log("currid: " +  currID);
    // ENSURE USER IS LOGGED IN
    if (currID === 'undefined') {
      updateTips("#validateTips1", "Please log in with your UserID first.")
    } 
    else if (date !== null && date instanceof Date) {
      var formattedDate = formatDateTime(currID, date,starttime='',endtime='');
      // POP A CONFIRMATION WINDOW TO PREVENT USER ERRORS
      if(confirm("You are about to delete all history on (yyyy/mm/dd):\n\n" + formattedDate[0].substring(formattedDate[0].indexOf("/") + 1) + "\n\nClick OK to continue.")){
        // console.log(formattedDate[0]);
        chrome.runtime.sendMessage({delbyDate: formattedDate, message:'delbyDate'});
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
      height: 230,
      width: 200,
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
    $("#validateTips1").text("Select a date on which you wish to delete history.");
    dialog1.dialog('open');
    $( "#datepicker1" ).datepicker({
      showOtherMonths: true,
      selectOtherMonths:true,
      minDate: -6, maxDate: 0
    }).blur(); 
  });

// <---- Delete history by time range ---->
  // Get date and time frame selected by user
  async function getDateTime(){
    var date = $("#datepicker2").datepicker("getDate");
    var startTime = $("#startTime").val(); // instance of Date
    var endTime = $("#endTime").val(); 
    var singleTime = $("#singleTime").val();
    var currID = await getSyncStorageValue('userID');
    currID = '' + currID.userID;

    if (currID === 'undefined') {
      updateTips("#validateTips2", "Please log in with your UserID first.")
    } 
    else if (date !== null) {
      // DELETE BY HOUR RANGE
      if (startTime !== '' && endTime !== '' && parseInt(startTime) <= parseInt(endTime)) {
        var timeRange = formatDateTime(currID, date, starttime=startTime, endtime=endTime);
        // console.log(timeRange);
        // POP A CONFIRMATION WINDOW TO PREVENT USER ERRORS
        if(confirm("You are about to delete history in the following time frame (inclusive; 24-hour clock):\n\n from (yyyy/mm/dd/hh): " + timeRange[0].substring(timeRange[0].indexOf("/") + 1) + "\n   to (yyyy/mm/dd/hh): " + timeRange[timeRange.length-1].substring(timeRange[timeRange.length-1].indexOf("/") + 1) + "\n\nClick OK to continue.")){
          // console.log(timeRange);
          chrome.runtime.sendMessage({delbyTime : timeRange, message:'delbyTime'});
          $.datepicker._clearDate("#datepicker2");
          dialog2.dialog( "close" );
        }
      // DELETE BY SINGLE HOUR
      } else if (singleTime !== '') {
        var timeSingle = formatDateTime(currID, date, starttime=singleTime, endTime = '');
        // POP A CONFIRMATION WINDOW TO PREVENT USER ERRORS
        if(confirm("You are about to delete history of the following hour (24-hour clock; yyyy/mm/dd/hh): \n\n" + timeSingle[0].substring(timeSingle [0].indexOf("/") + 1) + "\n\nClick OK to continue.")){
          // console.log(timeSingle);
          chrome.runtime.sendMessage({delbyTime : timeSingle, message:'delbyTime'});
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
    // $.datepicker._clearDate("#datepicker2");  
    $("#validateTips2").text("Select a time frame to delete history. ");
    $( "#datepicker2" ).datepicker({
          showOtherMonths: true,
          selectOtherMonths: true,
          minDate: -6, maxDate: 0
          // beforeShowDay: function(date) {
          //   var string = $.datepicker.formatDate('yy-mm-dd', date);
          //   return [restrictedDates.indexOf(string) == -1];
          // }
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

  }

  // Dialog window config 
  dialog2 = $( "#deleteByTimeForm" ).dialog({
      autoOpen: false,
      height: 267,
      width: 359,
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
    alert("To pause activity\n\tSlide the option button to the left\nTo delete browse history\n\tby Date\n\t\t1. Click \"by Date\" button\n\t\t2. Select a date within the past seven days \n\t\t3. Click \"Delete\" button\n\t\t4. Confirm deletion date\n\tby Time\n\t\t1. Click \"by Time\" button\n\t\t2. Select a date and time frame within the past seven days\n\t\t3. Click \"Delete\" button\n\t\t4. Confirm deletion date and time\nFor websites you wish to exclude\n\t1. Enter the website domain in \"Blacklist a website\"\n\t2. Press \"Add\" button\nTo remove a website from current blacklist\n\tClick X next to the website\n\nFor more information about research at CSMaP, please visit https://csmapnyu.org/");
  });

// <--- Time Zone --->
  $("#timezone").on("change", function() { 

  });

});


//link buttons to appropriate functions once website is loaded
window.addEventListener('DOMContentLoaded', (event) => {
  document.querySelector('#btSubmit').addEventListener('click', setUserID);
  document.querySelector('#btAdd').addEventListener('click', addElement);
  document.querySelector('#cbPause').addEventListener('change', pauseExtension);
  writeList();
});