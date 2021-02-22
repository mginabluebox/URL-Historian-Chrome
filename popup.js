// MESSAGES
blt_msg = "Please enter website domain to add to the Blacklist!"; 
enter_user_id_msg = "Welcome to URL Historian. Please enter your User ID!"
help_msg = "To pause activity\n\tSlide the option button to the left\nTo delete browse history\n\tby Date\n\t\t1. Click \"by Date\" button\n\t\t2. Select the time zone you were in\n\t\t3. Select a date to delete\n\t\t4. Click \"Delete\" button\n\t\t5. Confirm deletion date\n\tby Time\n\t\t1. Click \"by Time\" button\n\t\t2. Select the time zone you were in \n\t\t3. Select date and time frame to delete\n\t\t4. Click \"Delete\" button\n\t\t5. Confirm deletion date and time\nFor websites you wish to exclude\n\t1. Enter the domain in \"Blacklist a website\"\n\t2. Click \"Add\" button\nTo remove a website from current blacklist\n\tClick X next to the website\n\nFor any further questions, please contact us at nyu-smapp-engineers@nyu.edu"
login_first_msg = "Please log in with your UserID first."
select_date_msg = "Select a date on which you wish to delete history and the time zone you were in."
select_time_msg = "Select a time frame to delete history and the time zone you were in. "
valid_date_msg = "Please select a valid date."
valid_time_msg = "Please select a valid time frame."

blt_msg_spanish = "¡Por favor introduce el dominio web que quieras agregar a la Lista Negra! (Blacklist)"
enter_user_id_msg_spanish = "Bienvenido al URL Historian. ¡Por favor entra tu ID de Usuario!"
help_msg_spanish = "Para pausar la actividad\n\tDesliza el botón de opción hacia la izquierda\nPara eliminar tu historial de navegación\n\tpor Fecha\n\t\t1. Haz click en el botón \"por Fecha\"\n\t\t2. Selecciona el huso horario en el que estabas\n\t\t3. Selecciona una fecha para borrar\n\t\t4. Haz click en el botón \"Eliminar\" \n\t\t5. Confirma la fecha de borrado\n\tpor Hora\n\t\t1. Haz click en el botón \"por Hora\" \n\t\t2. Selecciona el huso horario en el que estabas \n\t\t3. Selecciona la fecha y rango de tiempo para eliminar\n\t\t4. Haz click en el botón \"Eliminar\" \n\t\t5. Confirma la fecha y hora de borrado\nPara páginas web que quieras excluir\n\t1. Introduce el dominio web en \"Agregar sitio web a la lista negra\"\n\t2. Haz click en el botón \"Agregar\"\nPara eliminar una página web de la lista negra actual\n\t haz click en la X junto a la página web\n\nPara más preguntas, por favor contáctanos en nyu-smapp-engineers@nyu.edu"
login_first_msg_spanish = "Por favor primero ingresa con tu ID de Usuario."
select_date_msg_spanish = "Selecciona una fecha para la cual quieres borrar tu historial y selecciona el huso horario en el que estabas."
select_time_msg_spanish = "Selecciona un rango de tiempo para el cual quieras borrar tu historial y selecciona el huso horario en el que estabas."
valid_date_msg_spanish = "Por favor selecciona una fecha válida."
valid_time_msg_spanish = "Por favor selecciona un rango de tiempo válido."

// SEND USER ID TO background.js FOR VALIDATION
function setUserID() {
    var userInputID = document.getElementById("userID").value.toString().trim();
    chrome.storage.sync.get(['userID','spanish'], function(temp) {
      currID = "" + temp.userID; 
      // console.log(userInputID, currID);
      if (userInputID === '') { 
        if (temp.spanish) alert(enter_user_id_msg_spanish);
        else alert(enter_user_id_msg);
      } else if(!(userInputID === currID)) {
        chrome.runtime.sendMessage({userID: userInputID, message:"setUserId"});
      }
    });
}

// REMOVE ITEMS FROM THE BLACKLIST
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

// GET NONEMPTY WEBSITE NAME TO ADD TO BLACKLIST
function addElement() {
  chrome.storage.sync.get('spanish', function(temp) {
    spanish = temp.spanish;
    var inputValue = document.getElementById("userInput").value;
    if (inputValue === '') {
      if (spanish) alert(blt_msg_spanish);
      else alert(blt_msg);
    } else {
      addToBlacklist(inputValue);
    }
    document.getElementById("userInput").value = "";
  })
  
}

// ADD NONDUPLICATE WEBSITE NAME TO BLACKLIST
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

// CREATES A LIST ITEM FOR BLACKLIST AND ADDS ALL EXISTING WEBISTES
function newElement(myStr) {
  var li = document.createElement("li");
  var s = document.createTextNode(myStr);
  li.appendChild(s);
  document.getElementById("currBlacklist").appendChild(li);
  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
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

// REMOVES A WEBSITE FROM BLACKLIST 
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
    });
  });

  div.parentNode.removeChild(div);
}

// DISPLAY CONTENT TO popup.html
function writeContent(changeLg){
  chrome.storage.sync.get(['userID', 'isPaused', 'blacklist','spanish'], function(temp) {
    isSpanish = temp.spanish;
    ph_text = 'Enter User ID';
    ph_text_spanish = 'Introduce el ID de Usuario'
    // set placeholder for user id
    var id = "" + temp.userID;
    if (id === 'undefined') {
      var pl = document.getElementById("userID").placeholder = isSpanish ? ph_text_spanish : ph_text;
    } else {
      var pl = document.getElementById("userID").placeholder = id;
    }
    // set pause/active
    var paused = temp.isPaused;
    var pauseLabel = document.getElementById("lbPause");
    var pauseCheckbox = document.getElementById("cbPause");
    if (paused){
      pauseLabel.innerHTML = isSpanish ? "Pausado" : "Paused";
      pauseCheckbox.checked = false;

    } else {
      pauseLabel.innerHTML = isSpanish ? "Activado" : "Active";
      pauseCheckbox.checked = true;
    }
    // set blacklist 
    if (temp.blacklist === undefined || temp.blacklist === 'undefined') {
      var bl = [];
    } else {
      var bl = temp.blacklist.sort();
    }
    for (var i = 0; i < bl.length; i++) {
      newElement(bl[i]);
    }

    if (changeLg) {
      if (isSpanish) window.location.replace("popup_spanish.html");
      else window.location.replace("popup.html");
    }
  });
}

// ALARM USER ON PAUSING EXTENSION FOR TOO LONG
// First alarm fires 1hr after the extension is paused, and then fires every other 360 mins
var alarmOnPause = {
  onHandler : function(e) {
      chrome.alarms.create("alarmUser", {delayInMinutes: 60, periodInMinutes: 360} );
  },

  offHandler : function(e) {
      chrome.alarms.clear("alarmUser");
  }
};

// PAUSE THE EXTENSION'S ACTIVITIIES
function pauseExtension(){
  chrome.storage.sync.get(['isPaused', 'userID','spanish'], function(temp) {
    isSpanish = temp.spanish;
    // console.log(temp.userID + " " + temp.isPaused);
    if (temp.userID === undefined) {
      document.getElementById("cbPause").checked = false;
      if (isSpanish) alert(msg_spanish);
      else alert(msg);
    } else {
      var paused = !temp.isPaused;
      chrome.storage.sync.set({isPaused: paused});
      var pauseLabel = document.getElementById("lbPause");
      if(paused){
        chrome.browserAction.setIcon({path: "images/icon_disabled.png"});
        pauseLabel.innerHTML = isSpanish ? "Pausado" : "Paused";
        // CREATE ALARM
        alarmOnPause.onHandler();
      } else {
        chrome.browserAction.setIcon({path: "images/icon128.png"});
        pauseLabel.innerHTML = isSpanish ? "Activado":"Active";
        // CLEAR ALARM
        alarmOnPause.offHandler();
        chrome.runtime.sendMessage({message:"resetPausedTime"});
      }
    }
  });
}

// HELPER FUNCTION FOR GETTING PARAMS FROM CHROME SYNC STORAGE
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

// SWITCH BETWEEN ENGLISH AND SPANISH VERSION
function changeLanguage(){
  chrome.storage.sync.get('spanish',function(temp){
    if (temp.spanish) { // change to english
      chrome.storage.sync.set({'spanish':false}, function(){
        chrome.browserAction.setPopup({popup: "popup.html"}, function() {
          writeContent(true);
        });
      });
      
    } else { //change to spanish
      chrome.storage.sync.set({'spanish': true},function(){
        chrome.browserAction.setPopup({popup:"popup_spanish.html"}, function() {
          writeContent(true);
        });
      });
        // showSpanish(temp.isPaused);
    }
  });
}

// JQUERY SECTION
$( function() {
  // GET PARAMS FROM STORAGE FOR LATER USE
  getSyncStorageValue(['spanish','isDeactivated']).then(function(temp){
    spanish = temp.spanish;
    isDeactivated = temp.isDeactivated;

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

    // Format user selections into timestamps for data deletion
    // Return an array of ID/yyyy/mm/dd or an array of ID/yyyy/mm/dd/hh
    function formatDateTime(currID, date, timezone, starttime=null, endtime=null) {
      var startTime;
      var endTime; 
      var day = date.toISOString().slice(0, 10);
      currID = currID.toString();
      if (starttime !== '' && endtime == '') { // by single hour
        starttime = (starttime<10) ? " 0"+starttime+":00" : " "+starttime+":00";
        startTime = moment.tz(day+starttime, timezone).valueOf(); // return timestamp according to input time zone
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
    }

  // <--- Time Zone setup--->
  // Code modified from https://matall.in/posts/building-an-usable-timezone-selector/
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

    const i18n_spanish = {
      "Etc/GMT+12": "Línea Internacional de Cambio de Fecha Oriente",
      "Pacific/Midway": "Isla Midway, Samoa",
      "Pacific/Honolulu": "Hawaii",
      "America/Juneau": "Alaska",
      "America/Dawson": "Hora de Pacífico (USA y Canadá); Tijuana",
      "America/Boise": "Hora de la Montaña (USA y Canadá)",
      "America/Chihuahua": "Chihuahua, La Paz, Mazatlán",
      "America/Phoenix": "Arizona",
      "America/Chicago": "Hora Central (USA y Canadá)",
      "America/Regina": "Saskatchewan",
      "America/Mexico_City": "Guadalajara, Ciudad de México, Monterrey",
      "America/Belize": "América Central",
      "America/New_York": "Hora del Este (USA y Canadá)",
      "America/Indiana/Indianapolis": "Indiana (Este)",
      "America/Bogota": "Bogotá, Lima, Quito",
      "America/Glace_Bay": "Hora del Atlántico (Canadá)",
      "America/Caracas": "Caracas, La Paz",
      "America/Santiago": "Santiago",
      "America/St_Johns": "Newfoundland y Labrador",
      "America/Sao_Paulo": "Brasilia",
      "America/Argentina/Buenos_Aires": "Buenos Aires, Georgetown",
      "America/Godthab": "Greenland",
      "Etc/GMT+2": "Atlántico medio",
      "Atlantic/Azores": "Azores",
      "Atlantic/Cape_Verde": "Islas de Cabo Verde",
      "GMT": "Dublin, Edinburgo, Lisboa, Londres",
      "Africa/Casablanca": "Casablanca, Monrovia",
      "Atlantic/Canary": "Islas Canarias",
      "Europe/Belgrade": "Belgrado, Bratislava, Budapest, Ljubljana, Praga",
      "Europe/Sarajevo": "Sarajevo, Skopje, Varsovia, Zagreb",
      "Europe/Brussels": "Bruselas, Copenhague, Madrid, Paris",
      "Europe/Amsterdam": "Ámsterdam, Berlín, Berna, Roma, Estocolmo, Viena",
      "Africa/Algiers": "África Central Occidental",
      "Europe/Bucharest": "Bucarest",
      "Africa/Cairo": "Cairo",
      "Europe/Helsinki": "Helsinki, Kiev, Riga, Sofia, Tallinn, Vilnius",
      "Europe/Athens": "Atenas, Istanbul, Minsk",
      "Asia/Jerusalem": "Jerusalén",
      "Africa/Harare": "Harare, Pretoria",
      "Europe/Moscow": "Moscú, St. Petersburg, Volgograd",
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
      "Asia/Magadan": "Magadan, Islas Solomon, Nueva Caledonia",
      "Pacific/Fiji": "Islas Fiji, Kamchatka, Islas Marshall ",
      "Pacific/Auckland": "Auckland, Wellington",
      "Pacific/Tongatapu": "Nuku'alofa"
    }

    const _t = (s) => {
      if (i18n !== void 0 && i18n[s]) {
        return i18n[s];
      }
      return s;
    };
    const _t_spanish = (s) => {
      if (i18n_spanish !== void 0 && i18n_spanish[s]) {
        return i18n_spanish[s];
      }
      return s;
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

    const selectorOptions_spanish = moment.tz.names()
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

        return memo.concat(`<option value="${tz.name}">(UTC${timezone}) ${_t_spanish(tz.name)}</option>`);
      }, "");

    // document.querySelector("#timezone1").innerHTML = ["<option value=''> --Select-- </option>", selectorOptions].join('');
    // getSyncStorageValue('spanish').then(function(temp) {
      // spanish = temp.spanish;
    if (spanish) {
      document.querySelector("#timezone1").innerHTML = selectorOptions_spanish;
      document.querySelector("#timezone2").innerHTML = selectorOptions_spanish;
    } else {
      document.querySelector("#timezone1").innerHTML = selectorOptions;
      document.querySelector("#timezone2").innerHTML = selectorOptions;
    }
    // });
    

  // <---- Delete history by date ---->
    // Format date time for confirmation window
    function formatPrintDateTime(date,spanish,time=null) {
      if (time === null) {
        if (spanish) {
          formattedDate = moment(date.toISOString().slice(0,10));
          formattedDate.locale('es');
          return formattedDate.format("LL");
        } else return moment(date.toISOString().slice(0,10)).format("LL");
      } else {
        if (spanish) {
          formattedTime = moment(date.toISOString().slice(0,10) + ((time<10) ? " 0"+time+":00" : " "+ time+":00"));
          formattedTime.locale('es');
          return formattedTime.format('LLL');
        } else return moment(date.toISOString().slice(0,10) + ((time<10) ? " 0"+time+":00" : " "+ time+":00")).format("LLL");
      }
    }
    // Get date selected by user
    async function getDateforByDate(values) {
      getSyncStorageValue(['spanish','userID']).then(function(temp){
        var spanish = temp.spanish;
        var date = $("#datepicker1").datepicker("getDate");
        var currID = ""+temp.userID;
        var timezone = $("#timezone1").val();
        // ENSURE USER IS LOGGED IN
        if (currID === 'undefined') {
            if (spanish) updateTips("#validateTips1", login_first_msg_spanish);
            else updateTips("#validateTips1", login_first_msg);
        } 
        else if (date !== null && date instanceof Date && timezone !== '') {
          var formattedDate = formatDateTime(currID, date, timezone, starttime='',endtime='');
          // var abbr = formatPrintDateTime(date,true).zone(timezone).abbr(date.getTime());
          var abbr = moment.tz.zone(timezone).abbr(date.getTime());
          var timezoneSpanish = i18n_spanish[timezone];
          var printDate = spanish ? formatPrintDateTime(date,true) : formatPrintDateTime(date,false)
          // POP A CONFIRMATION WINDOW TO PREVENT USER ERRORS
          if(spanish ? confirm("Estas apunto de borrar todo tu historial en: \n\n\t(" + timezoneSpanish + ")\n\t"+ printDate+ "\n\nHaz click en OK para continuar.") : confirm("You are about to delete all history on:\n\n\t" + printDate+ " " + abbr + "\n\nClick OK to continue.")){
            // console.log(formattedDate[0]);
            chrome.runtime.sendMessage({prefix: formattedDate, message:'delete'});
            $.datepicker._clearDate("#datepicker1");
            dialog1.dialog( "close" );
          }
        } else {  
          if (spanish) updateTips("#validateTips1",valid_date_msg_spanish);
          else updateTips("#validateTips1",valid_date_msg);
        }
      }); 
    }

    // Dialog window config
    dialog1 = $( "#deleteByDateForm" ).dialog({
        autoOpen: false,
        height: 200,
        width: spanish ? 323 : 300,
        modal: true,
        buttons: [
            {text: spanish ? "Eliminar" : "Delete",
             click: getDateforByDate},
            {text: spanish ? "Cancelar" : "Cancel",
            click: function() {
              $.datepicker._clearDate("#datepicker1");
              $(this).dialog( "close" );
          }}
        ]
    });

    // Initialize by Date 
    $("#btDeleteDate").button().removeClass();
    $( "#btDeleteDate" ).button().on("click", function() {
      // getSyncStorageValue('spanish').then(function(temp){
      //   spanish = temp.spanish;
        region = spanish ? "es" : "en"

        if (spanish) $("#validateTips1").text(select_date_msg_spanish);
        else $("#validateTips1").text(select_date_msg);

        dialog1.dialog('open');

        $( "#datepicker1" ).datepicker({
          showOtherMonths: true,
          selectOtherMonths:true,
          minDate: -6, maxDate: 0
        },$.datepicker.regional[ region ]).blur(); 

        $("#timezone1").val("America/New_York");
        $("#timezone1").select2();
      // });
    });

  // <---- Delete history by time range ---->
    // Get date and time frame selected by user
    async function getDateTime(){
      getSyncStorageValue(['spanish','userID']).then(function(temp){
        var spanish = temp.spanish;
        var date = $("#datepicker2").datepicker("getDate");
        var startTime = $("#startTime").val(); 
        var endTime = $("#endTime").val(); 
        var singleTime = $("#singleTime").val();
        var currID = "" + temp.userID;
        var timezone = $("#timezone2").val();
        // ENSURE USER IS LOGGED IN 
        if (currID === 'undefined') {
          if (spanish) updateTips("#validateTips2", login_first_msg_spanish);
          else updateTips("#validateTips2", login_first_msg);
        } 
        else if (date !== null && timezone !== '') {
          // DELETE BY HOUR RANGE
          if (startTime !== '' && endTime !== '' && parseInt(startTime) <= parseInt(endTime)) {
            var formattedTime = formatDateTime(currID, date, timezone, starttime=startTime, endtime=endTime);
            var printST = spanish ? formatPrintDateTime(date, true, startTime) : formatPrintDateTime(date, false, startTime)
            var printET = spanish ? formatPrintDateTime(date, true, endTime) : formatPrintDateTime(date, false, endTime)
            // var abbr = formatPrintDateTime(date,true, startTime).zone(timezone).abbr(date.getTime());
            var abbr = moment.tz.zone(timezone).abbr(date.getTime());
            var timezoneSpanish = i18n_spanish[timezone];
            // POP A CONFIRMATION WINDOW TO PREVENT USER ERRORS
            if(spanish ? confirm("Estas apunto de borrar tu historial de navegación (inclusive):\n\n\t(" + timezoneSpanish + ")\n\tdesde: " + printST + "\n\tto: " + printET + "\n\nHaz click en OK para continuar.") : confirm("You are about to delete history in the following time frame (inclusive):\n\n\tfrom: " + printST + " " + abbr +"\n\tto: " + printET + " " + abbr +"\n\nClick OK to continue.")){
              // console.log(timeRange);
              chrome.runtime.sendMessage({prefix: formattedTime, message:'delete'});
              $.datepicker._clearDate("#datepicker2");
              dialog2.dialog( "close" );
            }
          // DELETE BY SINGLE HOUR
          } else if (singleTime !== '') {
            var timeSingle = formatDateTime(currID, date, timezone, starttime=singleTime, endTime = '');
            var printST = spanish ? formatPrintDateTime(date, true, singleTime) : formatPrintDateTime(date,false, singleTime)
            // var abbr = formatPrintDateTime(date,true, singleTime).zone(timezone).abbr(date.getTime());
            var abbr = moment.tz.zone(timezone).abbr(date.getTime());
            var timezoneSpanish = i18n_spanish[timezone]
            // POP A CONFIRMATION WINDOW TO PREVENT USER ERRORS
            if(spanish ?  confirm("Estas apunto de borrar tu historial de navegación de la siguiente hora: \n\n\t("+ timezoneSpanish +")\n\t" + printST + "\n\nHaz click en OK para continuar.") : confirm("You are about to delete history of the following hour: \n\n\t" + printST + " " + abbr + "\n\nClick OK to continue.")){
              // chrome.runtime.sendMessage({delbyTime : timeSingle, message:'delbyTime'});
              chrome.runtime.sendMessage({prefix: timeSingle, message:'delete'});
              $.datepicker._clearDate("#datepicker2");
              dialog2.dialog( "close" );
            }
          } else {  
            if (spanish) updateTips("#validateTips2",valid_time_msg_spanish);
            else updateTips("#validateTips2",valid_time_msg);
          }
        } else {  
          if (spanish) updateTips("#validateTips2",valid_time_msg_spanish);
          else updateTips("#validateTips2",valid_time_msg);
        }
      });
    }

    // Config by Time initialization
    function launchTime() {
      getSyncStorageValue('spanish').then(function(temp){
        spanish = temp.spanish;
        region = spanish ? "es" : "en"

        $("#timezone2").val("America/New_York");

        if (spanish) $("#validateTips2").text(select_time_msg_spanish);
        else $("#validateTips2").text(select_time_msg);
        $( "#datepicker2" ).datepicker({
              showOtherMonths: true,
              selectOtherMonths: true,
              minDate: -6, maxDate: 0
            },$.datepicker.regional[ region ]).blur(); 
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
      });
    }

    // Dialog window config 
    dialog2 = $( "#deleteByTimeForm" ).dialog({
        autoOpen: false,
        height: 280,
        width: spanish ? 415: 335,
        modal: true,
        buttons: [
          {text: spanish ? "Eliminar" : "Delete",
           click: getDateTime},
           {text: spanish ? "Reiniciar" : "Reset",
           click: function (){
            $.datepicker._clearDate("#datepicker2");
            launchTime();}
           },
          {text: spanish ? "Cancelar" : "Cancel",
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
      // chrome.storage.sync.get("spanish", function(temp){
        // spanish = temp.spanish;
        if (spanish) alert(help_msg_spanish);
        else alert(help_msg);
      // })
      
    }); 

  // <---- Disable extension after three attempts ---->
  // getSyncStorageValue("isDeactivated").then(function(temp) {
    // console.log("what is isDeactivated: ", isDeactivated);
    if (isDeactivated === true) {
      document.getElementById("userID").disabled = true;
      document.getElementById("btSubmit").disabled = true;
      document.getElementById("btAdd").disabled = true;
      document.getElementById("cbPause").disabled = true;
      document.getElementById("btDeleteDate").disabled = true;
      document.getElementById("btDeleteTime").disabled = true;
      document.getElementById("userInput").disabled = true;
    }
  
  // });
  });
});

// LINK BUTTONS TO APPROPRIATE FUNCTIONS ONCE POPUP IS LOADED
document.addEventListener('DOMContentLoaded', (event) => {
  chrome.runtime.getBackgroundPage(function(backgroundPage) {
    document.querySelector('#btSubmit').addEventListener('click', setUserID);
    document.querySelector('#btAdd').addEventListener('click', addElement);
    document.querySelector('#cbPause').addEventListener('change', pauseExtension);
    document.querySelector('#btLg').addEventListener('click',changeLanguage)
    writeContent(false);
  });
});