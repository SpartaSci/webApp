"use strict"

const passport = require("passport");
const session = require("express-session");
const userDao = require("./dao-users");
const LocalStrategy = require("passport-local").Strategy;

function initAuthentication(app, data) {
    passport.use(new LocalStrategy(async function verify(username, password, callback) {
        const user = await userDao.getUser(username, password)
        if (!user)
            return callback(null, false, 'Incorrect username or password');

        return callback(null, user); // NOTE: user info in the session (all fields returned by userDao.getUser, i.e, id, username, name)
    }));


    passport.serializeUser(function (user, callback) {
        callback(null, user.user_id);
    });

    passport.deserializeUser(function (user_id, callback) { // this user is id + email + name + good
        userDao.getUserById(user_id)
            .then((user) => {callback(null, user);})
            .catch((err) => {callback(err,null);});
    });


    app.use(session({
        secret: "586e60fdeb6f34186ae165a0cea7ee1dfa4105354e8c74610671de0ef9662191",
        resave: false,
        saveUninitialized: false,
        cookie: {httpOnly: true, secure: app.get('env') === 'production'},
    }));


    app.use(passport.initialize());
    app.use(passport.session());
 //   app.use(passport.authenticate('session'));

}


function isLoggedIn  (req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({error: 'Not authorized'});
}


module.exports = {initAuthentication, isLoggedIn};