import * as functions from 'firebase-functions';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

//import fetch from 'node-fetch';
//import * as cheerio from 'cheerio';

// Google Assistant deps
import { dialogflow, SimpleResponse, BasicCard, Button, Image } from 'actions-on-google';
const app = dialogflow({ debug: true});

// Odoo XML-RPC ts https://www.npmjs.com/package/odoo-xmlrpc

const Odoo = require('odoo-xmlrpc');

const odoo = new Odoo({
    url: 'https://lgharib-odoo-assistant.odoo.com/',
    port: '80',
    db: 'lgharib-odoo-assistant-master-726081',
    username: 'larbizard@gmail.com',
    password: 'odooassistant'
});



// Capture Intent
app.intent('Create a lead', async (conv) => {

	const data = await createLead();
	if( data != '0'){
		conv.close(new SimpleResponse({
			text: 'Lead created',
			speech: 'The lead was created', 
		}));
		conv.close(new BasicCard({
	                text: 'Lead created',
		        image: new Image({
				url: 'https://kioteservices.com/wp-content/uploads/2017/12/odoo_logo.png',
				alt: 'Odoo Logo',
			}),
			buttons: new Button({
				title: 'Lead link',
				url: 'https://staging.gesteve.umontreal.ca/',
			})

		}));	
	}
	else{
		conv.close(new SimpleResponse({
			text: 'Error creating lead see logs ',
			speech: 'Error creating lead see logs', 
		}));
	}

});

// Helper Function for scrapping a webpage
async function createLead() {
	let result = '';
	odoo.connect(function (error:any) {
		if (error) { 
			console.log(error);
			result = '0';
		}
		else{
		    console.log('Connected to Odoo server.');
		    const inParams = [];
		    inParams.push({'name': 'New Lead Savoir-Faire Linux'})
		    const params = [];
		    params.push(inParams);
		    odoo.execute_kw('crm.lead', 'create', params, function (err:any, value:any) {
		        if (err) { 
		        	console.log(err);
		        }
		        else {
					console.log('Result: ', value);
		        	result = value;
		        }
		    });
		}
	});
	return result;

}


// Export the Cloud Functions
export const fulfillment = functions.https.onRequest(app);
