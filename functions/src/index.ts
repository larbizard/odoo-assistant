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
import { dialogflow, SimpleResponse, BasicCard, Button, Image, BrowseCarousel, BrowseCarouselItem } from 'actions-on-google';
const app = dialogflow({ debug: true});
const i18n = require("i18n");	
i18n.configure({
	directory: __dirname + '/locales',
	defaultLocale: 'en-US',
	objectNotation: true,
	fallbacks: {
		'es-419': 'es',
		'es-ES': 'es'
	}
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

app.intent('Search - lead', async (conv, {lead_name}) => {
	i18n.setLocale(conv.user.locale);
	const parameters = [['name', '=', String(lead_name)]];
	
	return searchLead(parameters).then(function(data) {
		console.log('Array length : ', Array(data).length);
		if(Array(data).length>0){
			buildPhoneSearchResult(conv, String(lead_name), data);	
		}else{
			conv.close(new SimpleResponse({
				text: i18n.__('NO_DATA_FOUND', lead_name),
				speech: i18n.__('NO_DATA_FOUND', lead_name), 
			}));
		}
		
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

function buildPhoneSearchResult(conv:any, lead_name:string, data:any){
	conv.close(new SimpleResponse({
		text: i18n.__('LEAD_SEARCH_TEXT', lead_name),
		speech: i18n.__('LEAD_SEARCH_TEXT', lead_name) 
	}));
	let carrousel_items:any = [];
	for (let entry of data) {
		console.log('Entry: ', entry);
		carrousel_items.push(
			new BrowseCarouselItem({
				title: entry['name'],
				url: `https://lgharib-odoo-assistant.odoo.com/web?#id=${String(entry['id'])}&action=168&model=crm.lead&view_type=form&cids=1&menu_id=121`,
				description: entry['probability'],
				image: new Image({
					url: 'https://larbigharib.com/wp-content/uploads/2019/12/erp.png',
					alt: 'Odoo',
				}),
				footer: 'Contact: ' + entry['contact_name'],
			})
		);
	}
	conv.ask(new BrowseCarousel({
    	items: carrousel_items,
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

function searchLead(parameters:any) {
	return new Promise((resolve, reject)=>{
		odoo.connect(  function (error:any) {
			if (error) { reject(); }
			console.log('Connected to Odoo server.');
			const inParams = [];
			inParams.push(parameters);
			inParams.push(0);  //offset
			inParams.push(5);  //Limit
			const params = [];
			params.push(inParams);
			odoo.execute_kw('crm.lead', 'search', params, function (err:any, value:any) {
				if (err) { reject(err); }
				console.log('Result1: ', value);
				const inParams2 = [];
				inParams2.push(value); //ids
				const params2 = [];
				params2.push(inParams2);
				odoo.execute_kw('crm.lead', 'read', params2, function (err2:any, value2:any) {
					if (err2) { reject(err2); }
					console.log('Result2: ', value2);
					resolve(value2);
				});
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
