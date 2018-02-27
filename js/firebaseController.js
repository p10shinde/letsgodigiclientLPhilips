

var db;

  app.fireConfig = {
    apiKey: "AIzaSyD1hVzBvQnJlE68WzKCweQB45jlHHWTQFI",
    authDomain: "for-lgd-schedule-demo.firebaseapp.com",
    databaseURL: "https://for-lgd-schedule-demo.firebaseio.com",
    projectId: "for-lgd-schedule-demo",
    storageBucket: "for-lgd-schedule-demo.appspot.com",
    messagingSenderId: "58895878910"
  };


$(".loadingText").text('Initializing...')
firebase.initializeApp(app.fireConfig);

firebase.firestore().enablePersistence()
  .then(function() {
  $(".loadingText").text('All set');
  })  

function Node(resName, duration) {
  this.resName = resName;
  this.duration = duration;
  this.next = null;
}

var CircularList = function() {
  this._length = 0;
  this.head = null;
  this.pHead = null;
}

CircularList.prototype.add = function(resName, duration){
  var new_node = new Node(resName, duration);
  if(this.head==null)
  {
    new_node.next = new_node;
    this.head = new_node;
  }
  else
  {
    var currentNode = this.head;
    while(currentNode.next!=this.head)
    {
      currentNode = currentNode.next;
    }
    currentNode.next = new_node;
    new_node.next = this.head;
  }
};

CircularList.prototype.deleteList = function(){
  this.head = null;
  this.pHead = null;
};

CircularList.prototype.getNextNode = function(){
  if(this.head==null)
    return {};
  var nextNode = {};
  if(this.pHead==null)
  {
    this.pHead = this.head;
  }
  nextNode['resName'] = this.pHead.resName;
  nextNode['duration'] = this.pHead.duration;
  this.pHead = this.pHead.next;
  return nextNode;
};



var firstll = new CircularList();
var fourthll = new CircularList();

app.checkIfUserIsLoggedIn = function(){
  return app.isuserloggedin;
}


function getFileBasedOnTime(channel,time,callback){
  var format = 'hh:mm_A'
  var time = moment(new Date(time),format),
  
  time = moment(time).format('DD-MM-YYYY_hh:mm_A')
  docRef = firebase.firestore().collection(channel).doc(app.groupName).collection('data').doc(time);

  if(channel == "ticker")
      docRef = firebase.firestore().collection(channel).doc(app.groupName)

  
  docRef.get().then(function(doc) {
      var nextFile = {};
      if (doc.exists) {
          console.log("Got New Planned data for " + channel);
          nextFile = doc.data();
      }else{
        if(channel == "ch1_p")
        {
          nextFile = firstll.getNextNode();
        }
        else if(channel == "ticker")
        {
          nextFile = {startTime : time,text:"WELCOME TO LETSGODIGI"};
        }
      }
      callback(nextFile);
  }).catch(function(error) {
      nextFile = {};
      if(error.message == "Failed to get document because the client is offline."){
          if(channel == "ch1_p")
          {
            nextFile = firstll.getNextNode();
          }
          else if(channel == "ticker")
          {
            nextFile = {startTime : time,text:"WELCOME TO LETSGODIGI"};
          }
          callback(nextFile);
      }
      console.log("Error getting document:", error);
  });
}

function getSOSFromFirebase(time,callback){
  if(!app.checkIfUserIsLoggedIn() && !app.ifLoginRequested){
    app.ifLoginRequested = true;
    app.authorizeUser();
  }
  callbackData = {};
  time = moment(time).format('DD-MM-YYYY_hh:mm_A')
  docRef = firebase.firestore().collection('sos').doc(app.groupName).collection('data').doc(time)

  docRef.get().then(function(doc) {
      if (doc.exists) {
          console.log("Received SOS request...=>");
          callbackData.data = doc.data();
          callbackData.type = "sos"
          callback(callbackData)
      } else {
          callback({})
      }
  }).catch(function(error) {
      if(error.message == "Failed to get document because the client is offline."){
          callback({})
      }
      console.log("Error getting document:", error);
  });
}