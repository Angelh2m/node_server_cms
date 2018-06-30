const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const path = require('path');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');
const upload = require('./routes/api/uploads');
const oauth = require('./routes/api/oauth');

const app = express();

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
    .connect(db)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log(err));

/* *
 *  PASSPORT STRATEGIES
 */
app.use(passport.initialize());
require('./config/passport')(passport);
require('./config/passport-google')(passport);

app.get('/', (req, res) => res.send('Hello World'));

// Use Routes
app.use('/api/users', users);
app.use('/api/upload', upload);
app.use('/api/profile', profile);
app.use('/api/posts', posts);
app.use('/api/oauth', oauth);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));