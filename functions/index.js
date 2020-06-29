const functions = require('firebase-functions');
const app = require('express')()
const FBAuth = require('./util/fbAuth')
const { getAllScreams, PostOneScream } = require('./handlers/screams')
const {SignUp, Login} = require('./handlers/users')

//get route for all screams
app.get('/screams', getAllScreams)

//posting a scream route
//token and adds user to the posted scream
app.post('/scream', FBAuth, PostOneScream);

//signup route
app.post('/signup', SignUp)

//login route
app.post('/login', Login);

//setting region to decrease latency
exports.api = functions.region('europe-west1').https.onRequest(app)