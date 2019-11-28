url = 'https://lgharib-odoo-assistant.odoo.com'
db = 'lgharib-odoo-assistant-master-726081'
username = 'larbizard@gmail.com'
password = 'odooassistant'


import xmlrpc.client

common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(url))
uid = common.authenticate(db, username, password, {})
#import ipdb; ipdb.set_trace()
models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(url))
models.execute_kw(db, uid, password,
    'crm.lead', 'create',
    [{
    'name': "New Lead 2019",
}])
