/**
 * Copyright 2022 Justin Randall, Cisco Systems Inc. All Rights Reserved.
 * 
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU
 * General Public License as published by the Free Software Foundation, either version 3 of the License, or 
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without 
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 * See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along with this program. If not, 
 * see <https://www.gnu.org/licenses/>.
 */
'use strict';

const {DialogFlowEsClient,Intent,fmtLog} = require('codingforconvos');
const {registerCommonModules,registerModuleCovidScreen,registerModuleAppointmentBooking,RedmineConnector,WebexCcConnector,WebexConnectConnector,GoogleCalendarConnector,JdsConnector} = require('cctsa-wxccdemobot-commons');

///////////////////////////////////////////
// Create Dialogflow ES Endpoint Client. //
///////////////////////////////////////////

const convoClient = new DialogFlowEsClient({
    baseParams: {
        // Profile & Channel Type parameters.
        customerName: '',
        companyName: '',
        
        // Identification & Authentication
        customerIdentified: '',
        customerIdentifiedBy: '',
        customerValidated: ''
    },
    populateFromEsPayload: (context, dialogContext) => {
        const payload = dialogContext.payload;
    
        const customerIdentifiedString = (payload.customerIdentified) ? payload.customerIdentified : 'false';
        context.parameters.customerIdentified = (customerIdentifiedString === 'true') ? '1' : '0';
        
        const customerValidatedString = (payload.customerValidated) ? payload.customerValidated : 'false';
        context.parameters.customerValidated = (customerValidatedString === 'true') ? '1' : '0';
        
        const defaultName = process.env.COMPANY_NAME || 'Cisco';
        context.parameters.companyName = payload.companyName || defaultName;
        
        return context;
    },
    populateFromLookup: RedmineConnector.populateFromRedmineLookup
});



//////////////////////////
// Register Connectors. //
//////////////////////////

// Register the Webex Contact Center (WxCC) Connector.
convoClient.registerConnector(new WebexCcConnector());

// Register the Redmine API Connector.
convoClient.registerConnector(new RedmineConnector({
    hostname: process.env.REDMINE_HOST,
    apiKey: process.env.REDMINE_APIKEY,
    rejectUnauthorized: process.env.REJECT_UNAUTHORIZED
}));

// Register the Webex Connect API Connector.
convoClient.registerConnector(new WebexConnectConnector({
    smsSendOtpUrl: process.env.SMS_SEND_OTP_URL,
    smsPwResetUrl: process.env.SMS_SEND_PWRESET_URL,
    emailSendOtpUrl: process.env.EMAIL_SEND_OTP_URL,
    emailPwResetUrl: process.env.EMAIL_SEND_PWRESET_URL
}));

// Register the Webex Contact Center (WxCC) Journey Data Services (JDS) Connector.
convoClient.registerConnector(new JdsConnector({
    jdsUrl: process.env.JDS_URL,
    dsSasToken: process.env.JDS_SAS_TOKEN,
    tapeSasToken: process.env.JDS_TAPE_SAS_TOKEN
}));

// Register the Google Calendar API Connector.
convoClient.registerConnector(new GoogleCalendarConnector({
    calendarId: process.env.GOOGLE_CAL_ID,
    serviceAccount: process.env.GOOGLE_SERV_AUTH
}));



/////////////////////////////////////////////
// Register Sequences and Intent Handlers. //
/////////////////////////////////////////////

// Register common modules.
registerCommonModules(convoClient);

// Register optional modules.
registerModuleCovidScreen(convoClient);
registerModuleAppointmentBooking(convoClient);

// Register intents
convoClient.registerIntent(new Intent({
    action: 'skill.some.example.intent',
    waitForReply: true,
    handler: (dialogContext) => {
        dialogContext.appendFulfillmentText();
        return;
    }
}));

convoClient.registerIntent(new Intent({
    action: 'skill.speaktoloanofficer',
    waitForReply: false,
    handler: (dialogContext) => {
        dialogContext.setFulfillmentText();
        dialogContext.respondWithEvent('OfferSpeakToAgent', dialogContext.params.lastFulfillmentText);
        return;
    }
}));


//////////////////////////////////////
// Handle the Dialogflow ES Request //
//////////////////////////////////////

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
/**
 * Entry point for Dialogflow Webhook Fulfillment Handler.
 * 
 * @param {Object} req  The HTTP request.
 * @param {Object} res  The HTTP response.
 */
async function handleFulfillment (req, res) {
    // HTTP debug dump.
    console.log(fmtLog('handleRequest', 'Dialogflow Request headers: ' + JSON.stringify(req.headers)));
    console.log(fmtLog('handleRequest', 'Dialogflow Request body: ' + JSON.stringify(req.body)));

    return await convoClient.handleRequest(req, res);
}

module.exports = {handleFulfillment};
