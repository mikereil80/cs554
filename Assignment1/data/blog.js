// Michael Reilly 10439198
// I pledge my honor that I have abided by the Stevens Honor System.

const mongoCollections = require('../config/mongoCollections');
const blog = mongoCollections.blog;

let { ObjectId } = require('mongodb');
let objectid = require('bson').ObjectID;

async function getTake(skip, take){
    // Gets Post based off given skip and take values.
    // Error Checking
    if(typeof skip !== 'number'){
        throw '?skip is not a number';
    }
    if(isNaN(skip)){
        throw '?skip is NaN';
    }
    if(skip < 0){
        throw `?skip is negative.`;
    }
    if((skip - Math.floor(skip)) !== 0){
        throw `?skip is not a whole number.`;
    }
    if(typeof take !== 'number'){
        throw '?take is not a number';
    }
    if(isNaN(take)){
        throw '?take is NaN';
    }
    if(take < 0){
        throw `?take is negative.`;
    }
    if((take - Math.floor(take)) !== 0){
        throw `?take is not a whole number.`;
    }
    let take_use=take;
    if(take>100){
        take_use=100;
    }

    if(take==0){
        return [];
    }
    else{
        const blogCollection = await blog();
        // For the .limit() and .skip() schema, was found here: https://www.w3resource.com/mongodb/mongodb-skip-limit.php
        const fin = await blogCollection.find({}).skip(skip).limit(take_use).toArray();
        return fin;
    }
}

async function getBlogById(id){
    // Finds blog with the given id.
    // Error Checking
    if(id === undefined || id === null){
        throw 'No id parameter is given to the getBlogById(id) function.';
    }
    if(typeof id !== 'string'){
        throw 'Input id in getBlogById(id) is not of type string.';
    }
    if(id.length == 0){
        throw 'Input id in getBlogById(id) length is 0, empty string.';
    }
    // found on https://stackoverflow.com/questions/10261986/how-to-detect-string-which-contains-only-spaces
    if(id.replace(/\s/g, '').length == 0) {
        throw 'Input id in getBlogById(id) is only empty spaces.';
    }

    let parsedId = ObjectId(id);

    // To double check conversion safely occurred:
    // found on https://stackoverflow.com/questions/44265981/what-is-the-difference-between-new-objectid-and-new-objectid-and-objectid
    if(!(parsedId instanceof ObjectId)){
        throw 'Input id in getBookById(id) is not an instance of an ObjectId.';
    }

    const blogCollection = await blog();
    const currBlog = await blogCollection.findOne({ _id: parsedId });
    if(!currBlog){
        throw "Blog not found";
    }
    else{
        const ret = currBlog;
        return ret;
    }

}

async function create(title, body, user){
    // Creates a blog with given title, body, and records user that posted it.
    // Error Checking
    if(title === undefined || title === null){
        throw 'No title parameter given for create(title, body, username).';
    }
    if(typeof title !== 'string'){
        throw 'Input title in create(title, body, username) is not of type string.';
    }
    if(title.length == 0){
        throw 'Input title in create(title, body, username) length is 0, empty string.';
    }
    // found on https://stackoverflow.com/questions/10261986/how-to-detect-string-which-contains-only-spaces
    if(title.replace(/\s/g, '').length == 0) {
        throw 'Input title in create(title, body, username) is only empty spaces.';
    }
    if(body === undefined || body === null){
        throw 'No body parameter given for create(title, body, username).';
    }
    if(typeof body !== 'string'){
        throw 'Input body in create(title, body, username) is not of type string.';
    }
    if(body.length == 0){
        throw 'Input body in create(title, body, username) length is 0, empty string.';
    }
    // found on https://stackoverflow.com/questions/10261986/how-to-detect-string-which-contains-only-spaces
    if(body.replace(/\s/g, '').length == 0) {
        throw 'Input body in create(title, body, username) is only empty spaces.';
    }

    const blogCollection  = await blog();
    const currUser = { _id: user._id.toString(), username: user.username.toString() };

    let newBlog = {
        title: title,
        body: body,
        userThatPosted: currUser,
        comments: []
    };

    const insertInformation = await blogCollection.insertOne(newBlog);

    if(insertInformation.insertedCount === 0){
        throw "User not inserted successfully";
    }
    else{
        return await this.getBlogById(insertInformation.insertedId.toString());
    }


}

async function updateBlog(id, title, body, bool, patchBlog){
    // Updates the title and/or body of the blog as long as user is the same.
    // Error Checking
    if(bool == true){
        if(title === undefined || title === null){
            throw 'No title parameter given for updateBlog(id, title, body, bool, patchBlog).';
        }
        if(typeof title !== 'string'){
            throw 'Input title in updateBlog(id, title, body, bool, patchBlog) is not of type string.';
        }
        if(title.length == 0){
            throw 'Input title in updateBlog(id, title, body, bool, patchBlog) length is 0, empty string.';
        }
        // found on https://stackoverflow.com/questions/10261986/how-to-detect-string-which-contains-only-spaces
        if(title.replace(/\s/g, '').length == 0) {
            throw 'Input title in updateBlog(id, title, body, bool, patchBlog) is only empty spaces.';
        }
        if(body === undefined || body === null){
            throw 'No body parameter given for updateBlog(id, title, body, bool, patchBlog).';
        }
        if(typeof body !== 'string'){
            throw 'Input body in updateBlog(id, title, body, bool, patchBlog) is not of type string.';
        }
        if(body.length == 0){
            throw 'Input body in updateBlog(id, title, body, bool, patchBlog) length is 0, empty string.';
        }
        // found on https://stackoverflow.com/questions/10261986/how-to-detect-string-which-contains-only-spaces
        if(body.replace(/\s/g, '').length == 0) {
            throw 'Input body in updateBlog(id, title, body, bool, patchBlog) is only empty spaces.';
        }

        const updatedBlog = {title: title, body: body};
        let updatedBlogData = {};

        let updateData = Object.assign(updatedBlogData, updatedBlog);

        let parsedId = ObjectId(id);

        // To double check conversion safely occurred:
        // found on https://stackoverflow.com/questions/44265981/what-is-the-difference-between-new-objectid-and-new-objectid-and-objectid
        if(!(parsedId instanceof ObjectId)){
            throw 'Input id in updateBlog(id, title, body, bool) is not an instance of an ObjectId.';
        }

        const blogCollection = await blog();
        const blogs = await blogCollection.findOne({ _id: parsedId });
        if(blogs === undefined || blogs === null){
            throw 'Blog not found.';
        }

        const updateInfo = await blogCollection.updateOne(
            { _id: parsedId },
            { $set: updateData }
        );
        if(!updateInfo.matchedCount && !updateInfo.modifiedCount){
            throw 'Update failed';
        }
        else{
            return await this.getBlogById(id.toString());
        }
    }
    else{
        if(title !== undefined || title !== null){
            if(typeof title !== 'string'){
                throw 'Input title in updateBlog(id, title, body, bool, patchBlog) is not of type string.';
            }
            if(title.length == 0){
                throw 'Input title in updateBlog(id, title, body, bool, patchBlog) length is 0, empty string.';
            }
            // found on https://stackoverflow.com/questions/10261986/how-to-detect-string-which-contains-only-spaces
            if(title.replace(/\s/g, '').length == 0) {
                throw 'Input title in updateBlog(id, title, body, bool, patchBlog) is only empty spaces.';
            }   
        }
        if(body !== undefined || body !== null){
            if(typeof body !== 'string'){
                throw 'Input body in updateBlog(id, title, body, bool, patchBlog) is not of type string.';
            }
            if(body.length == 0){
                throw 'Input body in updateBlog(id, title, body, bool, patchBlog) length is 0, empty string.';
            }
            // found on https://stackoverflow.com/questions/10261986/how-to-detect-string-which-contains-only-spaces
            if(body.replace(/\s/g, '').length == 0) {
                throw 'Input body in updateBlog(id, title, body, bool, patchBlog) is only empty spaces.';
            }
        }

        let updatedBlogData = {};

        let updateData = Object.assign(updatedBlogData, patchBlog)

        let parsedId = ObjectId(id);

        // To double check conversion safely occurred:
        // found on https://stackoverflow.com/questions/44265981/what-is-the-difference-between-new-objectid-and-new-objectid-and-objectid
        if(!(parsedId instanceof ObjectId)){
            throw 'Input id in updateBlog(id, title, body, bool, patchBlog) is not an instance of an ObjectId.';
        }

        const blogCollection = await blog();
        const blogs = await blogCollection.findOne({ _id: parsedId });
        if(blogs === undefined || blogs === null){
            throw 'Blog not found.';
        }

        const updateInfo = await blogCollection.updateOne(
            { _id: parsedId },
            { $set: updateData }
        );
        if(!updateInfo.matchedCount && !updateInfo.modifiedCount){
            throw 'Update failed';
        }
        else{
            return await this.getBlogById(id.toString());
        }
    }

}

async function commentBlog(blogs, comment, user){
    // Creates a new comment for the current blog under the current user.
    // Error Checking
    if(comment === undefined || comment === null){
        throw 'No comment parameter given for commentBlog(blog, comment, user).';
    }
    if(typeof comment !== 'string'){
        throw 'Input comment in commentBlog(blog, comment, user) is not of type string.';
    }
    if(comment.length == 0){
        throw 'Input comment in commentBlog(blog, comment, user) length is 0, empty string.';
    }
    // found on https://stackoverflow.com/questions/10261986/how-to-detect-string-which-contains-only-spaces
    if(comment.replace(/\s/g, '').length == 0) {
        throw 'Input comment in commentBlog(blog, comment, user) is only empty spaces.';
    }

    const blogCollection = await blog();

    let parsedId = ObjectId(blogs._id);

    // To double check conversion safely occurred:
    // found on https://stackoverflow.com/questions/44265981/what-is-the-difference-between-new-objectid-and-new-objectid-and-objectid
    if(!(parsedId instanceof ObjectId)){
        throw 'Input blogId in commentBlog(blog, comment, user) is not an instance of an ObjectId.';
    }

    let parsedId2 = ObjectId(user._id);

    if(!(parsedId2 instanceof ObjectId)){
        throw 'Input userId in commentBlog(blog, comment, user) is not an instance of an ObjectId.';
    }

    // to generate an ObjectId: https://stackoverflow.com/questions/10593337/is-there-any-way-to-create-mongodb-like-id-strings-without-mongodb
    let newComment = {
        "_id": new objectid(),
        "userThatPostedComment": { _id: parsedId2, username: user.username.toString() },
        "comment": comment
    }

    const newInsertInformation = await blogCollection.updateOne(
        { _id: blogs._id },
        { $addToSet: { comments: newComment }});
    if(newInsertInformation.modifiedCount === 0){
        throw "Update Failed";
    }
    else{
        return await this.getBlogById(blogs._id.toString());
    }
}

async function getCommentById(blog, commentId){
    // Gets the comment with the given id from the blog provided.
    // Error Checking
    if(commentId === undefined || commentId === null){
        throw 'No commentId parameter is given to the getCommentById(blog, commentId) function.';
    }
    if(typeof commentId !== 'string'){
        throw 'Input commentId in getCommentById(blog, commentId) is not of type string.';
    }
    if(commentId.length == 0){
        throw 'Input commentId in getCommentById(blog, commentId) length is 0, empty string.';
    }
    // found on https://stackoverflow.com/questions/10261986/how-to-detect-string-which-contains-only-spaces
    if(commentId.replace(/\s/g, '').length == 0) {
        throw 'Input id in getCommentById(blog, commentId) is only empty spaces.';
    }

    let parsedId = ObjectId(blog._id);
    let parsedId2 = ObjectId(commentId);

    // To double check conversion safely occurred:
    // found on https://stackoverflow.com/questions/44265981/what-is-the-difference-between-new-objectid-and-new-objectid-and-objectid
    if(!(parsedId instanceof ObjectId)){
        throw 'Input blogId in getCommentById(blog, comment) is not an instance of an ObjectId.';
    }

    // To double check conversion safely occurred:
    // found on https://stackoverflow.com/questions/44265981/what-is-the-difference-between-new-objectid-and-new-objectid-and-objectid
    if(!(parsedId2 instanceof ObjectId)){
        throw 'Input commentId in getCommentById(blog, comment) is not an instance of an ObjectId.';
    }

    const blogCollection = await blog();

    let comments = await blogCollection.findOne({ _id : parsedId, "comment._id": commentId });
    if(comments === undefined || comments === null){
        throw 'Could not find comment with given id'
    }
    else{
        let final = {};
        final = comment;
        final._id = commentId;
        return final;
    }

}

async function deleteComment(blogs, comment){
    // Deletes the given comment from the given blog.
    // Error Checking

    let parsedId = ObjectId(comment._id);

    // To double check conversion safely occurred:
    // found on https://stackoverflow.com/questions/44265981/what-is-the-difference-between-new-objectid-and-new-objectid-and-objectid
    if(!(parsedId instanceof ObjectId)){
        throw 'Input commentId in deleteComment(blog, comment) is not an instance of an ObjectId.';
    }

    let parsedId2 = ObjectId(blogs._id);

    if(!(parsedId2 instanceof ObjectId)){
        throw 'Input blogId in deleteComment(blog, comment) is not an instance of an ObjectId.';
    }

    const blogCollection = await blog();

    const updateInfo = await blogCollection.updateOne(
        { _id: parsedId2},
        { $pull: { comments: { _id: parsedId }}}
    )
    if(!updateInfo.matchedCount && !updateInfo.modifiedCount){
        throw 'Remove Failed';
    }
    else{
        return {"commentId": comment._id, "deleted": true};
    }
}

module.exports = {
    getTake,
    getBlogById,
    create,
    updateBlog,
    commentBlog,
    getCommentById,
    deleteComment
}