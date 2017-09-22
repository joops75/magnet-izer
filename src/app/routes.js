var MagnetsHandler = require(process.cwd() + "/src/app/controllers/magnetsHandler.server.js")
var id
var user

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next()
  res.redirect('/')
}

function isLocallyLoggedIn(req, res, next) {
  if (req.isAuthenticated() && req.user && req.user.local && req.user.local.username) return next()
  res.redirect('/')
}

function setIdAndUser(req, res, next) {
  if (req.user) {
    id = req.user['_id']
    req.user.local && req.user.local.username ? user = [req.user.local.username, 'local']: req.user.twitter && req.user.twitter.username ? user = [req.user.twitter.username, 'twitter']: user = ''
  } else {
    id = ''
    user = ''
  }
  return next()
}

module.exports = function(app, passport) {
  var magnetsHandler = new MagnetsHandler()

  app.get('/', setIdAndUser, function(req, res) {
    res.render('index.ejs', {
      user: user
    })
  })

  app.get('/login', setIdAndUser, function(req, res) {
    res.render('login.ejs', {
      message: req.flash('loginMessage'),
      user: user
    })
  })

  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/my-post-wall',
    failureRedirect: '/login',
    failureFlash: true
  }))

  app.get('/signup', setIdAndUser, function(req, res) {
    res.render('signup.ejs', {
      message: req.flash('signupMessage'),
      user: user
    })
  })

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/my-post-wall',
    failureRedirect: '/signup',
    failureFlash: true
  }))

  app.get('/profile', isLoggedIn, setIdAndUser, function(req, res) {
    res.render('profile.ejs', {
      user: user,
      reqUser: req.user,
      message: req.flash('addMessage')
    })
  })

  app.get('/password', isLocallyLoggedIn, setIdAndUser, function(req, res) {
    res.render('password.ejs', {
      user: user,
      message: req.flash('passwordMessage')
    })
  })

  app.post('/password', isLocallyLoggedIn, passport.authenticate('password-update', {
    successRedirect: '/profile',
    failureRedirect: '/password',
    failureFlash: true
  }))

  app.get('/logout', function(req, res) {
    req.logout()
    res.redirect('/')
  })

  app.get('/auth/twitter', passport.authenticate('twitter', { scope: 'email' }))

  app.get('/auth/twitter/callback', passport.authenticate('twitter', {
    successRedirect: '/my-post-wall',
    failureRedirect: '/profile'
  }))

  app.get('/add/local', isLoggedIn, setIdAndUser, function(req, res) {
    res.render('connect-local.ejs', {
      message: req.flash('addMessage'),
      user: user
    })
  })

  app.post('/add/local', isLoggedIn, passport.authenticate('local-add', {
    successRedirect: '/profile',
    failureRedirect: '/add/local',
    failureFlash: true
  }))

  app.get('/connect/twitter', isLoggedIn, passport.authenticate('twitter', { scope: 'email' }))

  app.get('/unlink/twitter', isLoggedIn, function(req, res) {
    var user = req.user
    user.twitter.token = undefined
    user.twitter.id = undefined
    user.twitter.username = undefined
    user.twitter.displayName = undefined
    user.save(function(err) {
      res.redirect('/profile')
    })
  })

  app.get('/all-post-wall', setIdAndUser, function(req, res) {
    res.render('post-wall.ejs', {
      id: id,
      user: user,
      page: '/all-post-wall'
    })
  })

  app.get('/my-post-wall', isLoggedIn, setIdAndUser, function(req, res) {
    res.render('post-wall.ejs', {
      id: id,
      user: user,
      page: '/my-post-wall'
    })
  })

  app.route('/api/getMyMagnets')
    .get(isLoggedIn, magnetsHandler.getMyMagnets)

  app.route('/api/getAllMagnets')
    .get(magnetsHandler.getAllMagnets)

  app.route('/api/addDatabaseMagnet')
    .post(isLoggedIn, magnetsHandler.addDatabaseMagnet)

  app.route('/api/deleteDatabaseMagnet')
    .post(isLoggedIn, magnetsHandler.deleteDatabaseMagnet)

  app.route('/api/editDatabaseMagnet')
    .post(isLoggedIn, magnetsHandler.editDatabaseMagnet)

  app.route('/api/likeDatabaseMagnet')
    .post(isLoggedIn, magnetsHandler.likeDatabaseMagnet)

  app.route('/api/dislikeDatabaseMagnet')
    .post(isLoggedIn, magnetsHandler.dislikeDatabaseMagnet)
}
