var express = require('express.oi'),
    bodyParser = require('body-parser'), // for crying out loud, STOP REMOVING THIS
    app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api', require('./api/auth')());
app.use('/api', require('./api/public')());
app.use('/api', require('./api/private')());

app.http().io();

app.io.route('login', {
    success: function(req, res) {
        console.log('login:success');
    }
})

app.listen(9000, function() {
  console.log('Express server listening on %d', 9000);
});
