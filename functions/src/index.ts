import * as functions from 'firebase-functions';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// import fetch from 'node-fetch';
// import * as cheerio from 'cheerio';

// Google Assistant deps
import { dialogflow, SimpleResponse, BasicCard, Button, Image } from 'actions-on-google';
const app = dialogflow({ debug: true});
const i18n = require("i18n");	
i18n.configure({
	directory: __dirname + '/locales',
	defaultLocale: 'en-US',
	objectNotation: true,
});

//Odoo XML-RPC ts https://www.npmjs.com/package/odoo-xmlrpc

const Odoo = require('odoo-xmlrpc');

const odoo = new Odoo({
    url: 'https://lgharib-odoo-assistant.odoo.com/',
    port: '443',
    db: 'lgharib-odoo-assistant-master-726081',
    username: 'larbizard@gmail.com',
    password: 'odooassistant'
});


app.intent('The name of the lead - probability - no', async (conv, {lead_name, percentage}) => {
	i18n.setLocale(conv.user.locale);
	const parameters = {
		'name': String(lead_name), 
		'probability': validatePercentage(String(percentage)),
	}

	return createLead(parameters).then(function(data) {
		buildPhoneResult(conv, String(lead_name), String(data), String(percentage));
	}).catch(function(){
		conv.close(new SimpleResponse({
			text: `Error`,
			speech: `Error`, 
		}));
	});
		
});

app.intent('The name of the lead - probability - yes - contact name - no', async (conv, {lead_name, percentage, contact_name, given_name}) => {
	i18n.setLocale(conv.user.locale);
	const parameters = {
		'name': String(lead_name), 
		'probability': validatePercentage(String(percentage)), 
		'contact_name': String(given_name) + ' ' + String(contact_name)
	}
	
	return createLead(parameters).then(function(data) {
		buildPhoneResult(conv, String(lead_name), String(data), String(percentage));
	}).catch(function(){
		conv.close(new SimpleResponse({
			text: `Error`,
			speech: `Error`, 
		}));
	});
		
});


app.intent('The name of the lead - probability - yes - contact name - yes - phonenumber', async (conv, {lead_name, percentage, contact_name, given_name, phone_number}) => {
	i18n.setLocale(conv.user.locale);
	const parameters = {
		'name': String(lead_name), 
		'probability': validatePercentage(String(percentage)), 
		'contact_name': String(given_name) + ' ' + String(contact_name),
		'phone': String(phone_number)
	}
	
	return createLead(parameters).then(function(data) {
		buildPhoneResult(conv, String(lead_name), String(data), String(percentage));
	}).catch(function(){
		conv.close(new SimpleResponse({
			text: `Error`,
			speech: `Error`, 
		}));
	});
		
});

function buildPhoneResult(conv:any, lead_name:string, data:string, percentage:string){
	conv.close(new SimpleResponse({
		text: i18n.__('LEAD_WAS_CREATE_TEXT', lead_name),
		speech: i18n.__('LEAD_WAS_CREATE_SPEECH', lead_name, String(percentage).replace('%', '')) 
	}));
	conv.close(new BasicCard({
			text: i18n.__('LEAD_WAS_CREATE_TEXT', lead_name),
			image: new Image({
			url: `https://kioteservices.com/wp-content/uploads/2017/12/odoo_logo.png`,
			alt: `Odoo Logo`,
		}),
		buttons: new Button({
			title: i18n.__('LEAD_OPEN_TEXT', lead_name),
			url: `https://lgharib-odoo-assistant.odoo.com/web?#id=${String(data)}&action=168&model=crm.lead&view_type=form&cids=1&menu_id=121`,
		})
	}));
}

function createLead(parameters:any) {
	return new Promise((resolve, reject)=>{
		odoo.connect(  function (error:any) {
			if (error) { reject(); }
			console.log('Connected to Odoo server.');
			const inParams = [];
			inParams.push(parameters);
			const params = [];
			params.push(inParams);
			odoo.execute_kw('crm.lead', 'create', params, function (err:any, value:any) {
				if (err) { reject(); }
				console.log('Result: ', value);
				resolve(value);
			});
		});
	});
}

function validatePercentage(percentage:string){
	let new_percentage = percentage;
	new_percentage = String(new_percentage).replace('%', '');
	if(Number(percentage)>100){
		new_percentage = '100;';
	}else if(Number(percentage)<0){
		new_percentage = '0';
	}
	return new_percentage;
}

// Export the Cloud Functions
export const fulfillment = functions.https.onRequest(app);
