const { client } = require('@xmpp/client');

const FCM_SERVER = 'fcm-xmpp.googleapis.com';
const FCM_PORT = 5235;
const SENDER_ID = '532655584828';
const SERVER_KEY = 'AAAAfAS_Njw:APA91bEFxhPNMfkN_nxfReOFwciHvnQ2_8lbIp41dtaeK3kYJJsF0k18jHgCY1cFpaP448j6jDWGhxrRJfHEO4kPzc0Whsk9BvxuiaUmhYHBhCi32oVgv8_xNBtvmjvLR2Csp05o3Kef';

const c = new client({
  service: `xmpps://${FCM_SERVER}:${FCM_PORT}`,
  domain: 'gcm.googleapis.com',
  username: SENDER_ID,
  password: SERVER_KEY,
});

c.on('stanza', (stanza) => {
  const message = parseStanza(stanza);
  handleMessage(message);
});


function parseStanza(stanza) {
   return stanza; 
}

function handleMessage(message) {
    console.log(`Got XMPP message: ${message}`)
}

c.on('error', (err) => {
  console.error('XMPP error:', err);
});

c.start().then(() => {
  console.log('Connected to FCM server');
}).catch((err) => {
  console.error('Error connecting to FCM server:', err);
});