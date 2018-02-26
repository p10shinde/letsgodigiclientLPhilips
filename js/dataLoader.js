window.onerror = function(err){
	alert(err)
}
function getSOSData(time,callback){
	getSOSFromFirebase(time,function(data){
		callback(data);
	})
}

function getChannelData(channel,currentTime,callback){
	getFileBasedOnTime(channel,currentTime,function(data){
		callback(data);
	})
}