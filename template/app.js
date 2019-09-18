const createError = require('http-errors'),
    express = require('express'),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    logger = require('morgan'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    flash = require('connect-flash'),
    session = require('express-session');

require('./src/security/passport')(passport);

mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useCreateIndex: true }, function(err) {
    if (err) throw err;
    console.log('DB Successfully connected');
});


mongoose.set('useCreateIndex', true);
mongoose.plugin(schema => {
    schema.set('timestamps', true);
});


const app = express();

// view engine setup
app.set('views', path.join(__dirname, '/src/views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET,
    name: process.env.COOKIE_NAME,
    resave: false,
    saveUninitialized: true,
}))

app.use(express.static(path.join(__dirname, 'public')));


app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.use(flash());
require('./src/routes')(app, passport);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;