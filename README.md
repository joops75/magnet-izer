# magnet-izer
A Pinterest-style app where users can upload images and text for others to view and appraise.

This app is built upon the code at https://scotch.io/tutorials/easy-node-authentication-linking-all-accounts-together.

Unauthenticated users may view submissions from others ('magnets') by clicking on 'All Magnets'. To like/dislike a magnet 
or create their own ( via 'My Magnets'), a user must either login locally or with their Twitter account. Authentication is 
handled with passport.js with the passport-local and passport-twitter strategies.

When logged in, a user may view their account details by clicking on 'Profile'. Here, they may link a Twitter or local 
account if one is not already associated with the user. Adding a local account requires a user to enter the credentials of 
either a new or existing local account to be linked. A Twitter account may also be unlinked from a local account, but not 
vice-versa. When linking accounts, the users information in the database is merged, meaning all previously saved magnets 
in both accounts are retained.

The 'My Magnets' and 'All Magnets' pages are rendered using react.js and masonry.js via common code that selects what to 
display based on the current page url and user data. When adding a magnet, a pop-up appears that allows the user to enter 
the image url, title and optional comment. Broken images are handled via the 'onerror' function, which replaces them with a
'No Image available' alternative. A user may edit or delete an existing magnet via 'My Magnets'.

Currently all magnets are displayed from the database. Ideally, the returned results should be limited and pagination 
functionality added.

The css was created by writing the styling in sass and then compiling the css with globally installed node-sass.

Gulp is ran when in development mode, which uses browserify, babelify and watchify to compile the changed react files into 
a 'build.js' file that is hosted via a script tag in an ejs file (\src\views\post-wall.ejs).

For production mode, a 'bundle.js' file is produced via the command line (see '\production compiler command.txt' for more).
The script tag of '\src\views\post-wall.ejs' may then be altered to host the produced bundle.js file in place of the 
build.js file.

Technologies used in this project:
* node
* express
* html
* sass
* jquery
* bootstrap
* ejs
* mongodb
* mongoose
* react
* passport
* masonry
* gulp
* browserify
* babelify
* watchify

Addtional packages of note:
* passport-local
* passport-twitter
* bcrypt-nodejs
* connect-flash
* masonry-layout
* react-masonry-component
* node-sass
