var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use(bodyParser.urlencoded({extended: false})); // parses the text to URL data
app.use(bodyParser.json()); //Parses JSON
app.set('port', process.env.PORT || 3000); //Set the port

//Access Token for Facebook
var PAGE_ACCESS_TOKEN = "EAAJ2aBX63yMBAPmke2JGBlZBFpADDdgVwcdrlDH2nthuxfs3ZAjOHVZAAHUjvadzOC9io7f7siZAzua5Ji8VVPHGqukoegD9gmpdqs3xm6bUZCxIoThXyVeMmZBWu8KIvHtTFtqdcndzmUxCW2YAtsZCOp36ZCLVvhdEZBJqHLpfBDQZDZD";

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

// Server frontpage
app.get('/', function (req, res) {
    res.send('This is the callback URL \n for the facebook web hook.');
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'testbot_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

/**
 * Sends the message to the user
 * @param recipientId
 * @param message
 */
function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},//person who made the post
            message: message,
        }
    }, function(error, response) {
        if (error) {
        }
        else if (response.body.error) {
        }
    });
}

/********* MENU ***********/



/*********************** MESSAGE HANDLER **************************** */

var busNumber;
var stopId;
var recipientId;
var userName;
var all = false;

/**Looks for key words in the users string message and replies with the suitable
 * response depending on what the user has said.
 */
app.post('/webhook', function (req, res)
{
    var events = req.body.entry[0].messaging;

    for (var i = 0; i < events.length; i++)
    {
        var event = events[i];

        if (event.message && event.message.text)
        {
            var string = event.message.text;
            var message;
            recipientId = event.sender.id;

            //Prints uses ID to the console in colour for easy readability
            console.log('\x1b[36m', "Recipient ID: " + event.sender.id, '\x1b[0m');
            console.log('\x1b[36m', "Message: " + string, '\x1b[0m');

            //If user greets the bot
            if (string.match(/(hey)|(hello)|(hi)|(what's up?)/gi)) {
                sendMessage(event.sender.id, {text: getGreeting()});
            }
            //if the user mentions bus times



                    /************************** Basic Responses***************************/

                        //If what the user says matches one of thesese a message is sent back



                        // Basic Greetings

                        else if(string.match(/(hi)|(hey)|(hello)|(what's up?)|(yo)|(sup)|(wassup)/i)){
                            sendMessage(event.sender.id,{text: getGreeting()});
                        }

                        else if (string.match(/(hi, how are you?)|(How are you?)|(How's it going?)|(Hey, hows it going?)/i)){
                            sendMessage(event.sender.id,{text: getResponseGreeting()});
                        }

                        // Basic Lecturers

                        else if (string.match(/(Paul Hayes)/i)){
                            sendMessage(event.sender.id,{text: getPaulHayes()});
                        }
                        else if (string.match(/(Dominic Carr)/i)){
                            sendMessage(event.sender.id,{text: getDominicCarr()});
                        }

                        // Time

                        else if(string.match(/(Time)|(What's the time?)|(What's the time)|(Do you know the time?)|(What's the time)/i))
                        {
                            sendMessage(event.sender.id,{text: getActualTime()});
                        }

                        // Very Simple FAQS ( To be changed )

                        else if (string.match(/(SCR3)/i)){
                            sendMessage(event.sender.id,{text: getRoomStatusSCR3()});

                        }

                        else if (string.match(/(Train Connolly to Skerries)/i)){
                            sendMessage(event.sender.id,{text: getSkerriesTrain()});

                        }

                        else if (string.match(/(BSHC4 Semester 1)/i)) {
                            var url = "http://i.imgur.com/2hcDEoz.jpg";
                            pictureReply(event.sender.id, url)
                        }

                        else if (string.match(/(When does the Library close?)/i)){
                            sendMessage(event.sender.id,{text: getFAQ1()});

                        }

                        else if (string.match(/(Where is the SU?)/i)){
                            sendMessage(event.sender.id,{text: getFAQ2()});

                        }

                        // College Websites Menu

                        else if (string.match(/(moodle)/i) ||string.match(/(student resources)/i) || string.match(/(college websites)/i)) {
                            CollegeWebsites(event.sender.id);


                        }

                        // User thanks chatbot

                       else if (string.match(/(Thanks)/i) || string.match(/(Thank you)/i)) {
                            message = "Anytime!";
                            sendMessage(event.sender.id, {text: message});
                        }

                        // Username of Sender ( Not Working)




                        else if (string.match(/(Who am i)/i)) {
                            message = "Your name is " + userName + " :)";
                            sendMessage(event.sender.id, {text: message});
                        }

                        // All Services offered by chatbot.


                        else if (string.match(/(Quick Help)/i) || string.match(/(What can you do?)/i)) {
                            QuickHelp(event.sender.id);
                        }


                        // End of Basic Responses


              /**************** Train Menu ******************/

                        else if (string.match(/(Train Stations)/i)) {
                           TrainStationMenu(event.sender.id);
                        }

              /**************** Luas ******************/

                        else if (string.match(/(Luas)/i)) {
                            getLuasOptions(event.sender.id);
                        }

              /**************** Train Stations *********************/
                        else if (string.match(/(Connolly)/i)) {
                            getConnollyOptions(event.sender.id);
                        }

                        else if (string.match(/(Tara Street)/i)) {
                            getTaraStreetOptions(event.sender.id);
                        }

                        else if (string.match(/(Pearse)/i)) {
                            getPearseOptions(event.sender.id);
                        }


                        else if (string.match(/(Lower Abbey Street)/i)) {
                            LowerAbbeyStreetQuery(event.sender.id);
                        }

                        else if (string.match(/(Aston Key)/i)) {
                            AstonKeyBusQuery(event.sender.id);
                        }

                        else if (string.match(/(Talbot Street)/i)) {
                            TalbotStreetBusQuery(event.sender.id);
                        }

                        else if (string.match(/(DCU Stop)/i)) {
                            MyBusQuery(event.sender.id);
                        }

                      //Bus Routes

                     else if (string.match(/(33 to City Centre)/i)) {
                          stopId = "7292";
                          busNumber = "33";
                          dublinBus(stopId);
                      }
                      else if (string.match(/(33a to City Centre)/i)) {
                           stopId = "7292";
                           busNumber = "33a";
                           dublinBus(stopId);
                       }

                       // Lower Abbey Street Stops

                       else if (string.match(/(33 to Balbriggan)/i)) {
                            stopId = "292";
                            busNumber = "33";
                            dublinBus(stopId);
                        }

                        else if (string.match(/(41 to Swords Manor)/i)) {
                             stopId = "288";
                             busNumber = "41";
                             dublinBus(stopId);
                         }

                       else if (string.match(/(41b to Rolestown)/i)) {
                            stopId = "288";
                            busNumber = "41b";
                            dublinBus(stopId);
                        }

                      else if (string.match(/(41c to Swords Manor)/i)) {
                           stopId = "288";
                           busNumber = "41c";
                           dublinBus(stopId);
                       }

                       // Rob's Stop

                       else if (string.match(/(79 to Spiddal Park)/i)) {
                            stopId = "326";
                            all = true;
                            dublinBus(stopId);
                        }

                        // Talbot Street Stops

                        else if (string.match(/(42 to Sand's Hotel)/i)) {
                             stopId = "1184";
                             busNumber = "42";
                             dublinBus(stopId);
                         }

                         // My Stop

                         else if (string.match(/(My Stop)/i)) {
                              stopId = "213";
                              all = true;
                              dublinBus(stopId);
                          }






                      // Error Message
                      else {
                          sendMessage(event.sender.id, {text: getConfused()});
                      }
                  }

              }
              res.sendStatus(200);
          });

/********************** Train Station Real Time ************************************/

/**
 * Select Train Station
 */
              function TrainStationMenu(id){
               var TrainStations = {
                  "text":"Where are you getting the train from?",
                  "quick_replies":[
                    {
                      "content_type":"text",
                      "title":"Connolly",
                      "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
                    },
                    {
                      "content_type":"text",
                      "title":"Tara Street",
                      "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
                    },
                    {
                      "content_type":"text",
                      "title":"Pearse",
                      "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
                    }
                  ]
                }
                sendMessage(id, TrainStations);
              }


/**
 * Connolly Menu
 */
function getConnollyOptions(id){

var ConnollyTemplate = {
    "attachment": {
    "type": "template",
    "payload": {
        "template_type": "generic",
        "elements":[
            {
               "title" : "Please Select you route",
               "image_url": "https://i.imgsafe.org/77eb7c9606.jpg",
            }
         ]
        }
     },
    "quick_replies":[

        {
            "content_type":"text",
            "title":"To Dundalk",
            "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
        },
        {
            "content_type":"text",
            "title":"To Bray",
            "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
        },

    ]
  }
  sendMessage(id, ConnollyTemplate);
}

/**
 * Tara Street Menu
 */

function getTaraStreetOptions(id){

var TaraTemplate = {
    "attachment": {
    "type": "template",
    "payload": {
        "template_type": "generic",
        "elements":[
            {
               "title" : "Please Select you route",
               "image_url": "https://i.imgsafe.org/78097909f5.jpg",
            }
         ]
        }
     },
    "quick_replies":[

        {
            "content_type":"text",
            "title":"To Dundalk",
            "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
        },
        {
            "content_type":"text",
            "title":"To Bray",
            "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
        },

    ]
  }
  sendMessage(id, TaraTemplate);
}

/**
 * Pearse Station Menu
 */

function getPearseOptions(id){

var PearseTemplate = {
    "attachment": {
    "type": "template",
    "payload": {
        "template_type": "generic",
        "elements":[
            {
               "title" : "Please Select you route",
               "image_url": "https://i.imgsafe.org/781f37f3ea.jpg",
            }
         ]
        }
     },
    "quick_replies":[

        {
            "content_type":"text",
            "title":"To Dundalk",
            "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
        },
        {
            "content_type":"text",
            "title":"To Bray",
            "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
        },

    ]
  }
  sendMessage(id, PearseTemplate);
}




/**
 * Luas from NCI Menu
 */
function getLuasOptions(id){


var LuasTemplate = {
    "attachment": {
    "type": "template",
    "payload": {
        "template_type": "generic",
        "elements":[
            {
               "title" : "Luas from NCI.",
               "image_url": "https://i.imgsafe.org/75d27db327.jpg",
            }
         ]
        }
     },
    "quick_replies":[

        {
            "content_type":"text",
            "title":"Inbound - Point",
            "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
        },
        {
            "content_type":"text",
            "title":"Outbound - Tallaght",
            "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
        },

    ]
  }
  sendMessage(id, LuasTemplate);
}


/********************** Lover Abbey Street Stops ************************************/

function LowerAbbeyStreetQuery(id){

var LowerAbbeyStreetMenu = {
    "attachment": {
    "type": "template",
    "payload": {
        "template_type": "generic",
        "elements":[
            {
               "title" : "Please select your bus route.",
               "image_url": "https://i.imgsafe.org/8745f7df93.png",
            }
         ]
        }
     },
    "quick_replies":[

        {
            "content_type":"text",
            "title":"33 to Balbriggan",
            "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
        },
        {
            "content_type":"text",
            "title":"41 to Swords Manor",
            "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
        },
        {
            "content_type":"text",
            "title":"41b to Rolestown",
            "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
        },
        {
            "content_type":"text",
            "title":"41c to Swords Manor",
            "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
        }

    ]
  }
  sendMessage(id, LowerAbbeyStreetMenu);
}


/********************** Aston Key Stops ************************************/

function AstonKeyBusQuery(id){

var AstonKeyBusMenu = {
    "attachment": {
    "type": "template",
    "payload": {
        "template_type": "generic",
        "elements":[
            {
               "title" : "Please select your bus route.",
               "image_url": "https://i.imgsafe.org/88ad16ea08.jpg",
            }
         ]
        }
     },
    "quick_replies":[


        {
            "content_type":"text",
            "title":"79 to Spiddal Park",
            "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
        }

    ]
  }
  sendMessage(id, AstonKeyBusMenu);
}

/********************** Talbot Street ************************************/

function TalbotStreetBusQuery(id){

var TalbotStreetBusMenu = {
    "attachment": {
    "type": "template",
    "payload": {
        "template_type": "generic",
        "elements":[
            {
               "title" : "Please select your bus route.",
               "image_url": "https://i.imgsafe.org/8c6454537d.png",
            }
         ]
        }
     },
    "quick_replies":[


        {
            "content_type":"text",
            "title":"42 to Sand's Hotel",
            "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
        },
        {
            "content_type":"text",
            "title":"43 to Swords Business Park",
            "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
        },
        {
            "content_type":"text",
            "title":"53 to Dublin Ferryport",
            "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
        }

    ]
  }
  sendMessage(id, TalbotStreetBusMenu);
}

/********************** My Stop ************************************/

function MyBusQuery(id){

var DCUBusMenu = {
    "attachment": {
    "type": "template",
    "payload": {
        "template_type": "generic",
        "elements":[
            {
               "title" : "Please select your bus route.",
               "image_url": "https://i.imgsafe.org/8caea89df3.png",
            }
         ]
        }
     },
    "quick_replies":[


        {
            "content_type":"text",
            "title":"My Stop",
            "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
        },


    ]
  }
  sendMessage(id, DCUBusMenu);
}


/**** Dublin bus API ******/
function dublinBus(stopId){
    //url is set with the bus stop number passed by the event.message
    var options = {
        url: 'http://data.dublinked.ie/cgi-bin/rtpi/realtimebusinformation?stopid='+stopId+'&format=json',
        method : 'GET'
    };
    //Request is made using the options and callback functions
    request(options, callback);
 }

let message = "";
function callback(error, response, body) {
        body = JSON.parse(body);
        //numberofresults will return as 0 if it past half 11
        if(body.numberofresults === 0){
            message = "Nope";
        }
        else{
            var resultCount = 0;
            //Display all the bus routes and due times available
            for( var i in body.results){
                if(body.results[i].route == busNumber || all == true){
                    //If the bus is due now, dont display "due in due minutes"
                    if(body.results[i].duetime === "Due"){
                        message += body.results[i].route + " to " + body.results[i].destination + " due now\n";
                    }
                    //Stop 1 minute appearing as "1 minutes"
                    else if(body.results[i].duetime === "1"){
                        message += body.results[i].route + " to " + body.results[i].destination + " due in " + body.results[i].duetime
                        + " minute\n";
                    }
                    else{
                        message += body.results[i].route + " to " + body.results[i].destination + " due in " + body.results[i].duetime
                        + " minutes\n";
                    }
                    resultCount++;
                }
            }
            //Check if there is not times available
            if(resultCount === 0){
                message = "There is currently no times available for " + busNumber + "";
            }
        }
        // reset the message variable back to null to prevent double values
        all = false;
        busNumber = "";
        sendMessage(recipientId, {text: message});
        message = "";
}


/*********************** PICTURE RESPONSES **************************** */

/**
 * Retrieves a map from the Google API and returns  it to the
 * send message function
 * @param id
 */

/**
 * Function to send picture messages
 * @param recipientID
 * @param url
 */


/***************************** COLLEGE WEBSITES *************************************** */

/**
 * List of useful ITB websites in a buttons template
 */




/**
 * Return a menu for the user to choose what functionality
 * they can use.
 */
function QuickHelp(id){
    var pickFunctionalityTemplate = {
            "text" : "Here is a list",
            "quick_replies":[

                {
                    "content_type":"text",
                    "title":"College Websites",
                    "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
                }

            ]
        }
    sendMessage(id, pickFunctionalityTemplate);
}

/**
 * return a random greeting when user initiates
 * conversation.
 * @returns {*}
 */

/**************************** BASIC CONVERSATIONAL RESPONSES ********************************** */


 function getGreeting(){
     var rand = Math.floor((Math.random() * 12) + 1);
     switch (rand) {
         case 1 :
             return "What's up?";

         case 2 :
             return "What can I help you with?";

         case 3:
             return "Hello there";

         case 4:
             return "Hey there";

         case 5:
             return "How can I help?";

         case 6:
             return "Hi there";

         case 7:
             return "What can I do for you?";

         case 8:
             return "Ask me something";

         case 9:
             return "Need help?";

         case 10:
             return "Hello, how are you?";

         case 11:
             return "Hi";

         case 12:
             return "Hello";

     }
 }

 function getResponseGreeting(){
    var rand = Math.floor((Math.random() * 17) + 1);
    switch (rand) {
        case 1 :
            return "I'm good, What can I help you with?";

        case 2 :
            return "I'm great, What can I help you with?";

        case 3 :
            return "I'm good :) What can I help you with?";

        case 4 :
            return "I'm great :) What can I help you with?";

        case 5 :
            return "I'm good, How can I help you?";

        case 6:
            return "I'm great, How can I help you?";

        case 7 :
            return "I'm good :) What can I do for you?";

        case 8 :
            return "I'm great, :) What can I do for you?";

        case 9 :
            return "I'm good, Ask me something";

        case 10 :
            return "I'm great, Ask me something";
        case 11 :
            return "I'm great :) Ask me something";

        case 12 :
            return "I'm good :) Ask me something";

        case 13 :
            return "I'm good, Need help?";

        case 14 :
            return "I'm great, Need help?";

        case 15 :
            return "I'm good :) Need help?";

        case 16 :
            return "I'm great :) Need help?";

        case 17 :
            return "Hello, how are you?";



    }
}


function getConfused(){
    var rand = Math.floor((Math.random() * 4) + 1);
    switch (rand) {

        case 1 :
            return "What?";

        case 2 :
            return "Sorry, what?";

        case 3 :
            return "I didn't understand that";

        case 4 :
            return "I didn't quite understand that.";
    }
}

//Lecturers Information


function getPaulHayes(){

            return "\nPaul Hayes\nDepartment: IT\nRole: Lecturer\nRoom: 3.18\nNumber: (01) 4498612\nEmail: Paul.Hayes@ncirl.ie";

}

function getDominicCarr(){

            return "\nDominic Carr\nDepartment: IT\nRole: Lecturer\nRoom: 3.18\nNumber: (01) 4498579\nEmail: Dominic.Carr@ncirl.ie";


}

// FAQ

function getFAQ1(){

            return "The library closes at 9pm regularly and extends to 10pm during exam periods."
}

function getFAQ2(){

            return "The Student Union offices are located in the basement and the adjoining area is the central hub."
}

// Buttons

// Timetables

// Skerries Train

function getSkerriesTrain(){

            return "The next train from Connolly to Skerries departs at 10.35pn"

}

// Room Status

function getRoomStatusSCR3(){

            return "HCC1, Introduction to Programming is sheduled in this room until 12pm"

}

/**
 * College Websites
 */
function CollegeWebsites(id)
{
    var message = {
        "attachment":{
            "type":"template",
            "payload":{
                "template_type":"button",
                "text":"Which site do you need?",
                "buttons":[
                    {
                        "type":"web_url",
                        "url":"https://moodle.ncirl.ie/",
                        "title":"Moodle"
                    },
                    {
                        "type":"web_url",
                        "url":"http://www.outlook.com/student.ncirl.ie",
                        "title":"Student Email"
                    },
                    {
                        "type":"web_url",
                        "url":"https://nci360.ncirl.ie/",
                        "title":"NCI 360"
                    }
                ]
            }
        }
    };
    sendMessage(id, message);
}



/**
 * Function to send picture messages
 * @param recipientID
 * @param url
 */
function pictureReply(recipientID, url)
{
    //JSON message sent as data to the FB API
    var message =
    {
        "attachment": {
            "type": "image",
            "payload": {
                "url": url
            }
        }
    };
    sendMessage(recipientID, message);
}


/**
 * Returns the current time
 * @returns {string}
 */
function getActualTime(){
    return new Date().toLocaleTimeString('IRL', { hour12: false, hour: "numeric", minute: "numeric"});
}

function receivedMessageRead(event) {
  if(isStopped == true)
  {
    return;
  }
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  // All messages before watermark (a timestamp) or sequence have been seen.
  var watermark = event.read.watermark;
  var sequenceNumber = event.read.seq;

  console.log("Received message read event for watermark %d and sequence " +
    "number %d", watermark, sequenceNumber);
}

/*
 * Send an image using the Send API.
 *
 */
function sendImageMessage(recipientId, path) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: path
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a Gif using the Send API.
 *
 */
function sendGifMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: "http://messengerdemo.parseapp.com/img/instagram_logo.gif"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send audio using the Send API.
 *
 */
function sendAudioMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "audio",
        payload: {
          url: "http://messengerdemo.parseapp.com/audio/sample.mp3"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a video using the Send API.
 *
 */
function sendVideoMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "video",
        payload: {
          url: "http://messengerdemo.parseapp.com/video/allofus480.mov"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a video using the Send API.
 *
 */
function sendFileMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "file",
        payload: {
          url: "http://messengerdemo.parseapp.com/files/test.txt"
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendSingleJsonMessage(recipientId,filename) {
   try {
      filename = "./script/" + filename;
      var json  = require(filename);
      var fullMessage = { recipient: { id: recipientId  }};
      fullMessage.message = json;
      callSendAPI(fullMessage);
   }
   catch (e)
   {
      console.log("error in sendSingleJsonMessage " + e.message + " " + filename + " " + fullMessage);
   }
}

/*
   Special handling for message that the sender typed in
*/

function sendEnteredMessage(recipientId,messageText) {
                var emojiString = ["😀","😁","😂","😃","😄","😅","😆","😇","😈","👿","😉","😊","☺️","😋","😌","😍","😎","😏","😐","😑","😒","😓","😔","😕","😖","😗","😘","😙","😚","😛","😜","😝","😞","😟","😠","😡","😢","😣","😤","😥","😦","😧","😨","😩","😪","😫","😬","😭","😮","😯","😰","😱","😲","😳","😴","😵","😶","😷","😸","😹","😺","😻","😼","😽","😾","😿","🙀","👣","👤","👥","👶","👶🏻","👶🏼","👶🏽","👶🏾","👶🏿","👦","👦🏻","👦🏼","👦🏽","👦🏾","👦🏿","👧","👧🏻","👧🏼","👧🏽","👧🏾","👧🏿","👨","👨🏻","👨🏼","👨🏽","👨🏾","👨🏿","👩","👩🏻","👩🏼","👩🏽","👩🏾","👩🏿","👪","👨‍👩‍👧","👨‍👩‍👧‍👦","👨‍👩‍👦‍👦","👨‍👩‍👧‍👧","👩‍👩‍👦","👩‍👩‍👧","👩‍👩‍👧‍👦","👩‍👩‍👦‍👦","👩‍👩‍👧‍👧","👨‍👨‍👦","👨‍👨‍👧","👨‍👨‍👧‍👦","👨‍👨‍👦‍👦","👨‍👨‍👧‍👧","👫","👬","👭","👯","👰","👰🏻","👰🏼","👰🏽","👰🏾","👰🏿","👱","👱🏻","👱🏼","👱🏽","👱🏾","👱🏿","👲","👲🏻","👲🏼","👲🏽","👲🏾","👲🏿","👳","👳🏻","👳🏼","👳🏽","👳🏾","👳🏿","👴","👴🏻","👴🏼","👴🏽","👴🏾","👴🏿","👵","👵🏻","👵🏼","👵🏽","👵🏾","👵🏿","👮","👮🏻","👮🏼","👮🏽","👮🏾","👮🏿","👷","👷🏻","👷🏼","👷🏽","👷🏾","👷🏿","👸","👸🏻","👸🏼","👸🏽","👸🏾","👸🏿","💂","💂🏻","💂🏼","💂🏽","💂🏾","💂🏿","👼","👼🏻","👼🏼","👼🏽","👼🏾","👼🏿","🎅","🎅🏻","🎅🏼","🎅🏽","🎅🏾","🎅🏿","👻","👹","👺","💩","💀","👽","👾","🙇","🙇🏻","🙇🏼","🙇🏽","🙇🏾","🙇🏿","💁","💁🏻","💁🏼","💁🏽","💁🏾","💁🏿","🙅","🙅🏻","🙅🏼","🙅🏽","🙅🏾","🙅🏿","🙆","🙆🏻","🙆🏼","🙆🏽","🙆🏾","🙆🏿","🙋","🙋🏻","🙋🏼","🙋🏽","🙋🏾","🙋🏿","🙎","🙎🏻","🙎🏼","🙎🏽","🙎🏾","🙎🏿","🙍","🙍🏻","🙍🏼","🙍🏽","🙍🏾","🙍🏿","💆","💆🏻","💆🏼","💆🏽","💆🏾","💆🏿","💇","💇🏻","💇🏼","💇🏽","💇🏾","💇🏿","💑","👩‍❤️‍👩","👨‍❤️‍👨","💏","👩‍❤️‍💋‍👩","👨‍❤️‍💋‍👨","🙌","🙌🏻","🙌🏼","🙌🏽","🙌🏾","🙌🏿","👏","👏🏻","👏🏼","👏🏽","👏🏾","👏🏿","👂","👂🏻","👂🏼","👂🏽","👂🏾","👂🏿","👀","👃","👃🏻","👃🏼","👃🏽","👃🏾","👃🏿","👄","💋","👅","💅","💅🏻","💅🏼","💅🏽","💅🏾","💅🏿","👋","👋🏻","👋🏼","👋🏽","👋🏾","👋🏿","👍","👍🏻","👍🏼","👍🏽","👍🏾","👍🏿","👎","👎🏻","👎🏼","👎🏽","👎🏾","👎🏿","☝","☝🏻","☝🏼","☝🏽","☝🏾","☝🏿","👆","👆🏻","👆🏼","👆🏽","👆🏾","👆🏿","👇","👇🏻","👇🏼","👇🏽","👇🏾","👇🏿","👈","👈🏻","👈🏼","👈🏽","👈🏾","👈🏿","👉","👉🏻","👉🏼","👉🏽","👉🏾","👉🏿","👌","👌🏻","👌🏼","👌🏽","👌🏾","👌🏿","✌","✌🏻","✌🏼","✌🏽","✌🏾","✌🏿","👊","👊🏻","👊🏼","👊🏽","👊🏾","👊🏿","✊","✊🏻","✊🏼","✊🏽","✊🏾","✊🏿","✋","✋🏻","✋🏼","✋🏽","✋🏾","✋🏿","💪","💪🏻","💪🏼","💪🏽","💪🏾","💪🏿","👐","👐🏻","👐🏼","👐🏽","👐🏾","👐🏿","🙏","🙏🏻","🙏🏼","🙏🏽","🙏🏾","🙏🏿","🌱","🌲","🌳","🌴","🌵","🌷","🌸","🌹","🌺","🌻","🌼","💐","🌾","🌿","🍀","🍁","🍂","🍃","🍄","🌰","🐀","🐁","🐭","🐹","🐂","🐃","🐄","🐮","🐅","🐆","🐯","🐇","🐰","🐈","🐱","🐎","🐴","🐏","🐑","🐐","🐓","🐔","🐤","🐣","🐥","🐦","🐧","🐘","🐪","🐫","🐗","🐖","🐷","🐽","🐕","🐩","🐶","🐺","🐻","🐨","🐼","🐵","🙈","🙉","🙊","🐒","🐉","🐲","🐊","🐍","🐢","🐸","🐋","🐳","🐬","🐙","🐟","🐠","🐡","🐚","🐌","🐛","🐜","🐝","🐞","🐾","⚡️","🔥","🌙","☀️","⛅️","☁️","💧","💦","☔️","💨","❄️","🌟","⭐️","🌠","🌄","🌅","🌈","🌊","🌋","🌌","🗻","🗾","🌐","🌍","🌎","🌏","🌑","🌒","🌓","🌔","🌕","🌖","🌗","🌘","🌚","🌝","🌛","🌜","🌞","🍅","🍆","🌽","🍠","🍇","🍈","🍉","🍊","🍋","🍌","🍍","🍎","🍏","🍐","🍑","🍒","🍓","🍔","🍕","🍖","🍗","🍘","🍙","🍚","🍛","🍜","🍝","🍞","🍟","🍡","🍢","🍣","🍤","🍥","🍦","🍧","🍨","🍩","🍪","🍫","🍬","🍭","🍮","🍯","🍰","🍱","🍲","🍳","🍴","🍵","☕️","🍶","🍷","🍸","🍹","🍺","🍻","🍼","🎀","🎁","🎂","🎃","🎄","🎋","🎍","🎑","🎆","🎇","🎉","🎊","🎈","💫","✨","💥","🎓","👑","🎎","🎏","🎐","🎌","🏮","💍","❤️","💔","💌","💕","💞","💓","💗","💖","💘","💝","💟","💜","💛","💚","💙","🏃","🏃🏻","🏃🏼","🏃🏽","🏃🏾","🏃🏿","🚶","🚶🏻","🚶🏼","🚶🏽","🚶🏾","🚶🏿","💃","💃🏻","💃🏼","💃🏽","💃🏾","💃🏿","🚣","🚣🏻","🚣🏼","🚣🏽","🚣🏾","🚣🏿","🏊","🏊🏻","🏊🏼","🏊🏽","🏊🏾","🏊🏿","🏄","🏄🏻","🏄🏼","🏄🏽","🏄🏾","🏄🏿","🛀","🛀🏻","🛀🏼","🛀🏽","🛀🏾","🛀🏿","🏂","🎿","⛄️","🚴","🚴🏻","🚴🏼","🚴🏽","🚴🏾","🚴🏿","🚵","🚵🏻","🚵🏼","🚵🏽","🚵🏾","🚵🏿","🏇","🏇🏻","🏇🏼","🏇🏽","🏇🏾","🏇🏿","⛺️","🎣","⚽️","🏀","🏈","⚾️","🎾","🏉","⛳️","🏆","🎽","🏁","🎹","🎸","🎻","🎷","🎺","🎵","🎶","🎼","🎧","🎤","🎭","🎫","🎩","🎪","🎬","🎨","🎯","🎱","🎳","🎰","🎲","🎮","🎴","🃏","🀄️","🎠","🎡","🎢","🚃","🚞","🚂","🚋","🚝","🚄","🚅","🚆","🚇","🚈","🚉","🚊","🚌","🚍","🚎","🚐","🚑","🚒","🚓","🚔","🚨","🚕","🚖","🚗","🚘","🚙","🚚","🚛","🚜","🚲","🚏","⛽️","🚧","🚦","🚥","🚀","🚁","✈️","💺","⚓️","🚢","🚤","⛵️","🚡","🚠","🚟","🛂","🛃","🛄","🛅","💴","💶","💷","💵","🗽","🗿","🌁","🗼","⛲️","🏰","🏯","🌇","🌆","🌃","🌉","🏠","🏡","🏢","🏬","🏭","🏣","🏤","🏥","🏦","🏨","🏩","💒","⛪️","🏪","🏫","🇦🇺","🇦🇹","🇧🇪","🇧🇷","🇨🇦","🇨🇱","🇨🇳","🇨🇴","🇩🇰","🇫🇮","🇫🇷","🇩🇪","🇭🇰","🇮🇳","🇮🇩","🇮🇪","🇮🇱","🇮🇹","🇯🇵","🇰🇷","🇲🇴","🇲🇾","🇲🇽","🇳🇱","🇳🇿","🇳🇴","🇵🇭","🇵🇱","🇵🇹","🇵🇷","🇷🇺","🇸🇦","🇸🇬","🇿🇦","🇪🇸","🇸🇪","🇨🇭","🇹🇷","🇬🇧","🇺🇸","🇦🇪","🇻🇳","⌚️","📱","📲","💻","⏰","⏳","⌛️","📷","📹","🎥","📺","📻","📟","📞","☎️","📠","💽","💾","💿","📀","📼","🔋","🔌","💡","🔦","📡","💳","💸","💰","💎","🌂","👝","👛","👜","💼","🎒","💄","👓","👒","👡","👠","👢","👞","👟","👙","👗","👘","👚","👕","👔","👖","🚪","🚿","🛁","🚽","💈","💉","💊","🔬","🔭","🔮","🔧","🔪","🔩","🔨","💣","🚬","🔫","🔖","📰","🔑","✉️","📩","📨","📧","📥","📤","📦","📯","📮","📪","📫","📬","📭","📄","📃","📑","📈","📉","📊","📅","📆","🔅","🔆","📜","📋","📖","📓","📔","📒","📕","📗","📘","📙","📚","📇","🔗","📎","📌","✂️","📐","📍","📏","🚩","📁","📂","✒️","✏️","📝","🔏","🔐","🔒","🔓","📣","📢","🔈","🔉","🔊","🔇","💤","🔔","🔕","💭","💬","🚸","🔍","🔎","🚫","⛔️","📛","🚷","🚯","🚳","🚱","📵","🔞","🉑","🉐","💮","㊙️","㊗️","🈴","🈵","🈲","🈶","🈚️","🈸","🈺","🈷","🈹","🈳","🈂","🈁","🈯️","💹","❇️","✳️","❎","✅","✴️","📳","📴","🆚","🅰","🅱","🆎","🆑","🅾","🆘","🆔","🅿️","🚾","🆒","🆓","🆕","🆖","🆗","🆙","🏧","♈️","♉️","♊️","♋️","♌️","♍️","♎️","♏️","♐️","♑️","♒️","♓️","🚻","🚹","🚺","🚼","♿️","🚰","🚭","🚮","▶️","◀️","🔼","🔽","⏩","⏪","⏫","⏬","➡️","⬅️","⬆️","⬇️","↗️","↘️","↙️","↖️","↕️","↔️","🔄","↪️","↩️","⤴️","⤵️","🔀","🔁","🔂","#⃣","0⃣","1⃣","2⃣","3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣","🔟","🔢","🔤","🔡","🔠","ℹ️","📶","🎦","🔣","➕","➖","〰","➗","✖️","✔️","🔃","™","©","®","💱","💲","➰","➿","〽️","❗️","❓","❕","❔","‼️","⁉️","❌","⭕️","💯","🔚","🔙","🔛","🔝","🔜","🌀","Ⓜ️","⛎","🔯","🔰","🔱","⚠️","♨️","♻️","💢","💠","♠️","♣️","♥️","♦️","☑️","⚪️","⚫️","🔘","🔴","🔵","🔺","🔻","🔸","🔹","🔶","🔷","▪️","▫️","⬛️","⬜️","◼️","◻️","◾️","◽️","🔲","🔳","🕐","🕑","🕒","🕓","🕔","🕕","🕖","🕗","🕘","🕙","🕚","🕛","🕜","🕝","🕞","🕟","🕠","🕡","🕢","🕣","🕤","🕥","🕦","🕧"]

console.log("sendEnteredMessage "+ messageText);

    if( previousMessageHash[recipientId] === 'send a message') {
         //sendTextMessage(1073962542672604,fistName + " " + lastName + " " + messageText); // send a message to Matthew directly
         sendTextMessage(1073962542672604, messageText); // send a message to Matthew directly
    }
    else if( senderContext[recipientId].state === 'addKeywordStep1') {
         addKeywordStep2(recipientId,messageText);
    }
    else if( senderContext[recipientId].state === 'addKeywordText') {
         addKeywordTextStep2(recipientId,messageText);
    }
    else if( senderContext[recipientId].state === 'addKeywordButton') {
         addKeywordButtonStep2(recipientId,messageText);
    }
    else if (emojiString.indexOf(messageText.substring(0,2)) > -1) {
         var maxLength = emojiString.length;
         var random = Math.floor(Math.random() * maxLength);
         messageText = emojiString[random];
         sendTextMessage(recipientId,messageText);
    }
    else {
         sendCustomMessage(recipientId,messageText);
   }
}

function sendCustomMessage(recipientId,messageText) {

console.log("sendCustoMessage "+ messageText);

    switch (messageText.toLowerCase()) {

      case 'joke':
        sendJoke(recipientId);
        break

      case 'image':
        sendRandomImage(recipientId);
        break

      case 'who':
        sendLocale(recipientId);
        break

      case 'add keyword':
        addKeywordStep1(recipientId);
        break

      case 'list keywords':
        sendKeywordList(recipientId);
        break

      case 'addkeyword_text':
        addKeywordText(recipientId);
        break

      case 'addkeyword_button':
        addKeywordButton(recipientId);
        break

      case 'addkeyword_button1':
        addKeywordButtonStep3(recipientId,1);
        break

      case 'addkeyword_button2':
        addKeywordButtonStep3(recipientId,2);
        break

      case 'addkeyword_button3':
        addKeywordButtonStep3(recipientId,3);
        break


      default:
         sendJsonMessage(recipientId,messageText);

    }
    previousMessageHash[recipientId] = messageText.toLowerCase();
}

function sendJsonMessage(recipientId,keyword) {
console.log("sendJsonMessage " + keyword);
  if (_.has(scriptRules, keyword.toUpperCase())) {
      sendSingleJsonMessage(recipientId,scriptRules[keyword.toUpperCase()]);
  }
  else if (_.has(customRules, keyword.toUpperCase())) {
      sendSingleJsonMessage(recipientId,customRules[keyword.toUpperCase()]);
  }
  else  {
      sendSingleJsonMessage(recipientId,"HOME.json");
  }
}

/*
 * Send a text message using the Send API.
 *
 */
function sendTextMessage(recipientId, messageText) {
  var messageData = {
    "recipient": {
      "id": recipientId
    },
    "message": {
      "text": messageText,
      "metadata": "DEVELOPER_DEFINED_METADATA"
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a Joke with Quick Reply buttons.
 *
 */
function sendJoke(recipientId) {

  var jokeString = "";

  while( jokeString ===  "")
  {
      var random = Math.floor(Math.random() * jokes.length);
      if(jokes[random].joke.length < 320)   // better be a least one good joke :)
          jokeString = jokes[random].joke;
  }

  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: jokeString,
      quick_replies: [
        {
          "content_type":"text",
          "title":"Another 😂",
          "payload":"joke"
        },
        {
          "content_type":"text",
          "title":"Home",
          "payload":"home"
        }
      ]
    }
  };

  callSendAPI(messageData);
}

/*
 * Send the user information back, the bot grabs this for every message
 *
 */
function sendLocale(recipientId) {

  var nameString = firstName + " " + lastName;

  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: nameString,
      quick_replies: [
        {
          "content_type":"text",
          "title":"Home",
          "payload":"home"
        }
      ]
    }
  };

  callSendAPI(messageData);
}

/*
 * Simple example of an external http call with parsing.
 *
 */
function sendRandomImage(recipientId) {
    var http = require('http');
    var options = {
	    host: 'photo.net',
	    path: '/photodb/random-photo'
       };


    var req = http.get(options,function(res) {
      //console.log('STATUS: ' + res.statusCode);
      //console.log('HEADERS: ' + JSON.stringify(res.headers));

      // Buffer the body entirely for processing as a whole.
      var bodyChunks = [];
      res.on('data', function(chunk) {
        // You can process streamed parts here...
        bodyChunks.push(chunk);
      }).on('end', function() {
        var body = Buffer.concat(bodyChunks);
        // Parse html and look for image url
        var bodyString = body.toString('utf8');

        var index = bodyString.indexOf('src="http://gallery.photo.net/photo/');
        //console.log(bodyString);
        if(index > -1)
        {
           var startIndex = index+5;
           //console.log(startIndex);
           // look for the following quote that closes the src= tag

           var endIndex =   startIndex + bodyString.substring(startIndex).indexOf('"');
           if(endIndex > startIndex)
           {
               var url =  bodyString.substring(startIndex,endIndex);
               //console.log(url);
               sendImageMessage(recipientId,url);
           }
        }
      })
    });
    req.on('error', function(e) {
      console.log('ERROR: ' + e.message);
    });
}

/*
 * Send a button message using the Send API.
 *
 */
function sendButtonMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "This is test text",
          buttons:[{
            type: "web_url",
            url: "https://www.oculus.com/en-us/rift/",
            title: "Open Web URL"
          }, {
            type: "postback",
            title: "Trigger Postback",
            payload: "DEVELOPED_DEFINED_PAYLOAD"
          }, {
            type: "phone_number",
            title: "Call Phone Number",
            payload: "+16505551234"
          }]
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a Structured Message (Generic Message type) using the Send API.
 *
 */
function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message:
    {
      "attachment": {
        "type": "template",
        "payload": {
         "template_type": "generic",
          "elements": [
          {
            "title": "Bots",
            "subtitle": "The rise of the Facebook Bot!",
            "item_url": "http://www.dynamic-memory.com/",
            "image_url": "https://raw.githubusercontent.com/matthewericfisher/fb-robot/master/img/robot.png",
            "buttons": [
            {
              "type": "postback",
              "title": "What is this Bot?",
              "payload": "What is this Robot?"
            },
            {
              "type": "postback",
              "title": "Your Business Bot",
              "payload": "business"
            },
            {
              "type": "postback",
              "title": "I want a Bot!",
              "payload": "I want one"
            }
            ]
          },
          {
            "title": "DMS Software",
            "subtitle": "Software Engineering is awesome",
            "item_url": "http://www.dynamic-memory.com/",
            "image_url": "https://raw.githubusercontent.com/matthewericfisher/fb-robot/master/img/evolution.png",
            "buttons": [
            {
              "type": "postback",
              "title": "Contact",
              "payload": "Contact"
            },
            {
              "type": "postback",
              "title": "Social media",
              "payload": "Social media"
            },
            {
              "type": "postback",
              "title": "Matthew's bio",
              "payload": "bio"
            }
            ]
          },
          {
            "title": "Custom Examples",
            "subtitle": "A few small apps to give an idea of the possibilites",
            "item_url": "https://dynamic-memory.com",
            "image_url": "https://raw.githubusercontent.com/matthewericfisher/fb-robot/master/img/danger-man-at-work-hi.png",
            "buttons": [
            {
              "type": "postback",
              "title": "Tell me a joke 😜",
              "payload": "joke"
            },
            {
              "type": "postback",
              "title": "Random Image",
              "payload": "image"
            },
            {
              "type": "postback",
              "title": "Who am I?",
              "payload": "who"
            }
            ]
          },
          {
            "title": "Bot Examples",
            "subtitle": "Some great bots",
            "item_url": "https://developers.facebook.com/products/messenger/",
            "image_url": "https://raw.githubusercontent.com/matthewericfisher/fb-robot/master/img/example.jpeg",
            "buttons": [
            {
              "type": "web_url",
              "url": "https://www.messenger.com/t/HealthTap",
              "title": "Health Tap"
            },
            {
              "type": "web_url",
              "url": "http://www.messenger.com/t/EstherBot",
              "title": "Esther's cool bot"
            },
            {
              "type": "web_url",
              "url": "http://www.messenger.com/t/techcrunch",
              "title": "TechCrunch news bot"
            }
            ]
          }
          ]
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a receipt message using the Send API.
 *
 */
function sendReceiptMessage(recipientId) {
  // Generate a random receipt ID as the API requires a unique ID
  var receiptId = "order" + Math.floor(Math.random()*1000);

  var messageData = {
    recipient: {
      id: recipientId
    },
    message:{
      attachment: {
        type: "template",
        payload: {
          template_type: "receipt",
          recipient_name: "Peter Chang",
          order_number: receiptId,
          currency: "USD",
          payment_method: "Visa 1234",
          timestamp: "1428444852",
          elements: [{
            title: "Oculus Rift",
            subtitle: "Includes: headset, sensor, remote",
            quantity: 1,
            price: 599.00,
            currency: "USD",
            image_url: "http://messengerdemo.parseapp.com/img/riftsq.png"
          }, {
            title: "Samsung Gear VR",
            subtitle: "Frost White",
            quantity: 1,
            price: 99.99,
            currency: "USD",
            image_url: "http://messengerdemo.parseapp.com/img/gearvrsq.png"
          }],
          address: {
            street_1: "1 Hacker Way",
            street_2: "",
            city: "Menlo Park",
            postal_code: "94025",
            state: "CA",
            country: "US"
          },
          summary: {
            subtotal: 698.99,
            shipping_cost: 20.00,
            total_tax: 57.67,
            total_cost: 626.66
          },
          adjustments: [{
            name: "New Customer Discount",
            amount: -50
          }, {
            name: "$100 Off Coupon",
            amount: -100
          }]
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a message with Quick Reply buttons.
 *
 */
function sendQuickReply(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "Some regular buttons and a location test",
      metadata: "DEVELOPER_DEFINED_METADATA",
      quick_replies: [
        {
          "content_type":"text",
          "title":"Action",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_ACTION"
        },
        {
          "content_type":"text",
          "title":"Something else",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_SOMETHING"
        },
        {
          "content_type":"location",
          "title":"Send Location",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_LOCATION"
        }
      ]
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a read receipt to indicate the message has been read
 *
 */
function sendReadReceipt(recipientId) {
  console.log("Sending a read receipt to mark message as seen");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "mark_seen"
  };

  callSendAPI(messageData);
}

/*
 * Turn typing indicator on
 *
 */
function sendTypingOn(recipientId) {
  console.log("Turning typing indicator on");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };

  callSendAPI(messageData);
}

/*
 * Turn typing indicator off
 *
 */
function sendTypingOff(recipientId) {
  console.log("Turning typing indicator off");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_off"
  };

  callSendAPI(messageData);
}


/*
 * Call the Send API. The message data goes in the body. If successful, we'll
 * get the message id in a response
 *
 */
function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      if (messageId) {
        console.log("Successfully sent message with id %s to recipient %s",
          messageId, recipientId);
      } else {
      console.log("Successfully called Send API for recipient %s",
        recipientId);
      }
    } else {
      console.error("Unable to send message. :" + response.error);
    }
  });
}

/*
 * Call the Get Locale API. The message data goes in the body. If successful, we'll
 * get the message id in a response
 *
 */
function callGetLocaleAPI(event, handleReceived) {
    var userID = event.sender.id;
    var http = require('https');
    var path = '/v2.6/' + userID +'?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=' + PAGE_ACCESS_TOKEN;
    var options = {
      host: 'graph.facebook.com',
      path: path
    };

    if(senderContext[userID])
    {
       firstName = senderContext[userID].firstName;
       lastName = senderContext[userID].lastName;
       console.log("found " + JSON.stringify(senderContext[userID]));
       if(!firstName)
          firstName = "undefined";
       if(!lastName)
          lastName = "undefined";
       handleReceived(event);
       return;
    }

    var req = http.get(options, function(res) {
      //console.log('STATUS: ' + res.statusCode);
      //console.log('HEADERS: ' + JSON.stringify(res.headers));

      // Buffer the body entirely for processing as a whole.
      var bodyChunks = [];
      res.on('data', function(chunk) {
        // You can process streamed parts here...
        bodyChunks.push(chunk);
      }).on('end', function() {
        var body = Buffer.concat(bodyChunks);
        var bodyObject = JSON.parse(body);
        firstName = bodyObject.first_name;
        lastName = bodyObject.last_name;
        if(!firstName)
          firstName = "undefined";
        if(!lastName)
          lastName = "undefined";
        senderContext[userID] = {};
        senderContext[userID].firstName = firstName;
        senderContext[userID].lastName = lastName;
        console.log("defined " + JSON.stringify(senderContext));
        handleReceived(event);
      })
    });
    req.on('error', function(e) {
      console.log('ERROR: ' + e.message);
    });
}


function addPersistentMenu(){
 request({
    url: 'https://graph.facebook.com/v2.6/me/thread_settings',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json:{
        setting_type : "call_to_actions",
        thread_state : "existing_thread",
        call_to_actions:[
            {
              type:"postback",
              title:"Home",
              payload:"home"
            },
            {
              type:"postback",
              title:"Joke",
              payload:"joke"
            },
            {
              type:"web_url",
              title:"DMS Software Website",
              url:"http://www.dynamic-memory.com/"
            }
          ]
    }

}, function(error, response, body) {
    console.log(response)
    if (error) {
        console.log('Error sending messages: ', error)
    } else if (response.body.error) {
        console.log('Error: ', response.body.error)
    }
})

}

function removePersistentMenu(){
 request({
    url: 'https://graph.facebook.com/v2.6/me/thread_settings',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json:{
        setting_type : "call_to_actions",
        thread_state : "existing_thread",
        call_to_actions:[ ]
    }

}, function(error, response, body) {
    console.log(response)
    if (error) {
        console.log('Error sending messages: ', error)
    } else if (response.body.error) {
        console.log('Error: ', response.body.error)
    }
})
}

function addKeywordStep1(recipientId)
{
   sendTextMessage(recipientId,"The keyword will drive the actions by the Bot.  The user can type in the keyword or it can be triggered by a link.  The keyword can contain letters, numbers and spaces. Please type in the keyword:");
   senderContext[recipientId].state = "addKeywordStep1";
}

function addKeywordStep2(recipientId, messageText)
{
   senderContext[recipientId].keyword = messageText;
   senderContext[recipientId].state = "addKeywordStep2";
   sendJsonMessage(recipientId,"addKeywordStep2");
}

function stateMachineError(recipientId)
{
   sendTextMessage(recipientId,"Sorry the Bot is confused.  We will have to start again.");
   senderContext[recipientId].state = "";
   senderContext[recipientId].keyword = "";
}

function addKeywordText(recipientId)
{
   console.log("addKeywordText " + JSON.stringify(senderContext));

   if( senderContext[recipientId].state === "addKeywordStep2")
   {
       sendTextMessage(recipientId,"Please type in the text to be sent to the user when this keyword is used.");
       senderContext[recipientId].state = "addKeywordText";
   }
   else
   {
       stateMachineError(recipientId);
   }
}

function addKeywordTextStep2(recipientId,messageText)
{
   if( senderContext[recipientId].state === "addKeywordText")
   {
      var filename = senderContext[recipientId].keyword.toUpperCase()+ ".json";
      var contents = '{"text": "' + messageText + '" }';
      console.log("contents: "+contents);
      fs.writeFile("script/"+filename, contents, function(err) {
           if(err) {
               return console.log(err);
           }
           console.log("The file was saved!");
           senderContext[recipientId].state = "";
           customRules[senderContext[recipientId].keyword.toUpperCase()] = senderContext[recipientId].keyword.toUpperCase();
           sendTextMessage(recipientId,"The keyword has been added.  Please type in the keyword to see the response.");

/*
fs.readFile(filename, function read(err, data) {
    if (err) {
        throw err;
    }
    // Invoke the next step here however you like
    console.log("file contains: " + data);
});
*/
        }
     );
   }
   else
   {
       stateMachineError(recipientId);
   }
}

function addKeywordButton(recipientId)
{
   console.log("addKeywordButton " + JSON.stringify(senderContext));

   if( senderContext[recipientId].state === "addKeywordStep2")
   {
       sendTextMessage(recipientId,"Please type in the title for the button.");
       senderContext[recipientId].state = "addKeywordButton";
   }
   else
   {
       stateMachineError(recipientId);
   }
}

function addKeywordButtonStep2(recipientId, messageText)
{
   if( senderContext[recipientId].state === "addKeywordButton")
   {
       senderContext[recipientId].state = "addKeywordButtonStep2";
       sendSingleJsonMessage(recipientId,"ADDKEYWORD_BUTTONSTEP2.json");
   }
   else
   {
       stateMachineError(recipientId);
   }
}

function addKeywordButtonStep2(recipientId, buttonCount)
{
   if( senderContext[recipientId].state === "addKeywordButtonStep2")
   {
       senderContext[recipientId].state = "addKeywordButtonStep3";
       senderContext[recipientId].buttonCount = buttonCount;
       sendSingleJsonMessage(recipientId,"ADDKEYWORD_BUTTONSTEP3.json");
   }
   else
   {
       stateMachineError(recipientId);
   }
}

function sendKeywordList(recipientId)
{
//  if (customRules.length > 0)
  if (1)
  {
      var keys = Object.keys(customRules);

      for (var p in keys)
      {
         if (keys.hasOwnProperty(p))
         {
            sendTextMessage(recipientId,keys[p]);
         }
      }
  }
  else
  {
    sendTextMessage(recipientId,"No custom keywords defined yet");
  }
  return;
}


// Start server
// Webhooks must be available via SSL with a certificate signed by a valid
// certificate authority.
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = app;
