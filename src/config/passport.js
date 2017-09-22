var LocalStrategy = require('passport-local').Strategy
var TwitterStrategy  = require('passport-twitter').Strategy
var User = require('../app/models/user')
var configAuth = require('./auth')

module.exports = function(passport) {
  passport.serializeUser(function(user, done) {
    done(null, user.id)
  })
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user)
    })
  })

  passport.use('local-signup', new LocalStrategy({
    passReqToCallback : true
  },
  function(req, username, password, done) {
    process.nextTick(function() {
      User.findOne({ 'local.username' : username }, function(err, user) {
        if (err) return done(err)
        if (user) {
          return done(null, false, req.flash('signupMessage', 'That username is already taken.'))
        } else {
          var newUser = new User()
          newUser.local.username = username
          newUser.local.password = newUser.generateHash(password)
          newUser.magnets = []
          newUser.save(function(err) {
            if (err) throw err
            return done(null, newUser)
          })
        }
      })
    })
  }))

  passport.use('local-add', new LocalStrategy({
    passReqToCallback : true
  },
  function(req, username, password, done) {
    process.nextTick(function() {
      User.findOne({ 'local.username' : username }, function(err, user) {
        if (err) return done(err)
        if (user) {
          if (user.twitter.token) {
            return done(null, false, req.flash('addMessage', 'That username is already linked to another Twitter account.'))
          } else if (!user.validPassword(password)) {
            return done(null, false, req.flash('addMessage', 'Oops! Wrong password.'))
          } else {
            User.deleteOne({ 'local.username' : username }, function(err) {
              if (err) throw err
              var existingUser = req.user
              existingUser.local.username = user.local.username
              existingUser.local.password = user.local.password
              existingUser.magnets = existingUser.magnets.concat(user.magnets)
              existingUser.save(function(err) {
                if (err) throw err
                return done(null, existingUser)
              })
            })
          }
        } else {
          var existingUser = req.user
          existingUser.local.username = username
          existingUser.local.password = existingUser.generateHash(password)
          existingUser.save(function(err) {
            if (err) throw err
            return done(null, existingUser)
          })
        }
      })
    })
  }))

  passport.use('local-login', new LocalStrategy({
    passReqToCallback : true
  },
  function(req, username, password, done) {
    User.findOne({ 'local.username' : username }, function(err, user) {
      if (err) return done(err)
      if (!user) return done(null, false, req.flash('loginMessage', 'No user found.'))
      if (!user.validPassword(password)) return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'))
      return done(null, user)
    })
  }))

  passport.use(new TwitterStrategy({
    consumerKey : configAuth.twitterAuth.consumerKey,
    consumerSecret : configAuth.twitterAuth.consumerSecret,
    callbackURL : configAuth.twitterAuth.callbackURL,
    passReqToCallback : true
  },
  function(req, token, tokenSecret, profile, done) {
    process.nextTick(function() {
      if (!req.user) {
        User.findOne({ 'twitter.id' : profile.id }, function(err, user) {
          if (err) return done(err)
          if (user) {
            user.twitter.token = token
            user.twitter.username = profile.username
            user.twitter.displayName = profile.displayName
            user.save(function(err) {
              if (err) throw err
              return done(null, user)
            })
          } else {
            var newUser = new User()
            newUser.twitter.id = profile.id
            newUser.twitter.token = token
            newUser.twitter.username = profile.username
            newUser.twitter.displayName = profile.displayName
            newUser.magnets = []
            newUser.save(function(err) {
              if (err) throw err
              return done(null, newUser)
            })
          }
        })
      } else {
        User.findOne({ 'twitter.id' : profile.id }, function(err, user) {
          if (err) throw err
          if (user) {
            if (user.local.username) {
              return done(null, false, req.flash('addMessage', 'Twitter account is already linked to another local account.'))
            } else {
              User.deleteOne({ 'twitter.id' : profile.id }, function(err) {
                if (err) throw err
                var existingUser = req.user
                existingUser.twitter.id = profile.id
                existingUser.twitter.token = token
                existingUser.twitter.username = profile.username
                existingUser.twitter.displayName = profile.displayName
                existingUser.magnets = existingUser.magnets.concat(user.magnets)
                existingUser.save(function(err) {
                  if (err) throw err
                  return done(null, existingUser)
                })
              })
            }
          } else {
            var existingUser = req.user
            existingUser.twitter.id = profile.id
            existingUser.twitter.token = token
            existingUser.twitter.username = profile.username
            existingUser.twitter.displayName = profile.displayName
            existingUser.save(function(err) {
              if (err) throw err
              return done(null, existingUser)
            })
          }
        })
      }
    })
  }))

  passport.use('password-update', new LocalStrategy({
    passReqToCallback : true
  },
  function(req, username, password, done) {
    if (!req.user.validPassword(password)) return done(null, false, req.flash('passwordMessage', 'Oops! Wrong password.'))
    if (!req.body.newPassword) return done(null, false, req.flash('passwordMessage', 'new password field is blank.'))
    var newPassword = req.user.generateHash(req.body.newPassword)
    User.findOneAndUpdate({ 'local.username' : username }, { 'local.password' : newPassword }, { new : true }, function(err, user) {
      if (err) return done(err)
      return done(null, user)
    })
  }))

}
