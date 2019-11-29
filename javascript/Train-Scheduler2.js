//Variables (set empty to being w/)
var trainName = "";
var trainDestination = "";
var trainTime = "";
var trainFrequency = "";
var nextArrival = "";
var minutesAway = "";


// consider adding variable for conductor in future
var Train = $("#train-name");
var TrainDestination = $("#train-destination");
// form validation for Time using jQuery Mask plugin
var TrainTime = $("#train-time").mask("00:00");
var TimeFreq = $("#time-freq").mask("0000");


// Initialize Firebase (copied from website; coordinating ref in HTML file)
var config = {
  apiKey: "AIzaSyD0xWRY-gY7n1zV0d-jPd2HV9eDipb3Bt0",
  authDomain: "fir-train-746c9.firebaseapp.com",
  databaseURL: "https://fir-train-746c9.firebaseio.com",
  projectId: "fir-train-746c9",
  storageBucket: "fir-train-746c9.appspot.com",
  messagingSenderId: "1009506553855"
};
firebase.initializeApp(config);

// Assign ref to Firebase to variable named 'database'
var database = firebase.database();

database.ref("/trains").on("child_added", function(snapshot) {

  //  create local variables to store data from firebase
  var trainDiff = 0;
  var trainRemainder = 0;
  var minutesTillArrival = "";
  var nextTrainTime = "";
  var frequency = snapshot.val().frequency;

  // use Moment JS to determine time difference (from present to first train arrival --- converting UNIX to human readable minutes)
  trainDiff = moment().diff(moment.unix(snapshot.val().time), "minutes");

  // get time remainder (w/ "modulo") using frequency and time difference
  trainRemainder = trainDiff % frequency;

  // subtract remainder frequency
  minutesTillArrival = frequency - trainRemainder;

  // add minutesTillArrival to present, to find next train then convert to military format
  nextTrainTime = moment().add(minutesTillArrival, "m").format("hh:mm A");

  // append to train table in HTML, as new row
  $("#table-data").append(
    "<tr><td>" + snapshot.val().name + "</td>" +
    "<td>" + snapshot.val().destination + "</td>" +
    "<td>" + frequency + "</td>" +
    "<td>" + minutesTillArrival + "</td>" +
    "<td>" + nextTrainTime + "  " + "<a><span class='glyphicon glyphicon-remove icon-hidden' aria-hidden='true'></span></a>" + "</td></tr>"
  );

  $("span").hide();

  // add train to DB (firebase)
  $("#table-data").on("click", "tr span", function() {
    console.log(this);
    var trainRef = database.ref("/trains/");
    console.log(trainRef);
  });
});

// function calls button event; stores values from input form
var storeInputs = function(event) {
  // prevent from reset
  event.preventDefault();

  // get/store input values
  trainName = Train.val().trim();
  trainDestination = TrainDestination.val().trim();
  trainTime = moment(TrainTime.val().trim(), "HH:mm").subtract(1, "years").format("X");
  trainFrequency = TimeFreq.val().trim();

  // add to DB
  database.ref("/trains").push({
    name: trainName,
    destination: trainDestination,
    time: trainTime,
    frequency: trainFrequency,
    nextArrival: nextArrival,
    minutesAway: minutesAway,
    date_added: firebase.database.ServerValue.TIMESTAMP
  });

  //  empty user submission form once submitted (so user can add other trains later)
  Train.val("");
  TrainDestination.val("");
  TrainTime.val("");
  TimeFreq.val("");
};

// Calls storeInputs function when submit button clicked
$("#btn-add").on("click", function(event) {
  // form validation - if empty - alert
  if (Train.val().length === 0 || TrainDestination.val().length === 0 || TrainTime.val().length === 0 || TimeFreq === 0) {
    alert("Please Fill All Required Fields");
  } else {
    // if form is filled out, run function
    storeInputs(event);
  }
});

// Calls storeInputs function if Enter key pressed
$('form').on("keypress", function(event) {
  if (event.which === 13) {
    // form validation - if empty - alert
    if (Train.val().length === 0 || TrainDestination.val().length === 0 || TrainTime.val().length === 0 || TimeFreq === 0) {
      alert("Please fill out all portions of the form");
    } else {
      // if form is filled out, run function
      storeInputs(event);
    }
  }
});
