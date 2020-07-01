const functions = require('firebase-functions');
const app = require('express')()
const FBAuth = require('./util/fbAuth')
const { 
    getAllScreams, 
    PostOneScream, 
    getAllUsers,
    getScream,
    commentOnScream,
    LikeScream,
    UnlikeScream,
    DeleteScream
    } = require('./handlers/screams')
const {
    SignUp, 
    Login, 
    UploadImage, 
    AddUserDetails, 
    getAuthenticatedUser
} = require('./handlers/users')


/*                     SCREAM ROUTES                      */
//get route for all screams
app.get('/screams', getAllScreams)

//posting a scream route
app.post('/scream', FBAuth, PostOneScream);

//get a single scream
app.get('/scream/:screamID', getScream);

// delete scream
app.delete('/scream/:screamID', FBAuth, DeleteScream);

//like a scream
app.get('/scream/:screamID/like', FBAuth, LikeScream)

//TODO unlike a scream
app.get('/scream/:screamID/unlike', FBAuth, UnlikeScream)

//comment on a scream
app.post('/scream/:screamID/comment', FBAuth, commentOnScream)


/*                   USERS ROUTES                        */


//signup route
app.post('/signup', SignUp)

//login route
app.post('/login', Login);

//get all users *prod mode only*
app.get('/user', FBAuth, getAuthenticatedUser)

//get all users *prod mode only*
app.get('/users', getAllUsers)

//upload profile pic route
app.post('/user/image', FBAuth, UploadImage)

//add user details
app.post('/user', FBAuth, AddUserDetails)




//exporting app & setting region to decrease latency
exports.api = functions.region('europe-west1').https.onRequest(app);