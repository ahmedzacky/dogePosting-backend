const {db, admin} = require('./../util/admin')
const firebase = require('firebase')
const firebaseConfig = require('../keys/firebase-config')

firebase.initializeApp(firebaseConfig);

const { 
    validateSignUpData, 
    validateLoginData, 
    reduceUserDetails 
} = require('../util/validators')

//default user behaviour in firebase db only stores email and password
//we perform error checks (empty user/password/handle) and valid email
//we check for duplicate userID
// if all is valid we create a new user and set username(handle) as users collection's ID
exports.SignUp =  (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    };

    const {valid, errors} = validateSignUpData(newUser)
    if (!valid) return res.status(400).json(errors)

    const noImg = 'doge.jpg'

    let token, userID
    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if(doc.exists){
                return res.status(400).json({ handle: "LMAO handle taken 🤣🤣" })
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
                imageUrl: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${noImg}?alt=media`,
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
                return res.status(500).json({general: 'Something went wrong , try again 👦'})
            }
            
        })
}

//responds forbidden for wrong password
//responds with token only to correct credentials
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

//Add user detail
exports.AddUserDetails = (req,res) => {
    let userDetails = reduceUserDetails(req.body)
    db.doc(`/users/${req.user.handle}`).update(userDetails)
        .then(() => res.json({message: "Thanks for the data 😜"}))
        .catch(err => {
            console.error(err);
            return res.status(500).json({error: err.code})
        })
}


//Get any user details
exports.GetUserDetails = (req,res) => {
    let userData = {};
    db.doc(`/users/${req.params.handle}`).get()
    .then(doc => {
        if(doc.exists){
            userData.user = doc.data()
            return db
            .collection('screams')
            .where('userHandle', '==', req.params.handle)
            .orderBy('createdAt', 'desc')
            .get()
        } return res.status(404).json({error: "User is dead 👅"})
    })
    .then(data => {
        userData.screams = []
        data.forEach(doc => {
            userData.screams.push({
                screamID: doc.id,
                ...doc.data()
            })
        })
        return res.json(userData)
    })
    .catch(err => {
        console.error(err)
        return res.status(500).json({error : err.code})
    })
}



//Get own user details
exports.getAuthenticatedUser= (req,res) => {
    let userData = {}
    db.doc(`/users/${req.user.handle}`).get()
        .then(doc => {
            userData.credentials = doc.data();
            return db
                    .collection('likes')
                    .where('userHandle', '==', req.user.handle)
                    .get()
        })
        .then(data => {
            if(data)
            userData.likes = []
            data.forEach(doc => {
                userData.likes.push(doc.data())
            });
            return db
                    .collection('notifications')
                    .where('recepient', '==', req.user.handle)
                    .orderBy('createdAt', 'desc')
                    .limit(10)
                    .get()
        })
        .then(data => {
            userData.notifications = []
            data.forEach(doc => {
                userData.notifications.push({
                    notificationID : doc.id,
                    ...doc.data()
                })
            })
            return res.json(userData)
        })
        .catch(err =>{
            console.error(err)
            return res.status(500).json({error : err.code})
        })

}

//Upload profile image
exports.UploadImage = (req, res) => {
    const BusBoy = require('busboy')
    const path = require('path')
    const os = require('os')
    const fs = require('fs')

    const busboy = new BusBoy ({ headers: req.headers })
    let imageFileName;
    let imageToBeUploaded = {}
    busboy.on('file', (fieldname, file, filename, encoding, mimetype)=> {
        if(mimetype !== 'image/jpeg' && mimetype !== 'image/png'){
            return res.status(400).json({error: "Wrong file type 👿"})
        }
        // my.image.png
        // we split into words by "." then take the last one
        const imageExtension = filename.split('.').pop()
            
        //why waste data
        imageFileName = `${req.user.handle}-${new Date().getTime()}.${imageExtension}`
        const filepath = path.join(os.tmpdir(), imageFileName)
        imageToBeUploaded = {filepath, mimetype}
        file.pipe(fs.createWriteStream(filepath))
    });
    busboy.on('finish', ()=> {
        admin
            .storage()
            .bucket(firebaseConfig.storageBucket)
            .upload(imageToBeUploaded.filepath, {
                resumable: false,
                metadata : {
                    metadata : {
                        contentType: imageToBeUploaded.mimetype
                    }
                }
            })
        .then(() => {
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFileName}?alt=media`
            return db.doc(`/users/${req.user.handle}`).update({ imageUrl });
        })
        .then(()=> ( res.json({message: "Image Uploaded successfully 😇"})))
        .catch(err => {
            console.error(err)
            return res.status(500).json({error: err.code})
        });
    });

    busboy.end(req.rawBody)

}

//Mark notification as read
exports.MarkNotificationsRead = (req,res) => {
    let batch = db.batch();
    req.body.forEach(notificationID => {
        const notification = db.doc(`/notifications/${notificationID}`)
        batch.update(notification, { read :true })
    });
    batch.commit()
    .then(() => res.json({message : 'Notifications marked read'}))
    .catch(err =>{
        console.error(err)
        return res.status(500).json({error: err.code})
    })   
}