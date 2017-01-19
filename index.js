var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));

//start

app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

/** Access Tokens **/
//Access Token for Facebook
  var PAGE_ACCESS_TOKEN = "EAAJ2aBX63yMBAPmke2JGBlZBFpADDdgVwcdrlDH2nthuxfs3ZAjOHVZAAHUjvadzOC9io7f7siZAzua5Ji8VVPHGqukoegD9gmpdqs3xm6bUZCxIoThXyVeMmZBWu8KIvHtTFtqdcndzmUxCW2YAtsZCOp36ZCLVvhdEZBJqHLpfBDQZDZD";



// Server frontpage
app.get('/', function (req, res) {
    res.send('Facebook ChatBot Server for NCI');
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'testbot_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

var recipientId;
var userName;
var all = false;

// handler receiving messages
app.post('/webhook', function (req, res)
{
    var events = req.body.entry[0].messaging;

    for (i = 0; i < events.length; i++)
    {
        var event = events[i];
        if (event.message && event.message.text)


        {
            //Prints uses ID to the console in colour for easy readability


            //string user has entered
            var string = event.message.text;

            var message;


            //Prints uses ID to the console in colour for easy readability
             recipientId = event.sender.id;

             console.log('\x1b[36m', "Recipient ID: " + event.sender.id, '\x1b[0m');
             console.log('\x1b[36m', "Message: " + string, '\x1b[0m');

            //If user inputs any of these words than he gets one of the respones in the method
            if(string.match(/(hi)|(hey)|(hello)|(what's up?)|(yo)|(sup)|(wassup)/i)){
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

+           else if (string.match(/(Who am i)/i)) {
                 message = "Your name is " + userName + " :)";
                 sendMessage(event.sender.id, {text: message});
             }
            else{
                sendMessage(event.sender.id,{text: getConfused()});
            }
        }
    }
    res.sendStatus(200);
});

/**
 * return a random greeting when user initiates
 * conversation.
 * @returns {*}
 */

 //Greetings

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

//Confused

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
 * Returns the current time
 * @returns {string}
 */
function getActualTime(){
    return new Date().toLocaleTimeString('IRL', { hour12: false, hour: "numeric", minute: "numeric"} );
}






// generic function sending messages
function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};
