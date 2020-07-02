var console = chrome.extension.getBackgroundPage().console;

var app = {
	config: {},
	s3: {},
	init: function() {
		// get user ID 
		var $userID = document.getElementById("userID");
		var $btSubmit = document.getElementById("btSubmit")

		// get userid that was set in the background

		chrome.runtime.sendMessage({fn: "getID"}, function(response){
			$userID.value = response;
		});

		chrome.runtime.sendMessage({fn: "getConfig"}, function(response){
			app.config = response;

		});

		// chrome.runtime.sendMessage({fn: "getCredentials"}, function(response){
		// 	app.s3 = response;

		// });

		$btSubmit.addEventListener("click", function() {

			chrome.runtime.sendMessage({fn: "setID", userID: $userID.value});

		});

	}


};

// app start

document.addEventListener("DOMContentLoaded", function() {
	app.init();
});