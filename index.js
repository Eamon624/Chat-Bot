/**
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
 * Run the app on the given port
 */
app.listen(app.get('port'), function () {
	console.log('Chatbot server  is running on port', app.get('port'))
})
