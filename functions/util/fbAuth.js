const {admin} = require('./admin')

//middleware for post request
//verifies token and adds user to the posted scream
module.exports = (req, res, next) => {
    let idToken
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else {
        console.error('No token found')
        return res.status(403).json({error: 'Unautorized'})
    }

    //verify token returns an promise with the decoded token object that contains user details
    admin.auth().verifyIdToken(idToken)
        .then(decodedToken => {
            req.user = decodedToken;
            return db.collection('users')
                .where('userID', '==', req.user.uid)
                .limit(1)
                .get();
        })
        .then(data => {
            req.user.handle = data.docs[0].data().handle
            return next()
        })
        .catch(err => {
            console.error('Error while verifying token')
            return res.status(403).json(err)
        }
    )
}