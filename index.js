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

            //Prints uses ID to the cnsole in colour for easy readability
            console.log('\x1b[36m', "Recipient ID: " + event.sender.id, '\x1b[0m');
            console.log('\x1b[36m', "Message: " + string, '\x1b[0m');

            //If user greets the bot
            if (string.match(/(hey)|(hello)|(hi)|(what's up?)/gi)) {
                sendMessage(event.sender.id, {text: getGreeting()});
            }
            //if the user mentions bus times



            else if (string.match(/(The centre to ITB)/i)) {
                var destination = "ITB";
               getBusTimes(event.sender.id, destination);
            }

            else if (string.match(/(ITB to the centre)/i)) {
                var destination = "centre";
                getBusTimes(event.sender.id, destination);
            }




                        //If user inputs any of these words than he gets one of the respones in the method
                        else if(string.match(/(hi)|(hey)|(hello)|(what's up?)|(yo)|(sup)|(wassup)/i)){
                            sendMessage(event.sender.id,{text: getGreeting()});
                        }

                        else if (string.match(/(hi, how are you?)|(How are you?)|(How's it going?)|(Hey, hows it going?)/i)){
                            sendMessage(event.sender.id,{text: getResponseGreeting()});
                        }


                        else if (string.match(/(Paul Hayes)/i)){
                            sendMessage(event.sender.id,{text: getPaulHayes()});
                        }
                        else if (string.match(/(Dominic Carr)/i)){
                            sendMessage(event.sender.id,{text: getDominicCarr()});
                        }


                        else if(string.match(/(Time)|(What's the time?)|(What's the time)|(Do you know the time?)|(What's the time)/i))
                        {
                            sendMessage(event.sender.id,{text: getActualTime()});
                        }

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

                        else if (string.match(/(moodle)/i) || string.match(/(eportal)/i)
                || string.match(/(student resources)/i) || string.match(/(college websites)/i)) {
                listMoodle(event.sender.id);


            }



             else if (string.match(/(Thanks)/i) || string.match(/(Thank you)/i)) {
                message = "No prob";
                sendMessage(event.sender.id, {text: message});
            }

            else if (string.match(/(time)/i)) {
                sendMessage(event.sender.id, {text: getActualTime()});
            }


            else if (string.match(/(Who am i)/i)) {
                message = "Your name is " + userName + " :)";
                sendMessage(event.sender.id, {text: message});
            }

            else if (string.match(/(help me)/i) || string.match(/(What can you do?)/i)) {
                getHelpChoices(event.sender.id);
            }





            /********* Dublin bus responses *************/
            else if (string.match(/(Dublin bus)/i)) {
               busLocationChoices(event.sender.id);
            }
            else if (string.match(/(Corduff)/i)) {
                getCorduffBusses(event.sender.id);
            }
            else if (string.match(/(Blanch Centre)/i)) {
                getBlanchBusStops(event.sender.id);
            }
            else if (string.match(/(📍Retail Park Side)/i)) {
                getRetailParkBusses(event.sender.id);
            }
            else if (string.match(/(📍Centre Side)/i)) {
                getCentreSideBusses(event.sender.id);
            }
            else if (string.match(/(25a)/i)) {
                stopId = "4619";
                all = true;
                dublinBus(stopId);
            }
            // All routes use Emojis to distinguish which stop it is and not
            // to give values from other stops
            //retail park all routes
            else if (string.match(/(All Routes🚏)/i)) {
                stopId = "4747";
                all = true;
                dublinBus(stopId);
            }
            //corduff all routes
            else if (string.match(/(All Routes🚌)/i)) {
                stopId = "1835";
                all = true;
                dublinBus(stopId);
            }
            //CORDUFF BUS ROUTES
           else if (string.match(/(33 to City Centre)/i)) {
                stopId = "7292";
                all = true;
                dublinBus(stopId);
            }
           else if (string.match(/(238 to Ladys Well)/i)) {
                stopId = "1835"
                busNumber = "238";
                dublinBus(stopId)
            }
           else if (string.match(/(38 to Burlington)/i)) {
                stopId = "1835"
                busNumber = "38";
                dublinBus(stopId)
            }
           else if (string.match(/(38a to Burlington)/i)) {
                stopId = "1835"
                busNumber = "38A";
                dublinBus(stopId)
            }
            //BLANCH CENTRE BUS ROUTES _ RETAIL SIDE
            else if (string.match(/(39A to UCD)/i)) {
                stopId = "4747"
                busNumber = "39A";
                dublinBus(stopId)
            }
           else if (string.match(/(17A to Kilbarrack)/i)) {
                stopId = "4747"
                busNumber = "17A";
                dublinBus(stopId)
            }
           else if (string.match(/(220 to Ballymun)/i)) {
                stopId = "4747"
                busNumber = "220";
                dublinBus(stopId)
            }
           else if (string.match(/(239 to Tyrellstown)/i)) {
                stopId = "4747"
                busNumber = "239";
                dublinBus(stopId)
           }
           else if (string.match(/(238 to Tyrellstown)/i)) {
                stopId = "4747"
                busNumber = "238";
                dublinBus(stopId)
           }
           else if (string.match(/(37 to Wilton Terrace)/i)) {
                stopId = "4747"
                busNumber = "37";
                dublinBus(stopId)
           }
           else if (string.match(/(39 to Burrlington Rd)/i)) {
                stopId = "4747"
                busNumber = "39";
                dublinBus(stopId)
           }
           else if (string.match(/(76A to Tallaght)/i)) {
                stopId = "4747"
                busNumber = "76A";
                dubl21inBus(stopId)
           }

           //BLANCH CENTRE BUS ROUTES - CENTRE SIDE
            else if (string.match(/(39A to Ongar)/i)) {
                stopId = "7025"
                busNumber = "39A";
                dublinBus(stopId)
            }
           else if (string.match(/(39 to Ongar)/i)) {
                stopId = "7025"
                busNumber = "39";
                dublinBus(stopId)
            }
           else if (string.match(/(220 to Lady's Well)/i)) { //Apostrophy for blanch
                stopId = "7026"
                busNumber = "220";
                dublinBus(stopId)
            }
           else if (string.match(/(238 to Lady's Well)/i)) {
                stopId = "7026"
                busNumber = "238";
                dublinBus(stopId)
           }
           else if (string.match(/(239 to Liffey Valley)/i)) {
                stopId = "7026"
                busNumber = "239";
                dublinBus(stopId)
           }
           else if (string.match(/(270 to Dunboyne)/i)) {
                stopId = "7026"
                busNumber = "270";
                dublinBus(stopId)
           }
            else if (string.match(/(236 to Damastown)/i)) {
                stopId = "7026"
                busNumber = "270";
                dublinBus(stopId)
           }
            //If the user entered in something it doesn't know or random letters
            else {
                sendMessage(event.sender.id, {text: errorMessage()});
            }
        }

    }
    res.sendStatus(200);
});

/********************** DUBLIN BUS ************************************/

/**
 * DUBLIN BUS - Location chooser
 */
function busLocationChoices(id){
 var pickLocations = {
    "text":"Where do you want to get the bus from? 🤔",
    "quick_replies":[
      {
        "content_type":"text",
        "title":"Corduff",
        "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
      },
      {
        "content_type":"text",
        "title":"Blanch Centre",
        "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
      }
    ]
  }
  sendMessage(id, pickLocations);
}

/**
 * Template given with picture of bus top with buttons
 * Choose busses from corduff bus stop
 */
function getCorduffBusses(id){

var pickBusTemplate = {
    "attachment": {
    "type": "template",
    "payload": {
        "template_type": "generic",
        "elements":[
            {
               "title" : "Which bus do you want? 🤔",
               "image_url": "https://s23.postimg.org/obt3h5hwr/corduff_bus_image.jpg",
            }
         ]
        }
     },
    "quick_replies":[
        {
            "content_type":"text",
            "title":"All Routes🚌",
            "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
        },
        {
            "content_type":"text",
            "title":"33 to City Centre",
            "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
        },
        {
            "content_type":"text",
            "title":"238 to Ladys Well",
            "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
        },
        {
            "content_type":"text",
            "title":"38 to Burlington",
            "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
        },
        {
            "content_type":"text",
            "title":"38a to Burlington",
            "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
        }
    ]
  }
  sendMessage(id, pickBusTemplate);
}

/**
 * To shorten the list, the bus stops are broken up into 2 groups:
 * the retail bus stop and the centre side bus stop.
 */
function getBlanchBusStops(id){
 var pickBlanchBusStops = {
    "attachment": {
    "type": "template",
    "payload": {
        "template_type": "generic",
        "elements":[
            {
               "title" : "Which bus stop do you want? 🤔",
               "image_url": "https://farm6.staticflickr.com/5708/22400688731_6d0862b4bd_c.jpg",
            }
         ]
        }
     },
    "quick_replies":[
        {
            "content_type":"text",
            "title":"📍Retail Park Side",
            "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
        },
        {
            "content_type":"text",
            "title":"📍Centre Side",
            "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
        }
        ]
    }
  sendMessage(id, pickBlanchBusStops);
}

/**
 * If a user pick the retail side bus stops
 */
function getRetailParkBusses(id){
    var pickRetialParkBusses = {
    "text":"Which bus do you want? 🤔",
    "quick_replies":[
      {
        "content_type":"text",
        "title":"All Routes🚏",
        "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
      },
      {
        "content_type":"text",
        "title":"39A to UCD",
        "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
      },
      {
        "content_type":"text",
        "title":"17A to Kilbarrack",
        "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
      },
      {
        "content_type":"text",
        "title":"220 to Ballymun",
        "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
      },
      {
        "content_type":"text",
        "title":"238 to Tyrellstown",
        "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
      },
      {
        "content_type":"text",
        "title":"37 to Wilton Terrace",
        "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
      },
      {
        "content_type":"text",
        "title":"39 to Burrlington Rd",
        "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
      },
      {
        "content_type":"text",
        "title":"76A to Tallaght",
        "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
      }
    ]
  }
  sendMessage(id, pickRetialParkBusses);
}

/**
 * Give bus route for the centre side bus stop
 */
function getCentreSideBusses(id){
    var pickRetialParkBusses = {
    "text":"Which bus do you want? 🤔",
    "quick_replies":[
      {
        "content_type":"text",
        "title":"39A to Ongar",
        "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
      },
      {
        "content_type":"text",
        "title":"39 to Ongar",
        "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
      },
      {
        "content_type":"text",
        "title":"220 to Lady's Well",
        "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
      },
      {
        "content_type":"text",
        "title":"236 to Damastown",
        "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
      },
      {
        "content_type":"text",
        "title":"239 to Liffey Valley",
        "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
      },
      {
        "content_type":"text",
        "title":"270 to Dunboyne",
        "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
      }
    ]
  }
  sendMessage(id, pickRetialParkBusses);
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
            message = "It's " + getActualTime() + ". So it's too late for busses mate";
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
                message = "There is no times available for " + busNumber + " 😕";
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
function getMap(id)
{
    var src = "https://maps.googleapis.com/maps/api/staticmap?key=AIzaSyAKCAc4WVIs94GyHmnmao2-533exZJog5s&zoom=17&size=500x900&center=53.40594405147698,-6.3770287084247474&format=png&" +
        "maptype=satellite";

    var message =
    {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": {
                    "element": {
                        "title": "College Map",
                        "image_url": "https:\/\/maps.googleapis.com\/maps\/api\/staticmap?size=" +
                        "764x400&center=53.4058244,-6.3784213&zoom=17&markers=53.4058244,-6.3784213&maptype=hybrid",
                        "item_url" : src
                    }
                }
            }
        }
    };
    sendMessage(id, message)
}

/**
 * Function to send picture messages
 * @param recipientID
 * @param url
 */
function pictureReply(recipientID, url)
{
    var message =
    {
        "attachment": {
            "type": "image",
            "payload": {
                "url": "https://i.ytimg.com/vi/KwXSIpwGZS8/maxresdefault.jpg"
            }
        }
    };
    sendMessage(recipientID, message);
}

/***************************** COLLEGE WEBSITES *************************************** */

/**
 * List of useful ITB websites in a buttons template
 */
function listMoodle(id) {
    var url = "https://moodle.itb.ie/login/index.php";
    // var url = "https://addforbot.000webhostapp.com/";
    var message = {
        "attachment":{
            "type":"template",
            "payload":{
                "template_type":"button",
                "text":"Which site do you need?",
                "buttons":[
                    {
                        "type":"web_url",
                        "url": url,
                        "title":"Moodle",
                        "webview_height_ratio": "tall"
                    },
                    {
                        "type":"web_url",
                        "url":"https://goo.gl/MwLMx4",
                        "title":"Student Email",
                        "webview_height_ratio": "tall"
                    },
                    {
                        "type":"web_url",
                        "url":"http://tesla.itb.ie/eportal/index.jsp",
                        "title":"Eportal",
                        "webview_height_ratio": "tall"
                    }
                ]
            }
        }
    };
    sendMessage(id, message);
}

/****************************** SHUTTLE BUS ***********************************/

function shuttlebusLocationChoices(id){
    var pickShuttleBusTemplate = {
        "text" : "Which shuttle bus times do you want? 🤔",
        "quick_replies":[
            {
                "content_type":"text",
                "title":"ITB to the centre",
                "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
            },
            {
                "content_type":"text",
                "title":"The centre to ITB",
                "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
            }
        ]
     }
  sendMessage(id, pickShuttleBusTemplate);
}

/**
 * return shuttle-bus times from the ITB terminus
 * @returns {string}
 */
function getBusTimes(id, destination){
    var times = "Today's bus times are: ";
    if(destination == "ITB"){
        times += "\n08:00, 08:35, 09:10	09:45, \n10:20, 11:40, 12:40, 13:40,\n 14:40, 15:40";
        sendMessage(id, {text: times})
    }
    else{
        times += "\n08:10, 08:45, 09:20, 09:55,\n11:10, 12:10, 13:10, 14:10,\n15:10, 16:10, 16:50, 17:25,\n18:10\n";
        sendMessage(id, {text: times})
    }
}

/**************************** CONVERSATIONAL RESPONSES ********************************** */

/**
 * Return a menu for the user to choose what functionality
 * they can use.
 */
function getHelpChoices(id){
    var pickFunctionalityTemplate = {
            "text" : "Here is a list of what i can do:\n-Give you the shuttle bus times🚌\n"+
                    "-Give you Dublin Bus times🚌\n-Let you access all the college websites on the go💻\n"+
                    "-Show you the college map\n-Give you the current time⏰",
            "quick_replies":[
                {
                    "content_type":"text",
                    "title":"Shuttle Bus",
                    "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
                },
                {
                    "content_type":"text",
                    "title":"Dublin Bus Helper",
                    "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
                },
                {
                    "content_type":"text",
                    "title":"College map",
                    "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
                },
                {
                    "content_type":"text",
                    "title":"College Websites",
                    "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
                },
                {
                    "content_type":"text",
                    "title":"Give me the time",
                    "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
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
 * list of useful ITB websites in a buttons template
 */
function listMoodle(id)
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
 * if a user enters a phrase that the bot doesn't understand
 * @returns {*}
 */


/**
 * Returns the current time
 * @returns {string}
 */
function getActualTime(){
    return new Date().toLocaleTimeString('IRL', { hour12: false, hour: "numeric", minute: "numeric"});
}
