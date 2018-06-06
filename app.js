/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var WatsonConversationSetup = require('./lib/watson-conversation-setup');
var DEFAULT_NAME = 'watson-conversation-slots-intro';
var fs = require('fs'); // file system for loading JSON
var vcapServices = require('vcap_services');
var conversationCredentials = vcapServices.getCredentials('conversation');
var watson = require('watson-developer-cloud'); // watson sdk
var Cloudant = require("cloudant");

var express = require('express'); // app server
var bodyParser = require('body-parser'); // parser for post requests

var app = express();

require('metrics-tracker-client').track();

// Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json());

var workspaceID; // workspaceID will be set when the workspace is created or validated.

// Create the service wrapper
var conversation = watson.conversation({
  url: conversationCredentials.url,
  username: conversationCredentials.username,
  password: conversationCredentials.password,
  version_date: '2016-07-11',
  version: 'v1'
});

var btq_code;
var order_num;
var btq_code_total = 0;
var btq_code_price;
var order_num_price;

var cloudant = Cloudant({account: "89691a2c-e6b9-43b0-97cc-36e5674922a7-bluemix" ,password: "37295f3fc53459487a636c95ee03fcad5576666329fd0e9c0853236ead3e4a27"});
var db = cloudant.db.use('chatbot-poc');

var conversationSetup = new WatsonConversationSetup(conversation);
var workspaceJson = JSON.parse(fs.readFileSync('data/watson-pizzeria.json'));
var conversationSetupParams = { default_name: DEFAULT_NAME, workspace_json: workspaceJson };
conversationSetup.setupConversationWorkspace(conversationSetupParams, (err, data) => {
  if (err) {
    //handleSetupError(err);
  } else {
    console.log('Conversation is ready!');
    workspaceID = data;
  }
});

var order_status ={
  "KRM234":{
    "status" : "processed",
    "promise_date":"21-5-2017"
  },
  "KRM192":{
    "status" : "recieved at factory",
    "promise_date":"01-02-2017",
    "pricing":{
      "labour": 5533,
      "stone": 20112,
      "gold": 7782
    }
  },
  "KRM723":{
    "status" : "dispatched",
    "promise_date":"25-5-2017",
    "pricing":{
      "labour": 7882,
      "stone": 11223,
      "gold": 9901
    },
    "courier":{
      "name": "Blue Dart",
      "stm": "1BI13CS084"
    }
  },
  "BKH595":{
    "status" : "clarified",
    "promise_date":"12-11-2017"
  },
  "BKH629":{
    "status" : "dispatched",
    "promise_date":"19-9-2017",
    "pricing":{
      "labour": 17728,
      "gold": 20006
    },
    "courier":{
      "name": "Sequel",
      "stm": "1BI13CS087"
    }
  },
  "HST676":{
    "status" : "dispatched",
    "promise_date":"18-2-2017",
    "pricing":{
      "labour": 8921,
      "stone": 22043,
      "gold": 33382
    },
    "courier":{
      "name": "FedEX",
      "stm": "1BI13P076"
    }
  },
  "HST163":{
    "status" : "processed",
    "promise_date":"12-5-2017"
    }
  ,
  "HST816":{
    "status" : "clarified",
    "promise_date": "11-9-2017"
  },
  "HST531":{
    "status" : "recieved at factory",
    "promise_date":"8-8-2017",
    "pricing":{
      "labour": 5531,
      "gold": 34401
    }
  },
  "TUR268":{
    "status" : "clarified",
    "promise_date":"7-10-2017"
  },
  "KBT370":{
    "status" : "dispatched",
    "promise_date":"21-3-2017",
    "pricing":{
      "labour": 12000,
      "stone": 45000,
      "gold": 20015
    },
    "courier":{
      "name": "ONDOT",
      "stm": "1BB3CS087"
    }
  },
  "KBT282":{
    "status" : "dispatched",
    "promise_date":"22-12-2017",
    "pricing":{
      "labour": 35009,
      "stone": 32001,
      "gold": 67000
    },
    "courier":{
      "name": "Blue Dart",
      "stm": "1BI13CS084"
    }
  },
  "KBT534":{
    "status" : "produced",
    "promise_date":"24-11-2017"
  },
  "KBT428":{
    "status" : "recieved at factory",
    "promise_date":"20-10-2017",
    "pricing":{
      "labour": 40009,
      "gold": 60221
    }
  },
  "KBT398":{
    "status" : "dispatched",
    "promise_date":"17-9-2017",
    "pricing":{
      "labour": 30015,
      "stone": 40025,
      "gold": 73005
    },
    "courier":{
      "name": "DTDC",
      "stm": "1BI13CS884"
    }
  },
  "CHM481":{
    "status" : "recieved at factory",
    "promise_date":"24-4-2017",
    "pricing":{
      "labour": 8882,
      "gold": 23009
    }
  },
  "CHM916":{
    "status" : "dispatched",
    "promise_date":"17-3-2017",
    "pricing":{
      "labour": 4458,
      "stone": 78872,
      "gold": 44321
    },
    "courier":{
      "name": "DTDC",
      "stm": "1BI13CS784"
    }
  },
  "CHM821":{
    "status" : "dispatched",
    "promise_date":"16-3-2017",
    "pricing":{
      "labour": 5663,
      "stone": 22345,
      "gold": 90241
    },
    "courier":{
      "name": "DHL",
      "stm": "1BI13CS075"
    }
  },
  "THU182":{
    "status" : "produced",
    "promise_date":"19-7-2017"
  },
  "THU689":{
    "status" : "clarified",
    "promise_date":"11-5-2017"
  }
};

var orders = {
  "KRM":{
    "num" : 3,
    "name": "Koramangla, Bangalore",
  },
  "BKH":{
    "num" : 2,
    "name": "Kammanahalli, Bangalore",
  },
  "HST":{
    "num" : 4,
    "name": "Hosur",
  },
  "TUR":{
    "num" : 1,
    "name": "Bandra, Mumbai",
  },
  "KBT":{
    "num" : 5,
    "name": "Karol Bagh, Delhi",
  },
  "CHM":{
    "num" : 3,
    "name": "Chandigarh",
  },
  "THU":{
    "num" : 2,
    "name": "Hubli",
  },
}


// Endpoint to be call from the client side
app.post('/api/message', function(req, res) {

  if (!workspaceID) {
    return res.json({
      output: {
        text: 'Conversation initialization in progress. Please try again.'
      }
    });
  }

  var payload = {
    workspace_id: workspaceID,
    context: req.body.context || {},
    input: req.body.input || {}
  };

  // Send the input to the conversation service
  conversation.message(payload, function(err, data) {
    if (err) {
      return res.status(err.code || 500).json(err);
    }
    return res.json(updateMessage(payload, data));
  });
});

/**
 * Updates the response text using the intent confidence
 * @param  {Object} input The request to the Conversation service
 * @param  {Object} response The response from the Conversation service
 * @return {Object}          The response with the updated message
 */

 var selectDocument = function(order_num){
  var query = {
   "selector": {
      "orderNo": {
         "$eq":  parseInt(order_num)
      }
   },
   "fields": [
      "orderStatus"
   ]
};
  db.find(query, function(err, data){
    console.log(data.docs);
  });
}

function updateMessage(input, response) {
  var responseText = null;
  var status = null;
  if (!response.output) {
    response.output = {};
  } else {
    //insert logic here.
    if(response.context.hasOwnProperty("btq_code") && response.context["btq_code"] != ""){
      btq_code = response.context["btq_code"];
    }
    if(response.context.hasOwnProperty("order_num") && response.context["order_num"] != ""){
      order_num = response.context["order_num"];
    }
    if(response.context.hasOwnProperty("order_num_price") && response.context["order_num_price"] != ""){
      order_num_price = response.context["order_num_price"];
    }
    if(response.context.hasOwnProperty("btq_code_price") && response.context["btq_code_price"] != ""){
      btq_code_price = response.context["btq_code_price"];
    }

    if(response.context.hasOwnProperty("btq_code_total") && response.context["btq_code_total"] != ""){
      btq_code_total = response.context["btq_code_total"];
      console.log(btq_code_total);
      status = "The boutique located at "+orders[btq_code_total].name +" has "+ orders[btq_code_total].num +" orders registered.";
      console.log(status);
      response.output.text[0] = status;
      btq_code_total = 0;
    }

    if(btq_code_price && order_num_price){
      var order_code = btq_code_price + order_num_price;
      if(order_status.hasOwnProperty(order_code)){
        if(order_status[order_code].hasOwnProperty('pricing')){
          if(order_status[order_code].pricing.hasOwnProperty('stone')){
            status = 'Your STUDDED product has the making charge of ₹ '+ order_status[order_code].pricing.labour+'; stone value of ₹ '+order_status[order_code].pricing.stone+' and gold value of ₹'+order_status[order_code].pricing.gold;
          }
          else if(!order_status[order_code].pricing.hasOwnProperty('stone')){
            status = 'Your PLAIN product has the making charge of ₹ '+ order_status[order_code].pricing.labour+' and gold vaue of ₹ '+order_status[order_code].pricing.gold+".";
          }
          response.output.text[0] = status;
        }
        else if(!order_status[order_code].hasOwnProperty('pricing')){
          response.output.text[0] = "Pricing details not yet fixed. Please check back later.";
        }
      }
      btq_code_price = order_num_price = 0;
    }

    if(btq_code && order_num ){
      var order_code = btq_code+order_num;
      var addendum = "";
      if(order_status.hasOwnProperty(order_code)){
        if(order_status[order_code].hasOwnProperty("courier")){
          addendum = "through the courier services of "+ order_status[order_code].courier.name+" having AWB code of "+  order_status[order_code].courier.stm;
        }
        status = "Your order " + order_code +" is currently being "+order_status[order_code].status + " and will be delivered by "+ order_status[order_code].promise_date +" "+ addendum;
        console.log(status);
        addendum = "";
        response.output.text[0] = status;
        btq_code = order_num = 0;
    }
    if(btq_code_total != 0){
      status = "The boutique located at "+orders[btq_code_total].name +" has "+ orders[btq_code_total].num +" orders registered.";
      console.log(status);
      btq_code_total = 0;
    }

    }
    response.output.text[0] = 'Krotonus: ' + response.output.text[0];
    return response ;
  }

  if (response.intents && response.intents[0]) {
    var intent = response.intents[0];
    // Depending on the confidence of the response the app can return different messages.
    // The confidence will vary depending on how well the system is trained. The service will always try to assign
    // a class/intent to the input. If the confidence is low, then it suggests the service is unsure of the
    // user's intent . In these cases it is usually best to return a disambiguation message
    // ('I did not understand your intent, please rephrase your question', etc..)
    if (intent.confidence >= 0.75) {
      responseText = 'I understood your intent was ' + intent.intent;
    } else if (intent.confidence >= 0.5) {
      responseText = 'I think your intent was ' + intent.intent;
    } else {
      responseText = 'I did not understand your intent';
    }
  }
  response.output.text = responseText;
  return response;
}

module.exports = app;
