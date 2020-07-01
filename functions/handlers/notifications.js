const {db} = require('./../util/admin')

exports.NotificationOnLike = (snapshot) => {
    db.doc(`/screams/${snapshot.data().screamID}`).get()
    .then(doc =>{
        return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt : new Date().toISOString(),
            recepient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'like',
            read: false,
            screamID: doc.id
        });
    })
    .then(() => { return })
    .catch(err => {
        console.error(err)
        return
    });
}


exports.NotificationOnUnlike = (snapshot) => {
    db.doc(`/notifications/${snapshot.id}`)
        .delete()
        .catch(err =>{
            console.error(err)
            return
        })
}

exports.NotificationOnComment = (snapshot) => {
    db.doc(`/screams/${snapshot.data().screamID}`).get()
    .then(doc =>{
        return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt : new Date().toISOString(),
            recepient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'comment',
            read: false,
            screamID: doc.id
        });
    })
    .then(() => { return })
    .catch(err => {
        console.error(err)
        return
    });
}