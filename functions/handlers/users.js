const {db} = require('./../util/admin')
const firebase = require('firebase')
const firebaseConfig = require('./../../keys/firebase-config.json')

firebase.initializeApp(firebaseConfig);

const { validateSignUpData, validateLoginData } = require('../util/validators')

//default user behaviour in firebase db only stores email and password
//we perform error checks (empty user/password/handle) and valid email
//we check for duplicate userID
// if all is valid we create a new user and set username(handle) as users collection ID
//TODO: add profile pic and shit 
exports.SignUp =  (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    };

    const {valid, errors} = validateSignUpData(newUser)
    if (!valid) return res.status(400).json(errors)

    let token, userID
    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if(doc.exists){
                return res.status(400).json({ handle: "LMAO handle already taken 🤣🤣" })
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
}

//responds bad request for empty email and password
//responds forbidden for wrong password
//responds with token to correct credentials
exports.Login = (req,res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };

    const {valid, errors} = validateLoginData(user)
    if (!valid) return res.status(400).json(errors)

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
            if (err.code=== "auth/wrong-password") return res.status(403).json({general: "Wrong credentials, try again 😜"})
            return res.status(500).json({err: err.code})
        }); 
}