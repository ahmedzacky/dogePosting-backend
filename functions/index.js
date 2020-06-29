const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebaseKey = require('./../keys/firebase-config.json')
const adminKey = require('./../keys/firebase-creds.json')
const app = require('express')()
const firebase = require('firebase');

//initializing stuff
admin.initializeApp({credential: admin.credential.cert(adminKey)});
firebase.initializeApp(firebaseKey)

//saving db in a const
const db=admin.firestore();

//get route for screams
app.get('/screams', (req, res) => {
    db
        .collection('screams')
        .orderBy('createdAt', 'desc')
        .get()
        .then(data =>{
            let screams = []
            data.forEach(doc => {
                screams.push({
                    screamID: doc.id,
                    ...doc.data()
                });
            })
            return res.json(screams);
        })
        .catch(err => console.error(err));
})

//posting a scream route
//to do : add validation and user onlys
app.post('/scream', (req,res)=> {
    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    };

    db
        .collection('screams')
        .add(newScream)
        .then(doc => {
            res.json({message : `document ${doc.id} created successfully`});
        })
        .catch(err => {
            res.status(500).json({error: 'wtf just happened'});
            console.error(err);
        });
});

const isEmail = email => {
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (email.match(regex)) return true
}
const isEmpty = string => ( string.trim() === '' );


//signup route
//default user behaviour in firebase db only stores email and password
//we perform error checks (empty user/password/handle) and valid email
//we check for duplicate userID
// if all is valid we create a new user and set username(handle) as users collection ID
//TODO: add profile pic and shit 
app.post('/signup', (req, res)=> {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    };

    let errors = {};

    if(isEmpty(newUser.email)){
        errors.email = "Must not be empty"
    } else if (!isEmail(newUser.email)){
        errors.email = "Must be a valid email address"
    }

    if(isEmpty(newUser.password)) errors.password = "Must not be empty"
    if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = "Passwords must match"

    if(isEmpty(newUser.handle)) errors.handle = "Must not be empty"

    if(Object.keys(errors).length > 0){
        return res.status(400).json(errors)
    }

    let token, userID
    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if(doc.exists){
                return res.status(400).json({ handle: "this handle is already taken" })
            } else {
                return firebase.auth()
                    .createUserWithEmailAndPassword(newUser.email, newUser.password)
            }
        })
        .then(data => {
            userID = data.user.uid
            return data.user.getIdToken();
        })
        .then(idToken => {
            token = idToken;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userID
            };
            db.doc(`/users/${newUser.handle}`).set(userCredentials)
        })
        .then(() => {
            return res.status(201).json({token});
        })
        .catch(err => {
            console.error(err)
            if(err.code === "auth/email-already-in-use"){
                return res.status(400).json({email: 'Email is already in use'})
            } else {
                return res.status(500).json({error: err.code})
            }
            
        })
})


//login route
//responds bad request for empty email and password
//responds forbidden for wrong password
//responds with token to correct credentials
app.post('/login', (req,res)=> {
    const user = {
        email: req.body.email,
        password: req.body.password
    };

    let errors = {};

    if(isEmpty(user.email)) errors.email = "Must not be empty"
    if(isEmpty(user.password)) errors.password = "Must not be empty"

    if(Object.keys(errors).length > 0) return res.status(400).json(errors)

    firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken()
        })
        .then(token => {
            return res.json({ token })
        })
        .catch(err =>{
            console.error(err)
            if (err.code=== "auth/wrong-password") return res.status(403).json({general: "Wrong credentials, please try again"})
            return res.status(500).json({err: err.code})
        }); 
});



//setting region to decrease latency
exports.api = functions.region('europe-west1').https.onRequest(app)