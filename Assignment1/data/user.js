// Michael Reilly 10439198
// I pledge my honor that I have abided by the Stevens Honor System.

const mongoCollections = require('../config/mongoCollections');
const user = mongoCollections.user;

async function GetUserByUserName(username){
    // Return the user document with username
    // BAsed heavily on my Final Project code from last year

    // Error checking
    if(!username){
        throw 'No username parameter is given to the GetUserByUserName(username) function.';
    }
    if(typeof username !== 'string'){
        throw 'Input username in GetUserByUserName(username) is not of type string.';
    }
    if(username.length == 0){
        throw 'Input username in GetUserByUserName(username) length is 0, empty string.';
    }
    if(username.replace(/\s/g, '').length == 0) {
        throw 'Input username in GetUserByUserName(username) is only empty spaces.';
    }

    const userCollection = await user();
    const users = await userCollection.findOne({ username: username });
    if(!users){
        throw 'User not found.';
    }
    else{
        let final = users;
        final._id=users._id.toString();
        return final;
    }
}

async function CreateUser(name, username, hashedPassword){
    // Based heavily on final project code from last year

    // Error Checking
    name = name.trim();
    username = username.trim();;

    if(!name) throw "No Name Provided";
    if(!username) throw "No Username Provided";
    if(!hashedPassword) throw "No Password Provided";
    if(typeof name !== 'string'){
        throw 'Input nameame in CreateUser(name, username, hashedPassword) is not of type string.';
    }
    if(name.length == 0){
        throw 'Input nameame in CreateUser(name, username, hashedPassword) length is 0, empty string.';
    }
    if(name.replace(/\s/g, '').length == 0) {
        throw 'Input name in CreateUser(name, username, hashedPassword) is only empty spaces.';
    }
    if(typeof username !== 'string'){
        throw 'Input username in CreateUser(name, username, hashedPassword) is not of type string.';
    }
    if(username.length == 0){
        throw 'Input username in CreateUser(name, username, hashedPassword) length is 0, empty string.';
    }
    if(username.replace(/\s/g, '').length == 0) {
        throw 'Input username in CreateUser(name, username, hashedPassword) is only empty spaces.';
    }
    if(typeof hashedPassword !== 'string'){
        throw 'Input hashedPassword in CreateUser(name, username, hashedPassword) is not of type string.';
    }
    if(hashedPassword.length == 0){
        throw 'Input hashedPassword in CreateUser(name, username, hashedPassword) length is 0, empty string.';
    }
    if(hashedPassword.replace(/\s/g, '').length == 0) {
        throw 'Input hashedPassword in CreateUser(name, username, hashedPassword) is only empty spaces.';
    }

    const userCollection  = await user();

    //Throw exception if username is in use
    await userCollection.findOne({username: username}).then((exist) => {
        if (exist) throw "Username Already In Use";
    });


    let newUser = {
        name: name,
        username: username,
        password: hashedPassword,
    };

    const insertInformation = userCollection.insertOne(newUser);

    if(insertInformation.insertedCount === 0){
        throw "User not inserted successfully";
    }
    else{
        return newUser;
    }

}

module.exports = {
    GetUserByUserName,
    CreateUser
}