
var console = chrome.extension.getBackgroundPage().console;

//console.log('Hello')
var currID;
function setUserID() {
  var msg = "Welcome to Url his Historian. Please enter your user ID!"
  var userInputID = "" + document.getElementById("userID").value;
  chrome.storage.sync.get('userID', function(temp) {
    currID = "" + temp.userID; 
    console.log(currID);
  });

  console.log(userInputID, currID)
  if (userInputID === '') { 
    alert(msg);
  } else if(!(userInputID === currID)) {
        chrome.runtime.sendMessage({userID: userInputID, message:"setUserId"}) 
  } else {
    chrome.runtime.sendMessage({userID: userInputID, message:"setUserId"})
  }

};


chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
  if (request.msg === "validation_failure") {
  //  To do something
    chrome.browserAction.setIcon({path: "icon_disabled.png"});
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
    alert("You must write something!");
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

  var restrictedDates = []; // deleted dates

// General functions for deleting history
  function updateTips(id,text){
    $(id)
      .text(text)
      .addClass( "ui-state-highlight" );

      setTimeout(function() {
        $(id).removeClass( "ui-state-highlight", 1500 );
      }, 300 );
  }

//Delete history by date
  function getDateforByDate() {
    if (restrictedDates.length === 7) {
      updateTips(".validateTips", "You have no browse history to delete!");
    }
    var date = $("#datepicker1").datepicker("getDate");
    if (date !== null && date instanceof Date) {
      console.log($.datepicker.formatDate('yy-mm-dd', date));
      $.datepicker._clearDate("#datepicker1");
      $(this).dialog( "close" );
      // disable the deleted date for next selection
      // TODO: add today back in if new browse history is generated
      restrictedDates.push($.datepicker.formatDate('yy-mm-dd', date));
      // return timestamp
      return date.getTime();
    } else {  
      updateTips(".validateTips","Please select a valid date.")
    }
  }

    dialog1 = $( "#deleteByDateForm" ).dialog({
        autoOpen: false,
        height: 300,
        width: 300,
        modal: true,
        buttons: [
          {text: "Delete",
           click: getDateforByDate},
          {text: "Cancel",
          click: function() {
            $.datepicker._clearDate("#datepicker1");
            dialog1.dialog( "close" );
          }}
        ]
    });

    $( "#btDeleteDate" ).button().on("click", function() {
      dialog1.dialog( "open" );
      $( "#datepicker1" ).datepicker({
        showOtherMonths: true,
        selectOtherMonths:true,
        minDate: -6, maxDate: 0,
        beforeShowDay: function(date) {
          var string = $.datepicker.formatDate('yy-mm-dd', date);
          return [restrictedDates.indexOf(string) == -1]
        }
      }).blur(); 
    });

// Delete history by time range   

      

  });





//link buttons to appropriate functions once website is loaded
window.addEventListener('DOMContentLoaded', (event) => {
  document.querySelector('#btSubmit').addEventListener('click', setUserID);
  document.querySelector('#btAdd').addEventListener('click', addElement);
  document.querySelector('#cbPause').addEventListener('change', pauseExtension);
  //document.querySelector('#btDeleteDate').addEventListener('click', deleteDate);
  //document.querySelector('#btDeleteTime').addEventListener('click', deleteTime);
  writeList();
});
