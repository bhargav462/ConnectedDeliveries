const express = require('express');
const path = require('path');
const hbs = require('hbs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const auth = require('./middleware/auth')

mongoose.Promise = global.Promise;

const app = express();
app.use(cookieParser())

const port = process.env.PORT || 3000;

const config = require('./config/config')

const userRoutes = require('./routes/userRoutes')
const serviceRoutes = require('./routes/serviceRoutes')

const publicDirectoryPath = path.join(__dirname,'/public');
const viewsPath = path.join(__dirname,'/templates/views');
const partialsPath = path.join(__dirname, '/templates/partials')

mongoose.Promise = global.Promise;

app.use(bodyParser.json());

app.set('view engine','hbs');
app.set('views',viewsPath);
hbs.registerPartials(partialsPath);

app.use(express.static(publicDirectoryPath))
app.use(userRoutes)
app.use(serviceRoutes)

app.get('/',auth,(req,res) => {
    res.render('index');
})

app.get('/login',auth,(req,res) => {
    res.render('index');
})

app.get('/register',(req,res) => {
    res.render('register');
})

app.get('/receive',auth,(req,res) => {
    res.render('receive');
})

app.get('/deliver',auth,(req,res) => {
    res.render('deliver');
})

app.get('*',(req,res) => {
    res.status(404).send();
})

mongoose.connect(process.env.MONGODB_URI,{useNewUrlParser:true}).then(result => {
    var server = app.listen(port,(res) => {
        console.log(`Server is up on port ${port}`)
    })
}).catch(e => {
    console.log('Unable to connect to the database');
})

// mongodb://127.0.0.1:27017/chess