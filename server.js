const express = require('express');
const path = require('path');
const hbs = require('hbs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const webpush = require('web-push')
const request = require('request');

mongoose.Promise = global.Promise;

const app = express();
app.use(cookieParser())

const port = process.env.PORT || 3000;

const config = require('./config/config')
const auth = require('./middleware/auth')

const User = require('./models/user')
const userRoutes = require('./routes/userRoutes')
const serviceRoutes = require('./routes/serviceRoutes')

const publicDirectoryPath = path.join(__dirname,'/public');
const viewsPath = path.join(__dirname,'/templates/views');
const partialsPath = path.join(__dirname, '/templates/partials')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }) )

app.set('view engine','hbs');
app.set('views',viewsPath);
hbs.registerPartials(partialsPath);

webpush.setVapidDetails('mailto:bhargavnakkina462@gmail.com',process.env.publicVapidKey,process.env.privateVapidKey);



app.post('/subscribe',auth,async (req,res) => {
    const subscription = req.body;

    req.user.subscriptionKey = subscription;
    await req.user.save();

    res.status(201).json({});

})

app.use(express.static(publicDirectoryPath))
app.use(userRoutes)
app.use(serviceRoutes)

app.get('/',auth,(req,res) => {
    res.render('index');
})

app.get('/login',async (req,res) => {
    try{
        const token =  req.cookies.token
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const user = await User.findOne({_id:decoded._id,'tokens.token':token })

        if(user){
          return  res.redirect('/')
        }
    }catch(e){
        return res.render('Login')
    }
     
    res.render('Login');
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

app.get('/notifications',auth,(req,res) => {
    console.log('notifications')
    res.render('notifications');
})

app.get('/demo',auth,(req,res) => {
   res.render('demo');
});

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