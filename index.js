/* jshint node: true, devel: true */
'use strict';

var customRules = {};
const
  bodyParser = require('body-parser'),
  crypto = require('crypto'),
  express = require('express'),
  https = require('https'),
  request = require('request');


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

/*********************** TRAIN REAL TIME **************************** */


// Comment


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

                        else if (string.match(/(Westmoreland Street)/i)) {
                            WestmorelandStreetQuery(event.sender.id);
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

                       // Westmoreland Street Stops



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
               "title" : "Please select your bus route. Yo",
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


/********************** Westmoreland Street ************************************/

function WestmorelandStreetQuery(id){

var WestmorelandStreetBusMenu = {
    "attachment": {
    "type": "template",
    "payload": {
        "template_type": "generic",
        "elements":[
            {
               "title" : "Please select your bus route.",
               "image_url": "https://i.imgsafe.org/0bb6780381.png",
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
  sendMessage(id, WestmorelandStreetBusMenu);
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
            message = "Nope.";
        }
        else{
            var resultCount = 0;
            //Display all the bus routes and due times available
            for( var i in body.results){
                if(body.results[i].route == busNumber || all == true){
                    //If the bus is due now, dont display "due in due minutes"
                    if(body.results[i].duetime === "Due"){
                        message += "◾" + body.results[i].route + " to " + body.results[i].destination + " is due now.\n" + " \n" ;
                    }
                    //Stop 1 minute appearing as "1 minutes"
                    else if(body.results[i].duetime === "1"){
                        message += "◾ " + body.results[i].route + " to " + body.results[i].destination + "bis due in " + body.results[i].duetime
                        + " minute.\n" +  " \n";
                    }
                    else{
                        message += "◾ " + body.results[i].route + " to " + body.results[i].destination + " is due in " + body.results[i].duetime
                        + " minutes.\n" + " \n" ;
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
