// db schema just for visualization

let db = {
    users: [
        {
            userID: 'Ix0f7vaz7ErBWb9J61Gh',
            email: 'user@email.com',
            handle: 'user',
            createdAt: '2020-06-29T18:00:58.455Z',
            imageUrl: 'https://firebasestorage.googleapis.com/v0/b/dogeposting-cdbdd.appspot.com/o/5463989.png?alt=media',
            bio: 'some information text',
            location: 'Alexandria, Egypt',
            website: 'http://github.io/xnxx'
        }
    ],
    screams: [
        {
            screamID: "Ix0f7vaz7ErBWb9J61Gh",
            userHandle: "username",
            body: 'post is post is post',
            createdAt: '2020-06-29T18:00:58.455Z',
            likeCount: 5 ,
            commentCount: 2
        }
    ]
}

const UserDetails = {
    credentials : {
        userID: 'Ix0f7vaz7ErBWb9J61Gh',
        email: 'user@email.com',
        handle: 'user',
        createdAt: '2020-06-29T18:00:58.455Z',
        imageUrl: 'https://firebasestorage.googleapis.com/v0/b/dogeposting-cdbdd.appspot.com/o/5463989.png?alt=media',
        bio: 'some information text',
        location: 'Alexandria, Egypt',
        website: 'http://github.io/xnxx'
    },
    likes : [
        {
            userHandle: 'user',
            screamID: "Ix0f7vaz7ErBWb9J61Gh" 
        },
        {
            userHandle: 'user',
            screamID: "Ix0f7vaz7ErBWb9J61Gh" 
        }
    ]
}