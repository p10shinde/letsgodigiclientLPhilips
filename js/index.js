window.onerror = function(msg, file, line, col, error) {
	//this will show any error message
	alert(msg);
}; 

//app is not using this deviceID
var app = {};
app.ifLoginRequested = false;
app.deviceid = document.URL.split("?")[1];
app.groupName = document.URL.split("?")[2];	
if(!app.deviceid){ app.deviceid = ""; alert('Could not get deviceid')}
if(!app.groupName){ app.groupName = ""; alert('Could not get groupname')}

// app.deviceid = 'pl_a_tower';
app.imageElements = {};
app.videoElements = {};
app.imageElements.image1 = '<img id="img1" class="imgs" onerror="this.onerror=null;this.src=\'../advt/default.png\';"></img>';

app.videoElements.video1 = '<video id="vid1" class="vids" width="100%" height="100%" autoplay muted loop ></video>';
app.resourceFolder = app.groupName;
app.advtFolder = 'advt';



app.firstChannelInterval;
app.firstChannelIntervalTime;

app.fourthChannelInterval;
app.fourthChannelIntervalTime;

app.sosInterval;
app.sosIntervalTime;

app.isuserloggedin = false;

var URL = "..";

window.onload = function(){

	;(function($) {
	    $.fn.textfill = function(options) {
	        var fontSize = options.maxFontPixels;
	        var ourText = $('span:visible:first', this);
	        var maxHeight = $(this).height();
	        var maxWidth = $(this).width();
	        var textHeight;
	        var textWidth;
	        do {
	            ourText.css('font-size', fontSize + 'vw');
	            textHeight = ourText.height();
	            textWidth = ourText.width();
	            fontSize = fontSize - 0.1;
	        } while ((textHeight > maxHeight || textWidth > maxWidth) && fontSize > 0.1);
	        return this;
	    }
	})(jQuery);

	;(function($) {
	    $.fn.textverticalalign = function(options) {
	        var initialTop = options.initialTop;
	        var ourText = $('span:visible:first', this);
	        var totalHeight = $('body').height()
	        var textTop;
	        do {
	            ourText.css('top', initialTop + 'vw');
	            textTop = ourText.position().top;
	            textBottom = totalHeight - ourText.height() - ourText.position().top;
	            // textHeight = ourText.height();
	            initialTop = initialTop - 0.1;
	        } while ((textBottom <= textTop) && initialTop > 0);
	        return this;
	    }
	})(jQuery);


	function loadConfig(callback){
		//  LGD
		configData = {
			"url":"..",
			"firstChannelIntervalTime" : 20,
			"fourthChannelIntervalTime" : 20,
			"sosIntervalTime" : 1,
		}
		callback(200,configData)
	}

	loadConfig(function(statusCode, configData){
		if(statusCode == 200){
			URL = configData.url;
			
			app.firstChannelIntervalTime = configData.firstChannelIntervalTime;
			app.fourthChannelIntervalTime = configData.fourthChannelIntervalTime;
			app.sosIntervalTime = configData.sosIntervalTime;
				initializeApp();
				checkForVideoAndSOS();
		}else{
			alert('config error');
		}
	});


	function getCurrentISODate(){
		start = moment(new Date());
		remainder = start.minute() % 20;
		return new moment(start).subtract(remainder,'minutes').startOf('minute').toISOString();
	}

	function getResType(resourceName){
		var resourceType = 'image'
		if(resourceName != ""){
			if(resourceName.split('.')[1].toUpperCase() == "JPG" || resourceName.split('.')[1].toUpperCase() == "JPEG" || resourceName.split('.')[1].toUpperCase() == "PNG"){
				resourceType = 'image'
			}else if(resourceName.split('.')[1].toUpperCase() == "MP4"){
				resourceType = 'video'
			}
		}else{
			resourceType = "image";
		}
		return resourceType;
	}


	function checkForVideoAndSOS(){
		// time as 1 mnute for video
		app.checkSOSData = function(){	
			getSOSData(new moment(new Date()).startOf('minute').toISOString(),function(sosData){
				if(!(Object.keys(sosData).length === 0 && sosData.constructor === Object)){
					// hide video and show sos
					$(".sosContent").show();
					$(".contentHolder5").empty();
					$(".contentHolder5").append('<div class="warningText"><span>'+ sosData.data.text +'</span></div>');
					$('.warningText').textfill({ maxFontPixels: 2 });
					$('.warningText').textverticalalign({ initialTop: 27 });
					app.sosIntervalTime = (((30 * 60) - new moment(new Date()).seconds()) * 1000)/60000
				}else{
					$(".videoContentRow").hide();
					$(".sosContent").hide();
					$(".contentHolder6").empty();
					app.sosIntervalTime = ((60 - new moment(new Date()).seconds()) * 1000)/60000
				}
			})
			clearTimeout(app.sosInterval);
			app.sosInterval = setTimeout(function(){
				app.checkSOSData();
			},app.sosIntervalTime * 60000)
		}
		app.checkSOSData();
	}



	function initializeApp(){
		console.log('Initializing channels.....')
		$(".loadingText").text('Just there...')
		function initializeFirstChannel(){
			getChannelData('ch1_p',getCurrentISODate(),function(firstChannelData){
				clearTimeout(app.firstChannelInterval);
				if(!(Object.keys(firstChannelData).length === 0 && firstChannelData.constructor === Object)){
						console.log('channel 1 updated')
						if(getResType(firstChannelData.resName) == "image"){
							$(".contentHolder1").empty();
							$(".contentHolder1").append(app.imageElements.image1);
							$(".contentHolder1 #img1").attr('src', URL + "/" + app.resourceFolder + "/" + firstChannelData.resName);
							$(".contentHolder1 #vid1").hide();
							$(".contentHolder1 #img1").show();
						}else if(getResType(firstChannelData.resName) == "video"){
							console.log($(".contentHolder1"));
							$(".contentHolder1").empty();
							$(".contentHolder1").append(app.videoElements.video1);
							$(".contentHolder1 #vid1").append('<source src="' + URL + "/" + app.resourceFolder + "/" + firstChannelData.resName + '" type="video/mp4">');
							$(".contentHolder1 #img1").hide();
							$(".contentHolder1 #vid1").show();
						}

					if(firstChannelData.duration){
						endTimeFOrCurrentSlot = moment(new Date());
						remainder = firstChannelData.duration - endTimeFOrCurrentSlot.minute() % firstChannelData.duration;
						nextEndTimeMinute = moment(endTimeFOrCurrentSlot).add(remainder,"minutes").startOf('minute').minute()
						if(nextEndTimeMinute == 0) nextEndTimeMinute = 60; 
						currentTimeMinute = moment(moment(new Date()).startOf('minute').toISOString()).minute();
						duration = nextEndTimeMinute - currentTimeMinute;
						app.firstChannelIntervalTime = duration;
					}
					else{
						console.log("Got planned Data for " + "channel1");
						endTimeFOrCurrentSlot = moment(new Date());
						remainder = 20 - endTimeFOrCurrentSlot.minute() % 20;
						nextEndTimeMinute = moment(endTimeFOrCurrentSlot).add(remainder,"minutes").startOf('minute').minute()
						if(nextEndTimeMinute == 0) nextEndTimeMinute = 60; 

						currentTimeMinute = moment(moment(new Date()).startOf('minute').toISOString()).minute();

						duration = nextEndTimeMinute - currentTimeMinute;
						app.firstChannelIntervalTime = duration;
					}
				}

				console.warn("ch1-> "+app.firstChannelIntervalTime)
				app.firstChannelInterval = setTimeout(function(){
					initializeFirstChannel();
				},app.firstChannelIntervalTime * 60000);
				$(".loadingDiv").hide()
			});
		}

		function initializeFourthChannel(){
			getChannelData('ticker',getCurrentISODate(),function(fourthChannelData){
				clearTimeout(app.fourthChannelInterval);
				if(!(Object.keys(fourthChannelData).length === 0 && fourthChannelData.constructor === Object)){
						console.log('channel 4 updated')
							$(".contentHolder4").empty();
							$(".contentHolder4>div.marquee").empty();
							$(".contentHolder4").append('<div class="marquee"></div>');
							$(".contentHolder4>div.marquee").append('<p>' + fourthChannelData.text + '</p>');
							$(".contentHolder4>div.marquee").marquee({duration: 10000});
				}
				console.warn("ch4-> "+app.fourthChannelIntervalTime)
				app.fourthChannelInterval = setTimeout(function(){
					initializeFourthChannel();
				},app.fourthChannelIntervalTime * 60000)
			});
		}

		app.authorizeUser = function(){
		    // firebase.auth().signInWithEmailAndPassword("lgd.beta.slave@gmail.com", "LGDsl@ve").then(function(data){
		      app.isuserloggedin = true;
		    // }).catch(function(err){
		    	// app.ifLoginRequested = false;
		    	// console.log(err)
		    // })
		}
		
		// db.collection("ch1_g").doc(app.deviceid).collection('data')
		firebase.firestore().collection("ch1_g").doc(app.groupName).collection('data')
	      .onSnapshot(function(querySnapshot) {
	        if(!app.checkIfUserIsLoggedIn() && !app.ifLoginRequested){
	        	app.ifLoginRequested = true;
			    app.authorizeUser()
			  }
	       	   	firstll = new CircularList();
    	      	firstllArray = [];
        	  	querySnapshot.forEach(function(doc) {
	              	value = doc.data();
	              	firstllArray.push(value.resName);
		            firstll.add(value.resName, value.duration);
		        });
            console.log("Initializing Channel 1 general...=>" + querySnapshot.size);
	    });

	    firebase.firestore().collection("ch1_p").doc(app.groupName).collection('data')
	      .onSnapshot(function(querySnapshot) {
	      	if(!app.checkIfUserIsLoggedIn() && !app.ifLoginRequested){
	      		app.ifLoginRequested = true;
			    app.authorizeUser()
			  }
      		console.log("Initializing Channel 1 planned...=>" + querySnapshot.size);
          	initializeFirstChannel();
      	});  

	    firebase.firestore().collection("ticker").doc(app.groupName)
	      .onSnapshot(function(querySnapshot) {
	          	if(!app.checkIfUserIsLoggedIn() && !app.ifLoginRequested){
	          		app.ifLoginRequested = true;
		    		app.authorizeUser();
			  	}
          	initializeFourthChannel();
      	});

	    firebase.firestore().collection("sos").doc(app.groupName).collection('data')
	      .onSnapshot(function(querySnapshot) {
	          	if(!app.checkIfUserIsLoggedIn() && !app.ifLoginRequested){
	          		app.ifLoginRequested = true;
			    	app.authorizeUser();
			  	}
      	});  
	}
}