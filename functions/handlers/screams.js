const {db} = require('./../util/admin')

exports.getAllScreams = (req, res) => {
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
}

exports.getAllUsers = (req, res) => {
    db
        .collection('users')
        .get()
        .then(data =>{
            let users = []
            data.forEach(doc => {
                users.push({
                    ...doc.data()
                });
            })
            return res.json(users);
        })
        .catch(err => console.error(err));
}

exports.PostOneScream = (req,res) => {
    if (req.body.body.trim()=== ''){
        return res.status(400).json({body: 'Body shall not be empty' })
    }
    const newScream = {
        body: req.body.body,
        userHandle: req.user.handle,
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
}