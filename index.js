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
    res.send('This is the callback URL \n for the facebook web hook.');/**
     * Use strict directive prevents usage of
     * undeclared variables
     */
    'use strict';
    const config = require('./config');
    const apiai = require('apiai');
    const express = require('express');
    const bodyParser = require('body-parser');
    const request = require('request');
    const uuid = require('uuid');
    const crypto = require('crypto');
    const app = express();


    /**
     * Checking that all the access tokens and secrets
     * in the config.js exist
     */
    if (!config.FB_PAGE_TOKEN) {
    	throw new Error('missing FB_PAGE_TOKEN');
    }
    if (!config.FB_VERIFY_TOKEN) {
    	throw new Error('missing FB_VERIFY_TOKEN');
    }
    if (!config.API_AI_CLIENT_ACCESS_TOKEN) {
    	throw new Error('missing API_AI_CLIENT_ACCESS_TOKEN');
    }
    if (!config.FB_APP_SECRET) {
    	throw new Error('missing FB_APP_SECRET');
    }
    if (!config.SERVER_URL) {
    	throw new Error('missing SERVER_URL');
    }


    //Set the port of the app
    app.set('port', (process.env.PORT || 5000))
    //verify request came from facebook
    app.use(bodyParser.json({verify: verifyRequestSignature}));
    // Process application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({extended: false}))
    // Process application/json
    app.use(bodyParser.json())


    /**
     * Set up API.ai with the access token in Config.js
     */
    const apiAiService = apiai(config.API_AI_CLIENT_ACCESS_TOKEN, {
    	 language: "en", requestSource: "fb"
    });

    const sessionIds = new Map();

    // Index route
    app.get('/', function (req, res) {
    	res.send('This is the landing page for the chatbot...')
    })

    /**
     * Facebook webhook code prewritten in facebook docs.
     */
    app.get('/webhook/', function (req, res) {
    	if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === config.FB_VERIFY_TOKEN) {
    		res.status(200).send(req.query['hub.challenge']);
    	} else {
    		console.error("Verification was not valid.");
    		res.sendStatus(403);
    	}
    })

    /*
     * All callbacks for Messenger are POST-ed. They will be sent to the same
     * webhook. Be sure to subscribe your app to your page to receive callbacks
     * for your page.
     * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
     *
     */
    app.post('/webhook/', function (req, res) {
    	var data = req.body;
    	// console.log(JSON.stringify(data));

    	// Make sure this is a page subscription
    	if (data.object == 'page') {
    		// Iterate over each entry
    		// There may be multiple if batched
    		data.entry.forEach(function (entry) {
    			var pageID = entry.id;
    			var timeOfEvent = entry.time;

    			// Iterate over each messaging event and handle accordingly
    			entry.messaging.forEach(function (messagingEvent) {
    				if(messagingEvent.message) {
    					receivedMessage(messagingEvent);
    				}
    				else if (messagingEvent.delivery) {
    					receivedDeliveryConfirmation(messagingEvent);
    				}
    				else if (messagingEvent.postback) {
    					receivedPostback(messagingEvent);
    				}
    				else {
    					console.log("Unknown event type ..")
    				}
    			});
    		});

    		//Send status 200
    		res.sendStatus(200);
    	}
    });



    /**
     * Function for receiving messageEvent.Messages
     * @param {*} event
     */
    function receivedMessage(event) {

    	//Set variables from json
    	var senderID = event.sender.id;
    	var recipientID = event.recipient.id;
    	var timeOfMessage = event.timestamp;
    	var message = event.message;

    	if (!sessionIds.has(senderID)) {
    		sessionIds.set(senderID, uuid.v1());
    	}

    	//Set variables
    	var isEcho = message.is_echo;
    	var messageId = message.mid;
    	var appId = message.app_id;
    	var metadata = message.metadata;

    	// You may get a text or attachment but not both
    	var messageText = message.text;
    	var messageAttachments = message.attachments;
    	var quickReply = message.quick_reply;

    	//check type of messafe
    	if (isEcho) {
    		handleEcho(messageId, appId, metadata);
    		return;
    	} else if (quickReply) {
    		handleQuickReply(senderID, quickReply, messageId);
    		return;
    	}
    	//Check if it's a text message
    	if (messageText) {
    		//send message to api.ai
    		sendToApiAi(senderID, messageText);
    	} else if (messageAttachments) {
    		handleMessageAttachments(messageAttachments, senderID);
    	}
    }

    /**
     * If a user sends anything that isn't in text format
     * @param {*} messageAttachments
     * @param {*} senderID
     */
    function handleMessageAttachments(messageAttachments, senderID){
    	sendTextMessage(senderID, "Nice 😎");
    }


    /**
     * Function to handle quick reply payload
     * @param {*} senderID
     * @param {*} quickReply
     * @param {*} messageId
     */
    function handleQuickReply(senderID, quickReply, messageId) {
    	var quickReplyPayload = quickReply.payload;
    	//send payload to api.ai
    	sendToApiAi(senderID, quickReplyPayload);
    }

    /**
     * Logs metadata of the message recieved by the user
     * @param {*} messageId
     * @param {*} appId
     * @param {*} metadata
     */
    function handleEcho(messageId, appId, metadata) {
    	// Just logging message echoes to console
    	console.log("Received echo for message %s and app %d with metadata %s", messageId, appId, metadata);
    }


    /**
     * Used to handle API.ai responses and calls API functions
     * @param {*} sender
     * @param {*} action
     * @param {*} responseText
     * @param {*} contexts
     * @param {*} parameters
     */
    function handleApiAiAction(sender, action, responseText, contexts, parameters) {

    	switch (action) {

    		/*************** Dublin Bus Actions ******************/

    		//Corduff bus stop
    		case "corduff-route-picked" :
    					var busNum = contexts[0].parameters.bus_id;
    					getDublinBusTimes(sender,"1835", busNum);
    			break;
    		//Blanch centre side
    		case "blanch-centre-side-route-picked" :
    					var busNum = contexts[0].parameters.bus_id;
    					getDublinBusTimes(sender, "7026", busNum);
    			break;
    		//Blanch retail park
    		case "blanch-retail-side-route-picked" :
    					var busNum = contexts[0].parameters.bus_id;
    					getDublinBusTimes(sender, "4747", busNum);
    			break;
    		//Aquatic centre bus stop
    		case "aquatic-centre-route-picked" :
    					var busNum = contexts[0].parameters.bus_id;
    					getDublinBusTimes(sender, "6274", busNum);
    			break;
    		//Stop across from Ebay
    		case "ebay-route-picked" :
    					var busNum = contexts[0].parameters.bus_id;
    					getDublinBusTimes(sender, "1545", busNum);
    			break;

    		/*************** Library Actions ********************/

    		case 'library-pin-not-enrolled' :
    				getLibraryInfo(sender, action);
    			break;
    		case 'library-pin-recovery-picked' :
    				getLibraryInfo(sender, action);
    			break;
    		case 'library-online-account-picked' :
    				getLibraryInfo(sender, action);
    			break;
    		case 'library-refworks-sign-up-clicked':
    				getLibraryInfo(sender, action);
    			break;
    		case 'library-refworks-more-information-clicked' :
    				getLibraryInfo(sender, action);
    			break;
    		case 'library-print-check-balance-clicked' :
    				getLibraryInfo(sender, action);
    			break;
    		case 'library-print-top-up-clicked' :
    				getLibraryInfo(sender, action);
    			break;
    		case 'library-locate-book-clicked' :
    				getLibraryInfo(sender, action);
    			break;
    		case 'libary-laptop-loan-clicked':
    				getLibraryInfo(sender, action);
    			break;

    		/***************** Gym Actions **********************/

    		case "gym-class-times-days-picked" :
    				var dayPicked = contexts[0].parameters.gym_days;
    				getGymInfo(sender, action, dayPicked);
    			break;
    		case "gym-opening-times-picked" :
    				getGymInfo(sender, action, null);
    			break;
    		case "gym-equipment-picked":
    				getGymInfo(sender, action, null);
    			break;
    		case "gym-facilities-picked":
    				getGymInfo(sender, action, null);
    			break;
    		/****************************************************/
    		default:
    			//unhandled action, just send back the text
    			sendTextMessage(sender, responseText);
    	}
    }


    /**
     * Handles the kind of messages that get sent
     * @param {*} message
     * @param {*} sender
     */
    function handleMessage(message, sender) {
    	switch (message.type) {

    		//If it is text
    		case 0:
    			sendTextMessage(sender, message.speech);
    			break;

    		//if it a quick reply
    		case 2:
    			let replies = [];
    			for (var i = 0; i < message.replies.length; i++) {
    				let reply =  {
    					"content_type": "text",
    					"title": message.replies[i],
    					"payload": message.replies[i]
    				}
    				replies.push(reply);
    			}
    			//Send a quick Reply
    			sendQuickReply(sender, message.title, replies);
    			break;

    		//If it is an image
    		case 3:
    			sendImageMessage(sender, message.imageUrl);
    			break;

    		//Handle Custom payloads
    		case 4:
    			var messageData = {
    				recipient: {
    					id: sender
    				},
    				message: message.payload.facebook
    			};
    			callSendAPI(messageData);
    			break;
    	}
    }


    /**
     * Handles the responsed from API.ai
     * @param {*} sender
     * @param {*} response
     */
    function handleApiAiResponse(sender, response) {
    let responseText = response.result.fulfillment.speech;
    	let responseData = response.result.fulfillment.data;
    	let messages = response.result.fulfillment.messages;
    	let action = response.result.action;
    	let contexts = response.result.contexts;
    	let parameters = response.result.parameters;

    	sendTypingOff(sender);

    	if (isDefined(messages) && (messages.length == 1 && messages[0].type != 0 || messages.length > 1)) {

    		let timeoutInterval = 1100;
    		let previousType ;
    		let cardTypes = [];
    		let timeout = 0;
    		for (var i = 0; i < messages.length; i++) {

    			if ( previousType == 1 && (messages[i].type != 1 || i == messages.length - 1)) {

    				timeout = (i - 1) * timeoutInterval;
    				setTimeout(handleCardMessages.bind(null, cardTypes, sender), timeout);
    				cardTypes = [];
    				timeout = i * timeoutInterval;
    				setTimeout(handleMessage.bind(null, messages[i], sender), timeout);
    			} else if ( messages[i].type == 1 ) {
    				cardTypes.push(messages[i]);
    			} else {
    				timeout = i * timeoutInterval;
    				setTimeout(handleMessage.bind(null, messages[i], sender), timeout);
    			}

    			previousType = messages[i].type;

    		}
    	} else if (responseText == '' && !isDefined(action)) {
    		//api ai could not evaluate input.
    		console.log('Unknown query' + response.result.resolvedQuery);
    		sendTextMessage(sender, "I'm not sure what you want. Can you be more specific?");
    	} else if (isDefined(action)) {
    		handleApiAiAction(sender, action, responseText, contexts, parameters);
    	} else if (isDefined(responseData) && isDefined(responseData.facebook)) {
    		try {
    			console.log('Response as formatted message' + responseData.facebook);
    			sendTextMessage(sender, responseData.facebook);
    		} catch (err) {
    			sendTextMessage(sender, err.message);
    		}
    	} else if (isDefined(responseText)) {
    		console.log('Respond as text message');
    		sendTextMessage(sender, responseText);
    	}
    }

    /**
     * Used to send messages to APi.ai
     * @param {*} sender
     * @param {*} text
     */
    function sendToApiAi(sender, text) {

    	//sends the typing bubble to the sender until
    	//a response is given
    	sendTypingOn(sender);

    	//Send message to API.ai
    	let apiaiRequest = apiAiService.textRequest(text, {
    		sessionId: sessionIds.get(sender)
    	});

    	//Wait for response to API.ai
    	apiaiRequest.on('response', (response) => {
    		if (isDefined(response.result)) {
    			handleApiAiResponse(sender, response);
    		}
    	});

    	apiaiRequest.on('error', (error) => console.error(error));
    	apiaiRequest.end();
    }

    /**
     * Called when a message is text Handle
     * sent to the user
     * @param {*} recipientId
     * @param {*} text
     */
    function sendTextMessage(recipientId, text) {
    	var messageData = {
    		recipient: {
    			id: recipientId
    		},
    		message: {
    			text: text
    		}
    	}
    	callSendAPI(messageData);
    }

    /**
     * Send an image to the user
     * @param {*} recipientId
     * @param {*} imageUrl
     */
    function sendImageMessage(recipientId, imageUrl) {
    	var messageData = {
    		recipient: {
    			id: recipientId
    		},
    		message: {
    			attachment: {
    				type: "image",
    				payload: {
    					url: imageUrl
    				}
    			}
    		}
    	};
    	callSendAPI(messageData);
    }

    /**
     * Send a button message to the user
     * @param {*} recipientId
     * @param {*} text
     * @param {*} buttons
     */
    function sendButtonMessage(recipientId, text, buttons) {
    	var messageData = {
    		recipient: {
    			id: recipientId
    		},
    		message: {
    			attachment: {
    				type: "template",
    				payload: {
    					template_type: "button",
    					text: text,
    					buttons: buttons
    				}
    			}
    		}
    	};
    	callSendAPI(messageData);
    }

    /**
     * Generic template message
     * @param {*} recipientId
     * @param {*} elements
     */
    function sendGenericMessage(recipientId, elements) {
    	var messageData = {
    		recipient: {
    			id: recipientId
    		},
    		message: {
    			attachment: {
    				type: "template",
    				payload: {
    					template_type: "generic",
    					elements: elements
    				}
    			}
    		}
    	};
    	callSendAPI(messageData);
    }

    /**
     * Quick reply function to prevent user
     * having to type answers
     * @param {*} recipientId
     * @param {*} text
     * @param {*} replies
     * @param {*} metadata
     */
    function sendQuickReply(recipientId, text, replies, metadata) {
    	var messageData = {
    		recipient: {
    			id: recipientId
    		},
    		message: {
    			text: text,
    			metadata: isDefined(metadata)?metadata:'',
    			quick_replies: replies
    		}
    	};
    	callSendAPI(messageData);
    }

    /**
     * Show the used that the message has been seen
     * @param {*} recipientId
     */
    function sendReadReceipt(recipientId) {

    	var messageData = {
    		recipient: {
    			id: recipientId
    		},
    		sender_action: "mark_seen"
    	};

    	callSendAPI(messageData);
    }

    /**
     * Send the typing bubble to the user
     * @param {*} recipientId
     */
    function sendTypingOn(recipientId) {
    	var messageData = {
    		recipient: {
    			id: recipientId
    		},
    		sender_action: "typing_on"
    	};
    	callSendAPI(messageData);
    }


    /**
     * Turn the typing bubble off
     * @param {*} recipientId
     */
    function sendTypingOff(recipientId) {


    	var messageData = {
    		recipient: {
    			id: recipientId
    		},
    		sender_action: "typing_off"
    	};
    	callSendAPI(messageData);
    }

    /**
     * Call the Send API. The message data goes in the body. If successful, we'll
     * get the message id in a response
     *
     * Sends message to user
     * @param {*} messageData
     */
    function callSendAPI(messageData) {
    	request({
    		uri: 'https://graph.facebook.com/v2.6/me/messages',
    		qs: {
    			access_token: config.FB_PAGE_TOKEN
    		},
    		method: 'POST',
    		json: messageData
    	}, function (error, response, body) {
    		if(error){
    			console.log(error);
    		}else{
    			console.log("Message Sent successfully");
    		}

    	});
    }

    /**
     * Postback Event
     * This event is called when a postback is tapped on a Structured Message.
     * @param {*} event
     */
    function receivedPostback(event) {

    	//Set variables
    	var senderID = event.sender.id;
    	var recipientID = event.recipient.id;
    	var timeOfPostback = event.timestamp;

    	// The 'payload' param is a developer-defined field which is set in a postback
    	// button for Structured Messages.
    	var payload = event.postback.payload;

    	switch (payload) {

    		//messages sent if get started button is clicked
    		case 'GET_STARTED' :

    			var messageData = {
    				recipient: {
    					id: senderID
    				},
    				message: {
    					text:"Hi, I am the ITB Chatbot🤖 Im here to help you through college and make your college life easier😃\nSo lets get started 😏",
    					quick_replies:[
    						{
    						content_type :"text",
    						title : "What can you do?",
    							payload : "What can you do?"
    						},
    						{
    							content_type :"text",
    							title : "Who made you?",
    							payload : "Who made you?"
    						},
    						{
    							content_type :"text",
    							title : "Privacy policy",
    							payload : "Privacy policy"
    						}
    					]
    				}
    			};
    			callSendAPI(messageData);
    			break;

    		//Card template postbacks
    		case 'LIBRARY_OPENING' :
    				sendToApiAi(senderID, 'What time does the library open at?');
    			break;
    		case 'FORGOTTEN_PIN' :
    				sendToApiAi(senderID, 'I have forgotten my pin');
    			break;
    		case 'ONLINE_ACCOUNT' :
    				sendToApiAi(senderID, 'I want online account information');
    			break;
    		case 'HOW_TO_REFWORKS' :
    				sendToApiAi(senderID, 'How do you use refworks?');
    			break;
    		case 'PRINT_CREDIT' :
    				sendToApiAi(senderID, 'I want to know about my print credit');
    			break;
    		case 'LOCATE_BOOK' :
    				sendToApiAi(senderID, 'I want to locate a book');
    			break;
    		case 'LAPTOP_LOAN' :
    				sendToApiAi(senderID, 'i want to borrow a laptop');
    			break;
    		default:
    			//unindentified payload
    			sendTextMessage(senderID, "I'm not sure what you want. Can you be more specific?");
    			break;
    	}
    }


    /**
     * This event is sent to confirm the delivery of a message.
     * @param {*} event
     */
    function receivedDeliveryConfirmation(event) {
    	var senderID = event.sender.id;
    	var recipientID = event.recipient.id;
    	var delivery = event.delivery;
    	var messageIDs = delivery.mids;
    	var watermark = delivery.watermark;
    	var sequenceNumber = delivery.seq;

    	//confirm message has been delivered
    	if (messageIDs) {
    		messageIDs.forEach(function (messageID) {
    			console.log("Received delivery confirmation for message ID: %s",messageID);
    		});
    	}
    }

    /**
     * Verify that the callback came from Facebook. Using the App Secret from
     * the App Dashboard, we can verify the signature that is sent with each
     * callback in the x-hub-signature field, located in the header.
     * @param {*} req
     * @param {*} res
     * @param {*} buf
     */
    function verifyRequestSignature(req, res, buf) {

    	//read the signature from the request header
    	var signature = req.headers["x-hub-signature"];

    	//If their is no signature throw an error
    	if (!signature) {
    		throw new Error('Couldn\'t validate the signature from the request header.');
    	} else {
    		var elements = signature.split('=');
    		var method = elements[0];
    		var signatureHash = elements[1];

    		//Make sure that the encrypted facebook secret and the secret
    		//from the Config.js are the same
    		var expectedHash = crypto.createHmac('sha1', config.FB_APP_SECRET)
    			.update(buf)
    			.digest('hex');

    		//If they aren't a match, throw an error
    		if (signatureHash != expectedHash) {
    			throw new Error("Couldn't validate the request signature.");
    		}
    	}
    }


    /**
     * Function used to check if a variable has a
     * value
     * @param {*} obj
     */
    function isDefined(obj) {
    	//If no value
    	if (typeof obj == 'undefined') {
    		return false;
    	}

    	//If no object even passed
    	if (!obj) {
    		return false;
    	}

    	//otherwise, send it back
    	return obj != null;
    }


    /********************* API FUNCTIONS *****************/

    /**
     * Function to make HTTP request to Aarons Dublin bus API
     * @param {*} recipientId
     */
    function getDublinBusTimes(recipientId, stopId, busNum){

    	var options = {
    		url: "https://aaronapi.herokuapp.com/bus/" + stopId + "/" + busNum + "/",
    		method : "GET"
    	}
    	//Make a request to the API
    	request(options, function(error, res, body){

    			var text = res.body;
    			var messageData = {
    				recipient: {
    					id: recipientId
    				},
    				message: {
    					text: res.body,
    					quick_replies:[
    						{
    							content_type :"text",
    							title : "Pick another Bus?🚏",
    							payload : "Dublin Bus"
    						},
    						{
    							content_type :"text",
    							title : "Main Menu 💬",
    							payload : "Main menu"
    						},
    						{
    							content_type :"text",
    							title : "No thanks❌",
    							payload : "No thanks"
    						}
    					]
    				}
    			}
    			callSendAPI(messageData);
    	});
    	// callSendAPI(messageData);
    }

    /**
     * Function to make HTTP request to Brian's Gym API
     * @param {*} recipientId
     */
    function getGymInfo(recipientId, action, day){

    	var options;

    	//user picks class days
    	if(action == "gym-class-times-days-picked"){
    		options = {
    			url: "https://brianapi.herokuapp.com/gym/gym/classes/" + day,
    			method : "GET"
    		}
    	}
    	//user picks opening times
    	else if (action == "gym-opening-times-picked"){
    		options = {
    			url: "https://brianapi.herokuapp.com/gym/gym/openingtimes/",
    			method : "GET"
    		}
    	}
    	//User wants to see gym equipment
    	else if(action == "gym-equipment-picked"){
    		options = {
    			url: "https://brianapi.herokuapp.com/gym/gym/equipment/",
    			method : "GET"
    		}
    	}
    	//user wants to see facilities
    	else{
    		options = {
    			url: "https://brianapi.herokuapp.com/gym/gym/facilities/",
    			method : "GET"
    		}
    	}


    	/**
    	 * Deal with response from API
    	 */
    	request(options, function(error, res, body){

    			var text = res.body;
    			var messageData = {
    				recipient: {
    					id: recipientId
    				},
    				message: {
    					text: res.body,
    					quick_replies:[
    						{
    							content_type :"text",
    							title : "More gym info🏃🏻",
    							payload : "More gym info"
    						},
    						{
    							content_type :"text",
    							title : "Main Menu 💬",
    							payload : "Main menu"
    						},
    						{
    							content_type :"text",
    							title : "No thanks❌",
    							payload : "No thanks"
    						}
    					]
    				}
    			}
    			callSendAPI(messageData);
    	});
    }

    /**
     * Function to make HTTP request to daire's Library API
     * @param {*} recipientId
     */
    function getLibraryInfo(recipientId, action){

    	var options;

    	//User wants link to enrol in password recovery
    	if(action == 'library-pin-not-enrolled'){
    		options = {
    			url: "https://daireapi.herokuapp.com/library/library/pin/notenrolled",
    			method : "GET"
    		}
    	}
    	//User wants link to recover pin
    	else if (action == 'library-pin-recovery-picked'){
    		options = {
    			url: "https://daireapi.herokuapp.com/library/library/pin/recovery",
    			method : "GET"
    		}
    	}

    	//User clicked on online account
    	else if(action == 'library-online-account-picked'){
    		options = {
    			url: "https://daireapi.herokuapp.com/library/library/account",
    			method : "GET"
    		}
    	}
    	//User wants link to sign up for refworks
    	else if (action == 'library-refworks-sign-up-clicked'){
    		options = {
    			url: "https://daireapi.herokuapp.com/library/library/refwork/signup",
    			method : "GET"
    		}
    	}
    	//User wants more information on refworks
    	else if(action == 'library-refworks-more-information-clicked'){
    		options = {
    			url: "https://daireapi.herokuapp.com/library/library/refwork/moreinformation",
    			method : "GET"
    		}
    	}
    	//user wants link to check balance
    	else if(action == 'library-print-check-balance-clicked' || action == 'library-print-top-up-clicked'){
    		options = {
    			url: "https://daireapi.herokuapp.com/library/library/printcredit",
    			method : "GET"
    		}
    	}
    	//User want's to know how to locate a book
    	else if (action == 'library-locate-book-clicked'){
    		options = {
    			url: "https://daireapi.herokuapp.com/library/library/bookfind",
    			method : "GET"
    		}
    	}
    	//User wants to know how to borrow a laptop
    	else if (action == 'libary-laptop-loan-clicked'){
    		options = {
    			url: "https://daireapi.herokuapp.com/library/library/laptop",
    			method : "GET"
    		}
    	}

    	// Make request to the API
    	request(options, function(error, res, body){

    			var text = res.body;
    			var messageData = {
    				recipient: {
    					id: recipientId
    				},
    				message: {
    					text: res.body,
    					quick_replies:[
    						{
    							content_type :"text",
    							title : "More Library Info 📘",
    							payload : "Library"
    						},
    						{
    							content_type :"text",
    							title : "Main Menu 💬",
    							payload : "Main menu"
    						},
    						{
    							content_type :"text",
    							title : "No thanks❌",
    							payload : "No thanks"
    						}
    					]
    				}
    			}
    			callSendAPI(messageData);
    	});
    }


    /*********************************************** */

    /**
     * Run the app on the given port sadlasdh
     */
    app.listen(app.get('port'), function () {
    	console.log('Chatbot server  is running on port', app.get('port'))
    })

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
 * Yo Yo
 */
app.post('/webhook', function (req, res)
{
    var events = req.body.entry[0].messaging;

    for (var i = 0; i < events.length; i++)
    {
        var event = events[i];



        var event = events[i];

            var requestUrl = 'https://graph.facebook.com/v2.6/'+ event.sender.id +
            '?fields=first_name&access_token=' + PAGE_ACCESS_TOKEN;

            request(requestUrl, function(err, res, body){
                if(err){
                    console.log(err)
                }else{
                    //Parse body to a json object as the body isn't true json
                    var jsonObject = JSON.parse(body);
                    usersName = jsonObject.first_name;
                }
            });










        if (event.message && event.message.text)
        {
            var string = event.message.text;
            var message;
            recipientId = event.sender.id;

            //Prints uses ID to the console in colour for easy readability
            console.log('\x1b[36m', "Recipient ID: " + event.sender.id, '\x1b[0m');
            console.log('\x1b[36m', "Message: " + string, '\x1b[0m');
            console.log('\x1b[36m', "First name: " + usersName, '\x1b[0m');
            //If user greets the bot
            if (string.match(/(hey)|(hello)|(hi)|(what's up?)/i)) {
                sendMessage(event.sender.id, {text: getGreeting(event.sender.id, usersName)});
                usersName = null;
            }
            else if (string.match(/(my name)/i)) {
                getUsersName(event.sender.id);
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
                            message = "Your name is " + usersName + " :)";
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
        url: 'https://data.dublinked.ie/cgi-bin/rtpi/realtimebusinformation?stopid='+stopId+'&format=json',
        method : 'GET',
        strictSSL: false
    };
    //Request is made using the options and callback functions
    request(options, callback);
 }

let message = "";
function callback(error, response, body) {
        if(error){
            console.log(error);
        }
        else{
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
                          message += "• " + body.results[i].route + " to " + body.results[i].destination + " is due now." + " •\n";
                      }
                      //Stop 1 minute appearing as "1 minutes"
                      else if(body.results[i].duetime === "1"){
                          message += "• " + body.results[i].route + " to " + body.results[i].destination + " is due in " + body.results[i].duetime
                          + " minute" + " •\n" + " \n";
                      }
                      else{
                          message += "• " + body.results[i].route + " to " + body.results[i].destination + " is due in " + body.results[i].duetime
                          + " minutes" + " •\n" + " \n";
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


function getGreeting(id, usersName){
    var rand = Math.floor((Math.random() * 5) + 1);
    switch (rand) {
        case 1 :
            return "Hello how are you "+usersName+"?";
        case 2 :
            return "Hello there "+usersName+" :)";
        case 3:
            return "What can i do for you?";
        case 4:
            return "What's up?";
        case 5:
            return "How can i help you?";

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

            return "BSCH3, Advanced Databases is sheduled in this room until 4pm"

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
