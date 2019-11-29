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


// Capture Intent
app.intent('The name of the lead is', async (conv, {any}) => {
	return createLead(String(any)).then(function(data) {
		conv.close(new SimpleResponse({
			text: `Lead ${any} created`,
			speech: `The lead ${any} was created`, 
		}));
		conv.close(new BasicCard({
				text: `Lead ${any} created`,
				image: new Image({
				url: `https://kioteservices.com/wp-content/uploads/2017/12/odoo_logo.png`,
				alt: `Odoo Logo`,
			}),
			buttons: new Button({
				title: `Open ${any} lead`,
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
function createLead(any:string) {
	return new Promise((resolve, reject)=>{
		odoo.connect(  function (error:any) {
			if (error) { console.log(error); }
			console.log('Connected to Odoo server.');
			const inParams = [];
			inParams.push({'name': any})
			const params = [];
			params.push(inParams);
			odoo.execute_kw('crm.lead', 'create', params, function (err:any, value:any) {
				if (err) { console.log(err); }
				console.log('Result: ', value);
				resolve(value);
			});
		});
	});
}


// Export the Cloud Functions
export const fulfillment = functions.https.onRequest(app);
