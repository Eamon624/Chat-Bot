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
            //If user greets the bot
            if(string.match(/(hi)|(hey)|(hello)|(what's up?)|(yo)|(sup)|(wassup)/i)){
                sendMessage(event.sender.id,{text: getGreeting()});
            }

            else if (string.match(/(hi, i'm graham)|(graham)|(My name is graham)/i)){
                sendMessage(event.sender.id,{text: getGraham()});
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

function getGreeting(){
    var rand = Math.floor((Math.random() * 12) + 1);
    switch (rand) {
        case 1 :
            return "Greetings";

        case 2 :
            return "What can I help you with?";

        case 3:
            return "Hello there";

        case 4:
            return "Hey there";"What's up?"

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

function getGraham(){
    var rand = Math.floor((Math.random() * 5) + 1);
    switch (rand) {
        case 1 :
            return "Hey Graham";

        case 2 :
            return "Sup dawg";

        case 3:
            return "Wanna play some 8 ball pool?";

        case 4:
            return "What room is our class in?"

        case 5:
            return "hi Graham, I'm shitting in for the CA later on";



    }
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
