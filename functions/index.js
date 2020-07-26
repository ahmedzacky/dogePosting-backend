const functions = require('firebase-functions');
const {db} = require('./util/admin')
const app = require('express')()
const FBAuth = require('./util/fbAuth')
const { 
    getAllScreams, 
    PostOneScream, 
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
    getAuthenticatedUser,
    GetUserDetails,
    MarkNotificationsRead
} = require('./handlers/users')

const cors = require('cors')

app.use(cors())


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

//get authenticated user details
app.get('/user', FBAuth, getAuthenticatedUser)

//upload profile pic route
app.post('/user/image', FBAuth, UploadImage)

//add user details
app.post('/user', FBAuth, AddUserDetails)

//get a users details
app.get('/user/:handle', GetUserDetails)

//set notifications as read
app.post('/notifications', FBAuth, MarkNotificationsRead)



//exporting app endpoints & setting region to decrease latency
exports.api = functions.region('europe-west3').https.onRequest(app);

//notification db triggers
const {
    NotificationOnLike,
    NotificationOnUnlike,
    NotificationOnComment
} = require('./handlers/notifications');

//like notification
exports.createNotificationOnLike = functions
    .region('europe-west3')
    .firestore
    .document('likes/{id}')
    .onCreate(snapshot => {
        return NotificationOnLike(snapshot)
})

//remove like notification on unlike
exports.deleteNotificationOnUnlike = functions
    .region('europe-west3')
    .firestore
    .document('likes/{id}')
    .onDelete(snapshot => {
        return NotificationOnUnlike(snapshot)
})

//comment notification
exports.createNotificationOnComment = functions
    .region('europe-west3')
    .firestore
    .document('comments/{id}')
    .onCreate(snapshot => {
        return NotificationOnComment(snapshot)
})

//comment notification
exports.onUserImageChange = functions
    .region('europe-west3')
    .firestore
    .document('users/{userID}')
    .onUpdate(change => {
        if(change.before.data().imageUrl !== change.after.data().imageUrl){
            const batch = db.batch()
            return db
            .collection('screams')
            .where('userHandle', '==', change.before.data().handle)
            .get()
            .then(data =>{
                data.forEach(doc =>{
                    const scream = db.doc(`/screams/${doc.id}`)
                    batch.update(scream, {userImage: change.after.data().imageUrl})
                }) 
                return db
                .collection('comments')
                .where('userHandle', '==', change.before.data().handle)
                .get()
            })
            .then(data => {
                data.forEach(doc =>{
                    const comment = db.doc(`/comments/${doc.id}`)
                    batch.update(comment, {userImage: change.after.data().imageUrl})
                }) 
                return batch.commit()
            })
        } else return true    
});


//delete comments, likes, notifications on scream delete
exports.onScreamDelete = functions
    .region('europe-west3')
    .firestore
    .document('screams/{screamID}')
    .onDelete((_snapshot, context) => {
        const screamID = context.params.screamID;
        const batch = db.batch();
        return db
        .collection('comments')
        .where('screamID', '==', screamID)
        .get()
        .then(data => {
            data.forEach(doc =>{
                batch.delete(db.doc(`/comments/${doc.id}`));
            })
            return db 
            .collection('likes')
            .where('screamID', '==', screamID)
            .get()
        })
        .then(data => {
            data.forEach(doc =>{
                batch.delete(db.doc(`/likes/${doc.id}`));
            })
            return db 
            .collection('notifications')
            .where('screamID', '==', screamID)
            .get()
        })
        .then(data => {
            data.forEach(doc =>{
                batch.delete(db.doc(`/notifications/${doc.id}`));
            })
            return batch.commit()
        })  
        .catch(error => console.error(error))
})