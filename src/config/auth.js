require("dotenv").load()

module.exports = {
  'twitterAuth' : {
      'consumerKey': process.env.TWITTER_KEY,
      'consumerSecret': process.env.TWITTER_SECRET,
      'callbackURL': process.env.TWITTER_CALLBACK
  }
}
