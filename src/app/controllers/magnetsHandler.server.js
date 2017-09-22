var User = require('../models/user')

function magnetsHandler() {
  this.getMyMagnets = function(req, res) {
    var id = req.user.id // can use req.user.id or req.user._id
    User.findById(id)
      .exec(function(err, users) {
        if (err) throw err
        res.json([users])
      })
  }
  this.getAllMagnets = function(req, res) {
    User.find()
      .exec(function(err, users) {
        if (err) throw err
        res.json(users)
      })
  }
  this.addDatabaseMagnet = function(req, res) {
    var id = req.user.id
    var magnet = req.body.magnet
    User.findByIdAndUpdate(id, { $push: { magnets: magnet }})
      .exec(function(err, user) {
        if (err) throw err
        res.end('add successful')
      })
  }
  this.deleteDatabaseMagnet = function(req, res) {
    var id = req.user.id
    var index = req.body.index
    User.findById(id)
      .exec(function(err, user) {
        if (err) throw err
        user.magnets.splice(index, 1)
        user.save(function(err) {
          if (err) throw err
          res.end('delete successful')
        })
      })
  }
  this.editDatabaseMagnet = function(req, res) {
    var id = req.user.id
    var magnet = req.body.magnet
    var index = req.body.index
    User.findById(id)
      .exec(function(err, user) {
        if (err) throw err
        user.magnets.splice(index, 1)
        user.magnets.splice(index, 0, magnet)
        user.save(function(err) {
          if (err) throw err
          res.end('edit successful')
        })
      })
  }
  this.likeDatabaseMagnet = function(req, res) {
    var id = req.user.id
    var magnet = req.body.magnet
    var magnetOwnerId = magnet.id
    var index = req.body.index
    User.findById(magnetOwnerId)
      .exec(function(err, user) {
        var save = function() {
          if (user.magnets[index].dislikes && user.magnets[index].dislikes.indexOf(id) > -1) user.magnets[index].dislikes.splice(user.magnets[index].dislikes.indexOf(id), 1)
          user.markModified('magnets')
          user.save(function(err) {
            if (err) throw err
            res.end('like successful')
          })
        }
        if (!user.magnets[index].likes) {
          user.magnets[index].likes = [id]
          save()
        } else if (user.magnets[index].likes.indexOf(id) === -1) {
          user.magnets[index].likes.push(id)
          save()
        }
      })
  }
  this.dislikeDatabaseMagnet = function(req, res) {
    var id = req.user.id
    var magnet = req.body.magnet
    var magnetOwnerId = magnet.id
    var index = req.body.index
    User.findById(magnetOwnerId)
      .exec(function(err, user) {
        var save = function() {
          if (user.magnets[index].likes && user.magnets[index].likes.indexOf(id) > -1) user.magnets[index].likes.splice(user.magnets[index].likes.indexOf(id), 1)
          user.markModified('magnets')
          user.save(function(err) {
            if (err) throw err
            res.end('dislike successful')
          })
        }
        if (!user.magnets[index].dislikes) {
          user.magnets[index].dislikes = [id]
          save()
        } else if (user.magnets[index].dislikes.indexOf(id) === -1) {
          user.magnets[index].dislikes.push(id)
          save()
        }
      })
  }
}

module.exports = magnetsHandler
