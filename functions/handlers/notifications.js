const {db} = require('./../util/admin')

//self note//
//check or return following fuctions in index.js
//self note end//


exports.NotificationOnLike = (snapshot) => {
    db.doc(`/screams/${snapshot.data().screamID}`).get()
    .then(doc =>{
        if(doc.exists && doc.data().userHandle !== snapshot.data().handle){
            return db.doc(`/notifications/${snapshot.id}`).set({
                createdAt : new Date().toISOString(),
                recepient: doc.data().userHandle,
                sender: snapshot.data().userHandle,
                type: 'like',
                read: false,
                screamID: doc.id
            });
        }
        
        else if(doc.exists && doc.data().userHandle === snapshot.data().handle){
            return db.doc(`/notifications/${snapshot.id}`).set({
                createdAt : new Date().toISOString(),
                recepient: doc.data().userHandle,
                sender: 'A retard 😬',
                type: 'like',
                read: false,
                screamID: doc.id
            });
        }
    })
    .catch(err => console.error(err));
}


exports.NotificationOnUnlike = (snapshot) => {
    db.doc(`/notifications/${snapshot.id}`)
    .delete()
    .catch(err => console.error(err))
}

exports.NotificationOnComment = (snapshot) => {
    db.doc(`/screams/${snapshot.data().screamID}`).get()
    .then(doc =>{
        if(doc.exists && doc.data().userHandle !== snapshot.data().handle){
            return db.doc(`/notifications/${snapshot.id}`).set({
                createdAt : new Date().toISOString(),
                recepient: doc.data().userHandle,
                sender: snapshot.data().userHandle,
                type: 'comment',
                read: false,
                screamID: doc.id
            });
        }
        else if(doc.exists && doc.data().userHandle === snapshot.data().handle){
            return db.doc(`/notifications/${snapshot.id}`).set({
                createdAt : new Date().toISOString(),
                recepient: doc.data().userHandle,
                sender: 'A retard 😬',
                type: 'comment',
                read: false,
                screamID: doc.id
            });
        }
        
    })
    .catch(err => console.error(err));
}