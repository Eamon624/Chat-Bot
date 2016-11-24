var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

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
            console.log('\x1b[36m', "Recipient ID: " + event.sender.id, '\x1b[0m');

            //string user has entered
            var string = event.message.text;

            var message;

            //If user inputs any of these words than he gets one of the respones in the method
            if(string.match(/(hi)|(hey)|(hello)|(what's up?)|(yo)|(sup)|(wassup)/i)){
                sendMessage(event.sender.id,{text: getGreeting()});
            }

            else if (string.match(/(hi, how are you?)|(How are you?)|(How's it going?)|(Hey, hows it going?)/i)){
                sendMessage(event.sender.id,{text: getResponseGreeting()});
            }

            else if (string.match(/(Fuck)|(Piss)|(Shit)|(Cunt)/i)){
                sendMessage(event.sender.id,{text: getBadLanguage()});
            }

            else if (string.match(/(Paul Hayes)/i)){
                sendMessage(event.sender.id,{text: getPaulHayes()});
            }
            else if (string.match(/(Dominic Carr)/i)){
                sendMessage(event.sender.id,{text: getDominicCarr()});
            }
            else if (string.match(/(You're so Cheeky)|(You're just a little cheeky Chat Bot aren't you)|(This is very cheeky)|(This is so cheeky)/i)){
                sendMessage(event.sender.id,{text: getCheeky()});
            }

            else if(string.match(/(Time)|(What's the time?)|(What's the time)|(Do you know the time?)|(What's the time)/i))
            {
                sendMessage(event.sender.id,{text: getActualTime()});
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

//Cheeky Responses

function getCheeky(){
  var rand = Math.floor((Math.random() * 5) + 1);
  switch (rand) {

        case 1 :
            return "Hahahahhaah i know x";
        case 2 :
            return "Wanna go to the Salty Dog?";
        case 3 :
            return "Oh Shesh Y'all!";
        case 4 :
            return "Oh Dayum";
        case 5 :
            return "I love workmans!";

                }


                    }


function getBadLanguage(){
    var rand = Math.floor((Math.random() * 2) + 1);
    switch (rand) {

        case 1 :
            return "That's not very nice.";

        case 2 :
            return "No need for bad language.";


    }
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
