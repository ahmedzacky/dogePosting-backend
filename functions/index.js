const functions = require('firebase-functions');
const app = require('express')()
const FBAuth = require('./util/fbAuth')
const { getAllScreams, PostOneScream, getAllUsers } = require('./handlers/screams')
const {SignUp, Login, UploadImage} = require('./handlers/users')


/*      SCREAM ROUTES        */
//get route for all screams
app.get('/screams', getAllScreams)

//posting a scream route
//token and adds user to the posted scream
app.post('/scream', FBAuth, PostOneScream);


/*      USERS ROUTES        */
//signup route
app.post('/signup', SignUp)

//login route
app.post('/login', Login);

//upload profile pic route
app.post('/user/image', FBAuth, UploadImage)

//get all users *prod mode only*
app.get('/users', getAllUsers)


//setting region to decrease latency
exports.api = functions.region('europe-west1').https.onRequest(app)