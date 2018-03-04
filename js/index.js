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
app.imageElements = [];
app.videoElements = [];
app.imageElements[0] = '<img id="img1" class="imgs" onerror="this.onerror=null;this.src=\'../advt/default.png\';"></img>';
app.imageElements[1] = '<img id="img2" class="imgs" onerror="this.onerror=null;this.src=\'../advt/default.png\';"></img>';
app.imageElements[2] = '<img id="img3" class="imgs" onerror="this.onerror=null;this.src=\'../advt/default.png\';"></img>';

app.videoElements[0] = '<video id="vid1" class="vids" width="100%" height="100%" autoplay loop muted></video>';
app.videoElements[1] = '<video id="vid2" class="vids" width="100%" height="100%" autoplay loop muted></video>';
app.videoElements[2] = '<video id="vid3" class="vids" width="100%" height="100%" autoplay loop muted></video>';
app.resourceFolder = app.groupName;
app.advtFolder = 'advt';



app.firstChannelInterval;
app.firstChannelIntervalTime;

app.fourthChannelInterval;
app.fourthChannelIntervalTime;

app.sosInterval;
app.sosIntervalTime;

app.isuserloggedin = false;
app.campaignName = 'campaign1';
app.campaignDuration = 2;
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

	app.authorizeUser = function(){
	    // firebase.auth().signInWithEmailAndPassword("lgd.beta.slave@gmail.com", "LGDsl@ve").then(function(data){
	      app.isuserloggedin = true;
	    // }).catch(function(err){
	    	// app.ifLoginRequested = false;
	    	// console.log(err)
	    // })
	}


	function loadConfig(callback){
		//  LGD
		configData = {
			"url":"..",
			"firstChannelIntervalTime" : 20,
			"fourthChannelIntervalTime" : 20,
			"sosIntervalTime" : 1,
			"campaignIntervalTime" : 5,
		}
		callback(200,configData)
	}

	loadConfig(function(statusCode, configData){
		if(statusCode == 200){
			URL = configData.url;
			
			app.firstChannelIntervalTime = configData.firstChannelIntervalTime;
			app.fourthChannelIntervalTime = configData.fourthChannelIntervalTime;
			app.sosIntervalTime = configData.sosIntervalTime;
			app.campaignIntervalTime = configData.campaignIntervalTime;
			app.checkCampaignData = function(){
				getCampaign(getCurrentISODateCampaign(),function(campaignData){
					if(!(Object.keys(campaignData).length === 0 && campaignData.constructor === Object)){
						app.campaignName = campaignData.campName;
						app.campaignDuration = campaignData.duration;

					}else{
						app.campaignName = "campaign1";
						app.campaignDuration = 2;						
					}
						$(".campaigns").hide();
						$("#" + app.campaignName).show();
						$(".contentHolders").empty();
						initializeApp();
						checkForVideoAndSOS();

					endTimeFOrCurrentSlot = moment(new Date());
					remainder = app.campaignDuration - endTimeFOrCurrentSlot.minute() % app.campaignDuration;
					nextEndTimeMinute = moment(endTimeFOrCurrentSlot).add(remainder,"minutes").startOf('minute').minute()
					if(nextEndTimeMinute == 0) nextEndTimeMinute = 60; 
					currentTimeMinute = moment(moment(new Date()).startOf('minute').toISOString()).minute();
					if(currentTimeMinute == 0) currentTimeMinute = 60; 
					duration = nextEndTimeMinute - currentTimeMinute;
					app.campaignIntervalTime = duration;

					clearTimeout(app.campaignInterval);
					app.campaignInterval = setTimeout(function(){
						app.checkCampaignData();
					},app.campaignIntervalTime * 60000)
				})
			}
			app.checkCampaignData();
		}else{
			alert('config error');
		}
	});


	function getCurrentISODate(){
		start = moment(new Date());
		remainder = start.minute() % 20;
		return new moment(start).subtract(remainder,'minutes').startOf('minute').toISOString();
	}

	function getCurrentISODateCampaign(){
		start = moment(new Date());
		remainder = start.minute() % 2;
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

		function renderContent(channelData, channelNumber){
		if(!(Object.keys(channelData).length === 0 && channelData.constructor === Object)){
			console.log('channel ' + channelNumber + ' updated')
			if(getResType(channelData.resName) == "image"){
				$("#" + app.campaignName + " .contentHolder" + channelNumber).empty();
				$("#" + app.campaignName + " .contentHolder" + channelNumber).append(app.imageElements[channelNumber - 1]);
				$("#" + app.campaignName + " .contentHolder" + channelNumber + " #img" + channelNumber).attr('src', URL + "/" + app.resourceFolder + "/" + channelData.resName);
				$("#" + app.campaignName + " .contentHolder" + channelNumber + " #vid" + channelNumber).hide();
				$("#" + app.campaignName + " .contentHolder" + channelNumber + " #img" + channelNumber).show();
			}else if(getResType(channelData.resName) == "video"){
				
				$("#" + app.campaignName + " .contentHolder" + channelNumber).empty();
				$("#" + app.campaignName + " .contentHolder" + channelNumber).append(app.videoElements[channelNumber -1]);
				$("#" + app.campaignName + " .contentHolder"+ channelNumber + " #vid" + channelNumber).append('<source src="' + URL + "/" + app.resourceFolder + "/" + channelData.resName + '" type="video/mp4">');
				$("#" + app.campaignName + " .contentHolder" + channelNumber + " #img" + channelNumber).hide();
				$("#" + app.campaignName + " .contentHolder" + channelNumber + " #vid" + channelNumber).show();
			}

			var duration ;
			if(channelData.duration){
				endTimeFOrCurrentSlot = moment(new Date());
				remainder = channelData.duration - endTimeFOrCurrentSlot.minute() % channelData.duration;
				nextEndTimeMinute = moment(endTimeFOrCurrentSlot).add(remainder,"minutes").startOf('minute').minute()
				if(nextEndTimeMinute == 0) nextEndTimeMinute = 60; 
				currentTimeMinute = moment(moment(new Date()).startOf('minute').toISOString()).minute();
				duration = nextEndTimeMinute - currentTimeMinute;
				// app.firstChannelIntervalTime = duration;
			}
			else{
				console.log("Got planned Data for " + "channel" + channelNumber);
				endTimeFOrCurrentSlot = moment(new Date());
				remainder = 20 - endTimeFOrCurrentSlot.minute() % 20;
				nextEndTimeMinute = moment(endTimeFOrCurrentSlot).add(remainder,"minutes").startOf('minute').minute()
				if(nextEndTimeMinute == 0) nextEndTimeMinute = 60; 

				currentTimeMinute = moment(moment(new Date()).startOf('minute').toISOString()).minute();

				duration = nextEndTimeMinute - currentTimeMinute;
				// app.firstChannelIntervalTime = duration;
			}
		}
		if(channelNumber == 1){
			app.firstChannelIntervalTime = duration;
			console.warn("ch1-> "+app.firstChannelIntervalTime)
			app.firstChannelInterval = setTimeout(function(){
				initializeFirstChannel();
			},app.firstChannelIntervalTime * 60000);
			$(".loadingDiv").hide()
		}else if(channelNumber == 2){
			app.secondChannelIntervalTime = duration;
			console.warn("ch2-> "+app.secondChannelIntervalTime)
			app.secondChannelInterval = setTimeout(function(){
				initializeSecondChannel();
			},app.secondChannelIntervalTime * 60000);
		}else if(channelNumber == 3){
			app.thirdChannelIntervalTime = duration;
			console.warn("ch3-> "+app.thirdChannelIntervalTime)
			app.thirdChannelInterval = setTimeout(function(){
				initializeThirdChannel();
			},app.thirdChannelIntervalTime * 60000);
		}

	}

		console.log('Initializing channels.....')
		$(".loadingText").text('Just there...')
		function initializeFirstChannel(){
			getChannelData('ch1_p',getCurrentISODate(),function(firstChannelData){
				clearTimeout(app.firstChannelInterval);
				renderContent(firstChannelData,1)
			});
		}

		function initializeSecondChannel(){
			getChannelData('ch2_p',getCurrentISODate(),function(secondChannelData){
				clearTimeout(app.secondChannelInterval);
				renderContent(secondChannelData,2)
			});
		}

		function initializeThirdChannel(){
			getChannelData('ch3_p',getCurrentISODate(),function(thirdChannelData){
				clearTimeout(app.firstChannelInterval);
				renderContent(thirdChannelData,3)
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

	    firebase.firestore().collection("ch2_g").doc(app.groupName).collection('data')
	      .onSnapshot(function(querySnapshot) {
	        if(!app.checkIfUserIsLoggedIn() && !app.ifLoginRequested){
	        	app.ifLoginRequested = true;
			    app.authorizeUser()
			  }
	       	   	secondll = new CircularList();
    	      	secondllArray = [];
        	  	querySnapshot.forEach(function(doc) {
	              	value = doc.data();
	              	secondllArray.push(value.resName);
		            secondll.add(value.resName, value.duration);
		        });
            console.log("Initializing Channel 2 general...=>" + querySnapshot.size);
	    });
	    
	    firebase.firestore().collection("ch3_g").doc(app.groupName).collection('data')
	      .onSnapshot(function(querySnapshot) {
	        if(!app.checkIfUserIsLoggedIn() && !app.ifLoginRequested){
	        	app.ifLoginRequested = true;
			    app.authorizeUser()
			  }
	       	   	thirdll = new CircularList();
    	      	thirdllArray = [];
        	  	querySnapshot.forEach(function(doc) {
	              	value = doc.data();
	              	thirdllArray.push(value.resName);
		            thirdll.add(value.resName, value.duration);
		        });
            console.log("Initializing Channel 3 general...=>" + querySnapshot.size);
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

      	firebase.firestore().collection("ch2_p").doc(app.groupName).collection('data')
	      .onSnapshot(function(querySnapshot) {
	      	if(!app.checkIfUserIsLoggedIn() && !app.ifLoginRequested){
	      		app.ifLoginRequested = true;
			    app.authorizeUser()
			  }
      		console.log("Initializing Channel 2 planned...=>" + querySnapshot.size);
          	initializeSecondChannel();
      	}); 

      	firebase.firestore().collection("ch3_p").doc(app.groupName).collection('data')
	      .onSnapshot(function(querySnapshot) {
	      	if(!app.checkIfUserIsLoggedIn() && !app.ifLoginRequested){
	      		app.ifLoginRequested = true;
			    app.authorizeUser()
			  }
      		console.log("Initializing Channel 3 planned...=>" + querySnapshot.size);
          	initializeThirdChannel();
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