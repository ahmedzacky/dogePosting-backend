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

//adds user to the posted scream (from the authentication middleware(FBAuth))
exports.PostOneScream = (req,res) => {
    if (req.body.body.trim()=== ''){
        return res.status(400).json({body: 'Body shall not be empty' })
    }
    const newScream = {
        body: req.body.body,
        userHandle: req.user.handle,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0
    };

    db
        .collection('screams')
        .add(newScream)
        .then(doc => {
            const resScream = newScream
            resScream.screamID = doc.id;
            res.json(resScream);
        })
        .catch(err => {
            res.status(500).json({error: 'wtf just happened'});
            console.error(err);
        });
}

//Fetch one scream
exports.getScream = (req, res) => {
    let screamData = {};
    db.doc(`/screams/${req.params.screamID}`).get()
        .then(doc => {
            if(!doc.exists){
                return res.status(404).json({error: 'Scream dirty deleted 🤐'})
            }
            screamData = doc.data();
            screamData.screamID = doc.id
            return db
                .collection('comments')    
                .where('screamID', '==', req.params.screamID)
                .orderBy('createdAt', 'desc')
                .get();
        })
        .then(data => {
            screamData.comments = []
            data.forEach(comment => {
                console.log(comment)
                screamData.comments.push(comment.data())
            })
            return res.json(screamData)
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({error: err.code});
        });
}

//comment on a scream
exports.commentOnScream = (req, res) => {
    if(req.body.body.trim() === ''){
        return res.status(400).json({error: 'Must not be empty'})
    }
    const newComment = {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        screamID: req.params.screamID,
        userHandle: req.user.handle,
        userImage: req.user.imageUrl
    }

    db.doc(`/screams/${req.params.screamID}`).get()
        .then(doc => {
            if(!doc.exists){
                return res.status(404).json({error: 'Scream not found'})
            }
            return doc.ref.update({commentCount: doc.data().commentCount +1})
        })
        .then(() => {
            return db.collection('comments').add(newComment);
        })
        .then(() => res.json(newComment))
        .catch(err => {
            console.error(err);
            return res.status(500).json({error: 'Something went wrong'});
        })
}

//like a scream
exports.LikeScream = (req, res) => {
    const likeDocument = db
        .collection('likes')
        .where('userHandle', '==', req.user.handle)
        .where('screamID', '==', req.params.screamID).limit(1);

    const screamDocument = db.doc(`/screams/${req.params.screamID}`);

    let screamData = {}

    screamDocument.get()
        .then(doc => {
            if(doc.exists){
                screamData = doc.data();
                screamData.screamID= doc.id;
                return likeDocument.get();
            } else {
                return res.status(404).json({error: 'Scream not found'})
            }
        })
        .then(data => {
            if(data.empty){
                return db.collection('likes').add({
                    screamID : req.params.screamID,
                    userHandle: req.user.handle,
                    likedAt: new Date().toISOString()
                })
                .then(() => {
                    screamData.likeCount++
                    return screamDocument.update({likeCount: screamData.likeCount})
                })
                .then(() => res.json(screamData))
            } else {
                return res.status(400).json({err: 'Scream already liked'})
            }
        })
        .catch(err => {
            res.status(500).json({error : err.code});
        })

}

//unlike a scream
exports.UnlikeScream = (req, res) => {
   const likeDocument = db
        .collection('likes')
        .where('userHandle', '==', req.user.handle)
        .where('screamID', '==', req.params.screamID).limit(1);

    const screamDocument = db.doc(`/screams/${req.params.screamID}`);

    let screamData = {}

    screamDocument.get()
        .then(doc => {
            if(doc.exists){
                screamData = doc.data();
                screamData.screamID= doc.id;
                return likeDocument.get();
            } else {
                return res.status(404).json({error: 'Scream not found'})
            }
        })
        .then(data => {
            if(data.empty){
                return res.status(400).json({err: 'Scream not liked'})
            } else {
                return db.doc(`/likes/${data.docs[0].id}`).delete()
                .then(() => {
                    screamData.likeCount--
                    return screamDocument.update({likeCount: screamData.likeCount})
                })
                .then(() => res.json(screamData))
            }
        })
        .catch(err => {
            console.error(err)
            return res.status(500).json({error : err.code});
        })
}

//delete a scream
exports.DeleteScream = (req, res) => {
    const toBeDeleted = db.doc(`/screams/${req.params.screamID}`);
    toBeDeleted.get()
        .then(doc =>{
            if(!doc.exists){
                return res.status(404).json({error: 'Scream not found'})
            } 
            if(doc.data().userHandle !== req.user.handle){
                return res.status(403).json({error : 'unauthorized'})
            } else return toBeDeleted.delete()
        })
        .then(() => res.json({message: 'Scream deleted 🥵'}))
        .catch(err => {
            console.error(err)
            return res.status(500).json({error : err.code});
        })

}