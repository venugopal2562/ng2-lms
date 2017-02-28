var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var passport	= require('passport');
var config      = require('./config/database'); // get db config file
var User        = require('./app/models/user'); // get the mongoose model
var port        = process.env.PORT || 9000;
var jwt = require('jsonwebtoken');
 
// get our request parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
 
// log to console
app.use(morgan('dev'));
 
// Use the passport package in our application
app.use(passport.initialize());
 
// CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

// demo Route (GET http://localhost:8080)
app.get('/', function(req, res) {
  res.send('Hello! The API is at http://localhost:' + port + '/api');
});
 
// Start the server
app.listen(port);
console.log('There will be dragons: http://localhost:' + port);


mongoose.connect(config.database);
 
// pass passport for configuration
require('./config/passport')(passport);
 
// bundle our routes
var apiRoutes = express.Router();

//define route constant
const userController = require('./app/controllers/users');
const holidayController = require('./app/controllers/holidays');
const leaveController = require('./app/controllers/leaves');

// users routes
apiRoutes.get('/users', config.isAuthenticated, userController.listUsers);
apiRoutes.post('/users', config.isAuthenticated, userController.addUsers);
apiRoutes.post('/users/edit', config.isAuthenticated, userController.editUsers);
apiRoutes.get('/users/delete/:id', config.isAuthenticated, userController.deleteUsers);
apiRoutes.get('/users/:id', config.isAuthenticated, userController.getUser);

// holidays routes
apiRoutes.get('/holidays', config.isAuthenticated, holidayController.listHolidays);
apiRoutes.post('/holidays', config.isAuthenticated, holidayController.addHolidays);
apiRoutes.post('/holidays/edit', config.isAuthenticated, holidayController.editHolidays);
apiRoutes.get('/holidays/delete/:id', config.isAuthenticated, holidayController.deleteHolidays);
apiRoutes.get('/holidays/:id', config.isAuthenticated, holidayController.getHolidays);

// Leaves routes
apiRoutes.get('/leaves', config.isAuthenticated, leaveController.listLeaves);
apiRoutes.post('/leaves', config.isAuthenticated, leaveController.addLeaves);
apiRoutes.post('/leaves/edit', config.isAuthenticated, leaveController.editLeaves);
apiRoutes.get('/leaves/delete/:id', config.isAuthenticated, leaveController.deleteLeaves);
apiRoutes.get('/leaves/:id', config.isAuthenticated, leaveController.getLeaves);


// route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/login', function(req, res) {
  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;
 
    if (!user) {
      res.send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.sign(user, config.secret, {
            expiresIn: 30000 // expires in 1 minute
          });
          //var token = jwt.encode(user, config.secret);
          // return the information including token as JSON
          res.json({success: true, token: token});
        } else {
          res.send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    }
  });
});

// route to a restricted info (GET http://localhost:8080/api/memberinfo)
apiRoutes.get('/memberinfo', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    // verifies secret and checks exp
    var decoded = jwt.decode(token, config.secret, {complete: true});
    console.log(decoded._doc);
    jwt.verify(token, config.secret, function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        decoded_user = decoded._doc;
        User.findOne({
          username: decoded_user.username
          }, function(err, user) {
              if (err) throw err;
      
              if (!user) {
                return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
              } else {
                res.json({success: true, data: user});
              }
            });
      }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});
 
getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

// connect the api routes under /api/*
app.use('/api', apiRoutes);