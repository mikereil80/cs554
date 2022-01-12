// Michael Reilly 10439198
// I pledge my honor that I have abided by the Stevens Honor System.

const express = require('express');
const router = express.Router();
const data = require('../data');
const bcrypt = require('bcryptjs');
const xss = require('xss');
const saltRounds = 16;
const blogData = data.blog;
const userData = data.user;

router.get('/', async (req, res) => {
    try{
        // Check for take
        if(req.query.take){
            //Error checking
            if(typeof req.query.take !== 'number'){
                res.status(400).json({ error: '?take is not a number'});
                return;
            }
            if(isNaN(req.query.take)){
                res.status(400).json({ error: '?take is NaN'});
                return;
            }
            if(req.query.take < 0){
                res.status(400).json({ error: `?take is negative.`});
                return;
            }
            if((req.query.take - Math.floor(req.query.take)) !== 0){
                res.status(400).json({ error: `?take is not a whole number.`});
                return;
            }
            let take;
            if(req.query.take>100){
                take=100;
            }
            else{
                take=req.query.take;
            }
            // then check for skip
            if(req.query.skip){
                if(typeof req.query.skip !== 'number'){
                    res.status(400).json({ error: '?skip is not a number'});
                    return;
                }
                if(isNaN(req.query.skip)){
                        res.status(400).json({ error: '?skip is NaN'});
                        return;
                }
                if(req.query.skip < 0){
                    res.status(400).json({ error: `?skip is negative.`});
                    return;
                }
                if((req.query.skip - Math.floor(req.query.skip)) !== 0){
                    res.status(400).json({ error: `?skip is not a whole number.`});
                    return;
                }
                const blogs = await blogData.getTake(req.query.skip, take);
                res.status(200).json(blogs);
            }
            else{
                const blogs = await blogData.getTake(0, take);
                res.status(200).json(blogs);
            }
        }
        else{
            // gotta check for skip twice
            if(req.query.skip){
                if(typeof req.query.skip !== 'number'){
                    res.status(400).json({ error: '?skip is not a number'});
                    return;
                }
                if(isNaN(req.query.skip)){
                        res.status(400).json({ error: '?skip is NaN'});
                        return;
                }
                if(req.query.skip < 0){
                    res.status(400).json({ error: `?skip is negative.`});
                    return;
                }
                if((req.query.skip - Math.floor(req.query.skip)) !== 0){
                    res.status(400).json({ error: `?skip is not a whole number.`});
                    return;
                }
                const blogs = await blogData.getTake(req.query.skip, 20);
                res.status(200).json(blogs);
            }
            else{
                const blogs = await blogData.getTake(0, 20);
                res.status(200).json(blogs);
            }
        }
    } catch (e) {
        res.status(500).json({ error: "Could not get blogs." });
    }
});

router.get('/logout', async (req, res) => {
    // Is a version of logout route from my Final Project last year
    req.session.destroy();
    res.status(200).json({ message: "User Logged Out"});
});

router.post('/signup', async (req, res) => {
    // Is a modified version of signup route from my Final Project last year
    let {name, username, password} = req.body;

    name = xss(name);
    username = xss(username);
    password = xss(password);

    // Error Checking
    if(name === undefined || name === null){
        res.status(400).json({ error: 'No name parameter is given to CreateUser(name, username, password).' });
        return;
    }
    if(typeof name !== 'string'){
        res.status(400).json({ error: 'Input name in CreateUser(name, username, password) is not of type string.' });
        return;
    }
    if(name.length == 0){
        res.status(400).json({ error: 'Input name in CreateUser(name, username, password) length is 0, empty string.' });
        return;
    }
    // found on https://stackoverflow.com/questions/10261986/how-to-detect-string-which-contains-only-spaces
    if(name.replace(/\s/g, '').length == 0) {
        res.status(400).json({ error: 'Input name in CreateUser(name, username, password) is only empty spaces.' });
        return;
    }
    if(username === undefined || username === null){
        res.status(400).json({ error: 'No username parameter is given to CreateUser(name, username, password).' });
        return;
    }
    if(typeof username !== 'string'){
        res.status(400).json({ error: 'Input username in CreateUser(name, username, password) is not of type string.' });
        return;
    }
    if(username.length == 0){
        res.status(400).json({ error: 'Input username in CreateUser(name, username, password) length is 0, empty string.' });
        return;
    }
    // found on https://stackoverflow.com/questions/10261986/how-to-detect-string-which-contains-only-spaces
    if(username.replace(/\s/g, '').length == 0) {
        res.status(400).json({ error: 'Input username in CreateUser(name, username, password) is only empty spaces.' });
        return;
    }
    if(password === undefined || password === null){
        res.status(400).json({ error: 'No password parameter is given to CreateUser(name, username, password).' });
        return;
    }
    if(typeof password !== 'string'){
        res.status(400).json({ error: 'Input password in CreateUser(name, username, password) is not of type string.' });
        return;
    }
    if(password.length == 0){
        res.status(400).json({ error: 'Input password in CreateUser(name, username, password) length is 0, empty string.' });
        return;
    }
    // found on https://stackoverflow.com/questions/10261986/how-to-detect-string-which-contains-only-spaces
    if(password.replace(/\s/g, '').length == 0) {
        res.status(400).json({ error: 'Input password in CreateUser(name, username, password) is only empty spaces.' });
        return;
    }

    username = username.toLowerCase();

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    try {
        user = await userData.CreateUser(name, username, hashedPassword);
        req.session.user = {name: name, username: username};
        res.status(200).json(req.session.user);
    } catch (error) {
        res.status(400).json({ error: 'Unable to create user'});
        return;
    }
});

router.post('/login', async (req, res) => {
    // Is a modified version of login route from my Final Project last year
    let {name, username, password} = req.body;

    name = xss(name);
    username = xss(username);
    password = xss(password);

    if(name === undefined || name === null){
        res.status(400).json({ error: 'No name parameter is given.' });
        return;
    }
    if(typeof name !== 'string'){
        res.status(400).json({ error: 'Input name is not of type string.' });
        return;
    }
    if(name.length == 0){
        res.status(400).json({ error: 'Input name length is 0, empty string.' });
        return;
    }
    // found on https://stackoverflow.com/questions/10261986/how-to-detect-string-which-contains-only-spaces
    if(name.replace(/\s/g, '').length == 0) {
        res.status(400).json({ error: 'Input name is only empty spaces.' });
        return;
    }
    if(username === undefined || username === null){
        res.status(400).json({ error: 'No username parameter is given.' });
        return;
    }
    if(typeof username !== 'string'){
        res.status(400).json({ error: 'Input username is not of type string.' });
        return;
    }
    if(username.length == 0){
        res.status(400).json({ error: 'Input username length is 0, empty string.' });
        return;
    }
    // found on https://stackoverflow.com/questions/10261986/how-to-detect-string-which-contains-only-spaces
    if(username.replace(/\s/g, '').length == 0) {
        res.status(400).json({ error: 'Input username is only empty spaces.' });
        return;
    }
    if(password === undefined || password === null){
        res.status(400).json({ error: 'No password parameter is given.' });
        return;
    }
    if(typeof password !== 'string'){
        res.status(400).json({ error: 'Input password is not of type string.' });
        return;
    }
    if(password.length == 0){
        res.status(400).json({ error: 'Input password length is 0, empty string.' });
        return;
    }
    // found on https://stackoverflow.com/questions/10261986/how-to-detect-string-which-contains-only-spaces
    if(password.replace(/\s/g, '').length == 0) {
        res.status(400).json({ error: 'Input password is only empty spaces.' });
        return;
    }

    username = username.toLowerCase();
    let passwordMatch = false;
    let foundUser;

    try {
        foundUser = await userData.GetUserByUserName(username);
    } catch (error) {
        res.status(401).json({error: "Login error, username not found"});
        return;
    }

    //compare the login info
    if(foundUser)
    {
        try {
            passwordMatch = await bcrypt.compare(password, foundUser.encryptedPassword);
        } catch (e) {
            res.status(401).json({error: "Login error, incorrect password"});
            return;
        }
    } 

    if(passwordMatch)
    {
        req.session.user = {name: name, username: username};
        res.status(200).json(req.session.user);
    }
    else{
        res.status(401).json({error: "Login error, incorrect password"});
        return;
    }

});

router.get('/:id', async (req, res) => {
    try{
        // Error Checking
        let id_string = req.params.id.toString();
        if(id_string === undefined || id_string === null){
            res.status(400).json({ error: 'No id parameter is given to the getBlogById(id) function.' });
            return;
        }
        if(typeof id_string !== 'string'){
            res.status(400).json({ error: 'Input id in getBlogById(id) is not of type string.' });
            return;
        }
        if(id_string.length == 0){
            res.status(400).json({ error: 'Input id in getBlogById(id) length is 0, empty string.' });
            return;
        }
        // found on https://stackoverflow.com/questions/10261986/how-to-detect-string-which-contains-only-spaces
        if(id_string.replace(/\s/g, '').length == 0) {
            res.status(400).json({ error: 'Input id in getBlogById(id) is only empty spaces.' });
            return;
        }
        const blog = await blogData.getBlogById(id_string);
        res.status(200).json(blog);
    } catch(e){
        res.status(404).json({ error: 'Blog not found'});
    }
});

router.post('/', async (req, res) => {
    try{
        // First check if user is signed in
        if (req.session.user){
            // Error Checking
            if(req.title === undefined || req.title === null){
                res.status(400).json({ error: 'No title parameter given for create(title, body, username).' });
                return;
            }
            if(typeof req.title !== 'string'){
                res.status(400).json({ error: 'Input title in create(title, body, username) is not of type string.' });
                return;
            }
            if(req.title.length == 0){
                res.status(400).json({ error: 'Input title in create(title, body, username) length is 0, empty string.' });
                return;
            }
            // found on https://stackoverflow.com/questions/10261986/how-to-detect-string-which-contains-only-spaces
            if(req.title.replace(/\s/g, '').length == 0) {
                res.status(400).json({ error: 'Input title in create(title, body, username) is only empty spaces.' });
                return;
            }
            if(req.body === undefined || req.body === null){
                res.status(400).json({ error: 'No body parameter given for create(title, body, username).' });
                return;
            }
            if(typeof req.body !== 'string'){
                res.status(400).json({ error: 'Input body in create(title, body, username) is not of type string.' });
                return;
            }
            if(req.body.length == 0){
                res.status(400).json({ error: 'Input body in create(title, body, username) length is 0, empty string.' });
                return;
            }
            // found on https://stackoverflow.com/questions/10261986/how-to-detect-string-which-contains-only-spaces
            if(req.body.replace(/\s/g, '').length == 0) {
                res.status(400).json({ error: 'Input body in create(title, body, username) is only empty spaces.' });
                return;
            }
            const blogPost = await blogData.create(req.title.toString(), req.body.toString(), req.session.user);
            res.status(201).json(blogPost);
        }
        else{
            res.status(403).json({ error: 'User is not logged in, thus cannot make posts' });
            return;
        }
    } catch(e){
        res.status(500).json({ error: 'Posts not found'})
    }
});

router.put('/:id', async (req, res) => {
    try{
        if (req.session.user){
            // Error Checking
            let id_string = req.params.id.toString();
            if(id_string === undefined || id_string === null){
                res.status(400).json({ error: 'No id parameter is given to the getBlogById(id) function.' });
                return;
            }
            if(typeof id_string !== 'string'){
                res.status(400).json({ error: 'Input id in getBlogById(id) is not of type string.' });
                return;
            }
            if(id_string.length == 0){
                res.status(400).json({ error: 'Input id in getBlogById(id) length is 0, empty string.' });
                return;
            }
            // found on https://stackoverflow.com/questions/10261986/how-to-detect-string-which-contains-only-spaces
            if(id_string.replace(/\s/g, '').length == 0) {
                res.status(400).json({ error: 'Input id in getBlogById(id) is only empty spaces.' });
                return;
            }
            const blog = await blogData.getBlogById(id_string);
            if(req.session.user.id !== blog.userThatPostedComment._id || req.session.user.username !== blog.userThatPostedComment.username){
                res.status(403).json({ error: 'Current user did not create this post, thus cannot update this post' });
                return;
            }
            else{
                // Error Checking
                if(req.title === undefined || req.title === null){
                    res.status(400).json({ error: 'No title parameter given for updateBlog(id, title, body, bool).' });
                    return;
                }
                if(typeof req.title !== 'string'){
                    res.status(400).json({ error: 'Input title in updateBlog(id, title, body, bool) is not of type string.' });
                    return;
                }
                if(req.title.length == 0){
                    res.status(400).json({ error: 'Input title in updateBlog(id, title, body, bool) length is 0, empty string.' });
                    return;
                }
                // found on https://stackoverflow.com/questions/10261986/how-to-detect-string-which-contains-only-spaces
                if(req.title.replace(/\s/g, '').length == 0) {
                    res.status(400).json({ error: 'Input title in updateBlog(id, title, body, bool) is only empty spaces.' });
                    return;
                }
                if(req.body === undefined || req.body === null){
                    res.status(400).json({ error: 'No body parameter given for updateBlog(id, title, body, bool).' });
                    return;
                }
                if(typeof req.body !== 'string'){
                    res.status(400).json({ error: 'Input body in updateBlog(id, title, body, bool) is not of type string.' });
                    return;
                }
                if(req.body.length == 0){
                    res.status(400).json({ error: 'Input body in updateBlog(id, title, body, bool) length is 0, empty string.' });
                    return;
                }
                // found on https://stackoverflow.com/questions/10261986/how-to-detect-string-which-contains-only-spaces
                if(req.body.replace(/\s/g, '').length == 0) {
                    res.status(400).json({ error: 'Input body in updateBlog(id, title, body, bool) is only empty spaces.' });
                    return;
                }
                const blogPost = await blogData.updateBlog(id_string, req.title, req.body, true, {});
                res.status(200).json(blogPost);
            }
        }
        else{
            res.status(403).json({ error: 'User is not logged in, thus cannot update posts' });
            return;
        }
    } catch(e){
        res.status(500).json({ error: 'Posts not found'})
    }
});

router.patch('/:id', async (req, res) => {
    try{
        if (req.session.user){
            // Error Checking
            let id_string = req.params.id.toString();
            if(id_string === undefined || id_string === null){
                res.status(400).json({ error: 'No id parameter is given to the getBlogById(id) function.' });
                return;
            }
            if(typeof id_string !== 'string'){
                res.status(400).json({ error: 'Input id in getBlogById(id) is not of type string.' });
                return;
            }
            if(id_string.length == 0){
                res.status(400).json({ error: 'Input id in getBlogById(id) length is 0, empty string.' });
                return;
            }
            // found on https://stackoverflow.com/questions/10261986/how-to-detect-string-which-contains-only-spaces
            if(id_string.replace(/\s/g, '').length == 0) {
                res.status(400).json({ error: 'Input id in getBlogById(id) is only empty spaces.' });
                return;
            }
            const blog = await blogData.getBlogById(id_string);
            if(req.session.user.id !== blog.userThatPostedComment._id || req.session.user.username !== blog.userThatPostedComment.username){
                res.status(403).json({ error: 'Current user did not create this post, thus cannot update this post' });
                return;
            }
            else{
                // Error Checking
                if(req.title !== undefined || req.title !== null){
                    if(typeof req.title !== 'string'){
                        res.status(400).json({ error: 'Input title in updateBlog(id, title, body, bool) is not of type string.' });
                        return;
                    }
                    if(req.title.length == 0){
                        res.status(400).json({ error: 'Input title in updateBlog(id, title, body, bool) length is 0, empty string.' });
                        return;
                    }
                    // found on https://stackoverflow.com/questions/10261986/how-to-detect-string-which-contains-only-spaces
                    if(req.title.replace(/\s/g, '').length == 0) {
                        res.status(400).json({ error: 'Input title in updateBlog(id, title, body, bool) is only empty spaces.' });
                        return;
                    }
                }
                if(req.body !== undefined || req.body !== null){
                    if(typeof req.body !== 'string'){
                        res.status(400).json({ error: 'Input body in updateBlog(id, title, body, bool) is not of type string.' });
                        return;
                    }
                    if(req.body.length == 0){
                        res.status(400).json({ error: 'Input body in updateBlog(id, title, body, bool) length is 0, empty string.' });
                        return;
                    }
                    // found on https://stackoverflow.com/questions/10261986/how-to-detect-string-which-contains-only-spaces
                    if(req.body.replace(/\s/g, '').length == 0) {
                        res.status(400).json({ error: 'Input body in updateBlog(id, title, body, bool) is only empty spaces.' });
                        return;
                    }
                }
                let updatedObject = {};
                if (req.title && req.title !== blog.title){
                    updatedObject.title = req.title.toString();
                }
                if (req.body && req.body !== blog.body){
                    updatedObject.body = req.body.toString();
                }
                const blogPost = await blogData.updateBlog(id_string, req.title, req.body, false, updatedObject);
                res.status(200).json(blogPost);
            }
        }
        else{
            res.status(403).json({ error: 'User is not logged in, thus cannot update posts' });
            return;
        }
    } catch(e){
        res.status(500).json({ error: 'Posts not found'});
    }
});

router.post('/:id/comments', async (req, res) => {
    try{
        if (req.session.user){
            // Error Checking
            let id_string = req.params.id.toString();
            if(id_string === undefined || id_string === null){
                res.status(400).json({ error: 'No id parameter is given to the getBlogById(id) function.' });
                return;
            }
            if(typeof id_string !== 'string'){
                res.status(400).json({ error: 'Input id in getBlogById(id) is not of type string.' });
                return;
            }
            if(id_string.length == 0){
                res.status(400).json({ error: 'Input id in getBlogById(id) length is 0, empty string.' });
                return;
            }
            // found on https://stackoverflow.com/questions/10261986/how-to-detect-string-which-contains-only-spaces
            if(id_string.replace(/\s/g, '').length == 0) {
                res.status(400).json({ error: 'Input id in getBlogById(id) is only empty spaces.' });
                return;
            }
            if(req.comment === undefined || req.comment === null){
                res.status(400).json({ error: 'No comment parameter given for commentBlog(blog, comment, user).' });
                return;
            }
            if(typeof req.comment !== 'string'){
                res.status(400).json({ error: 'Input comment in commentBlog(blog, comment, user) is not of type string.' });
                return;
            }
            if(req.comment.length == 0){
                res.status(400).json({ error: 'Input comment in commentBlog(blog, comment, user) length is 0, empty string.' });
                return;
            }
            // found on https://stackoverflow.com/questions/10261986/how-to-detect-string-which-contains-only-spaces
            if(req.comment.replace(/\s/g, '').length == 0) {
                res.status(400).json({ error: 'Input comment in commentBlog(blog, comment, user) is only empty spaces.' });
                return;
            }
            const blog = await blogData.getBlogById(id_string);
            const newComment = await blogData.commentBlog(blog, req.comment, req.session.user);
            res.status(200).json(newComment);
        }
        else{
            res.status(403).json({ error: 'User is not logged in, thus cannot make comments' });
            return;
        }
    } catch(e){
        res.status(500).json({ error: 'Posts not found'});
    }
});

router.delete('/:blogId/:commentId', async (req, res) => {
    try{
        if (req.session.user){
            // Error Checking
            let blog_id_string = req.params.blogId.toString();
            if(blog_id_string === undefined || blog_id_string === null){
                res.status(400).json({ error: 'No id parameter is given to the getBlogById(id) function.' });
                return;
            }
            if(typeof blog_id_string !== 'string'){
                res.status(400).json({ error: 'Input id in getBlogById(id) is not of type string.' });
                return;
            }
            if(blog_id_string.length == 0){
                res.status(400).json({ error: 'Input id in getBlogById(id) length is 0, empty string.' });
                return;
            }
            // found on https://stackoverflow.com/questions/10261986/how-to-detect-string-which-contains-only-spaces
            if(blog_id_string.replace(/\s/g, '').length == 0) {
                res.status(400).json({ error: 'Input id in getBlogById(id) is only empty spaces.' });
                return;
            }
            let comment_id_string = req.params.commentId.toString();
            if(comment_id_string === undefined || comment_id_string === null){
                res.status(400).json({ error: 'No commentId parameter is given to the getCommentById(blog, commentId) function.' });
                return;
            }
            if(typeof comment_id_string !== 'string'){
                res.status(400).json({ error: 'Input commentId in getCommentById(blog, commentId) is not of type string.' });
                return;
            }
            if(comment_id_string.length == 0){
                res.status(400).json({ error: 'Input commentId in getCommentById(blog, commentId) length is 0, empty string.' });
                return;
            }
            // found on https://stackoverflow.com/questions/10261986/how-to-detect-string-which-contains-only-spaces
            if(comment_id_string.replace(/\s/g, '').length == 0) {
                res.status(400).json({ error: 'Input id in getCommentById(blog, commentId) is only empty spaces.' });
                return;
            }
            const blog = await blogData.getBlogById(blog_id_string);
            const comment = await blogData.getCommentById(blog, comment_id_string);
            if(req.session.user.id !== comment.userThatPostedComment._id || req.session.user.username !== comment.userThatPostedComment.username){
                res.status(403).json({ error: 'Current user did not create this comment, thus cannot delete this comment' });
                return;
            }
            else{
                const noComment = await blogData.deleteComment(blog, comment);
                res.status(200).json(noComment);
            }
        }
        else{
            res.status(403).json({ error: 'User is not logged in, thus cannot make comments' });
            return;
        }
    } catch(e){
        res.status(500).json({ error: 'Comments not found'});
    }
});

module.exports = router;