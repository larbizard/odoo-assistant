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
	return createLead(String(lead_name), 
	String(percentage).replace('%', ''), 
	'', ''
	).then(function(data) {
		conv.close(new SimpleResponse({
			text: `Lead ${lead_name} created`,
			speech: `The lead ${lead_name} was created with ${String(percentage).replace('%', '')}% of chance to win it.`, 
		}));
		conv.close(new BasicCard({
				text: `Lead ${lead_name} created`,
				image: new Image({
				url: `https://kioteservices.com/wp-content/uploads/2017/12/odoo_logo.png`,
				alt: `Odoo Logo`,
			}),
			buttons: new Button({
				title: `Open ${lead_name} lead`,
				url: `https://lgharib-odoo-assistant.odoo.com/web?#id=${String(data)}&action=168&model=crm.lead&view_type=form&cids=1&menu_id=121`,
			})
		}));
	}).catch(function(){
		conv.close(new SimpleResponse({
			text: `Error`,
			speech: `Error`, 
		}));
	});
		
});

app.intent('The name of the lead - probability - yes - contact name - no', async (conv, {lead_name, percentage, contact_name}) => {
	return createLead(String(lead_name), 
	String(percentage).replace('%', ''), 
	String(contact_name),
	''
	).then(function(data) {
		conv.close(new SimpleResponse({
			text: `Lead ${lead_name} created`,
			speech: `The lead ${lead_name} was created with ${String(percentage).replace('%', '')}% of chance to win it.`, 
		}));
		conv.close(new BasicCard({
				text: `Lead ${lead_name} created`,
				image: new Image({
				url: `https://kioteservices.com/wp-content/uploads/2017/12/odoo_logo.png`,
				alt: `Odoo Logo`,
			}),
			buttons: new Button({
				title: `Open ${lead_name} lead`,
				url: `https://lgharib-odoo-assistant.odoo.com/web?#id=${String(data)}&action=168&model=crm.lead&view_type=form&cids=1&menu_id=121`,
			})
		}));
	}).catch(function(){
		conv.close(new SimpleResponse({
			text: `Error`,
			speech: `Error`, 
		}));
	});
		
});


// Helper Function for scrapping a webpage
function createLead(lead_name:string, percentage:string, contact_name:string, phone_number:string) {
	let new_percentage = percentage;
	if(Number(percentage)>100){
		new_percentage = '100;';
	}else if(Number(percentage)<0){
		new_percentage = '0';
	}
	return new Promise((resolve, reject)=>{
		odoo.connect(  function (error:any) {
			if (error) { reject(); }
			console.log('Connected to Odoo server.');
			const inParams = [];
			inParams.push({
				'name': lead_name, 
				'probability': new_percentage,
				'contact_name': contact_name,
				'phone': phone_number
			});
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


// Export the Cloud Functions
export const fulfillment = functions.https.onRequest(app);
