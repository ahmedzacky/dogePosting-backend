//checks for empty string and email regex
const isEmail = email => {
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (email.match(regex)) return true
}

const isEmpty = string => string.trim() === '';

const angryRes =  "Must not be empty 😡";

exports.validateSignUpData = data => {
    let errors = {};

    if(isEmpty(data.email)){
        errors.email = angryRes
    } else if (!isEmail(data.email)){
        errors.email = "Must be a valid email 😡"
    }

    if(isEmpty(data.password)) errors.password =  angryRes
    if(data.password !== data.confirmPassword) errors.confirmPassword = "Passwords must match 😡"

    if(isEmpty(data.handle)) errors.handle =  angryRes
    if(data.handle.startsWith('@')) errors.handle = 'handle cannot start with @'
    return {
        errors,
        valid: Object.keys(errors).length === 0
    }
}


exports.validateLoginData = data => {
    let errors = {};

    if(isEmpty(data.email)) errors.email = angryRes
    if(isEmpty(data.password)) errors.password = angryRes

    return {
        errors,
        valid: Object.keys(errors).length === 0
    }
}

// we'll make sure from the frontend to send all three props even if empty
// however we only add to db properties of value not empty strings
exports.reduceUserDetails = data => {
    let userDetails = {}
    if(!isEmpty(data.bio)) userDetails.bio = data.bio.trim()
    if(!isEmpty(data.website)){
        if (data.website.trim().substring(0,4)!== 'http'){
            userDetails.website = `http://${data.website.trim()}`
        } else userDetails.website = data.website.trim()
    } 
    if(!isEmpty(data.location)) userDetails.location = data.location.trim()

    return userDetails
}