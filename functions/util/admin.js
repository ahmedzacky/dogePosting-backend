const admin = require('firebase-admin');
const adminKey = require('../../keys/firebase-creds');


//initializing admin
admin.initializeApp({credential: admin.credential.cert(adminKey)});

//saving db in a const
const db=admin.firestore();


module.exports = { admin, db };