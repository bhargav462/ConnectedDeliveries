const express = require('express');
const path = require('path');
const hbs = require('hbs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const webpush = require('web-push')

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

mongoose.Promise = global.Promise;

app.use(bodyParser.json());

app.set('view engine','hbs');
app.set('views',viewsPath);
hbs.registerPartials(partialsPath);

webpush.setVapidDetails('mailto:bhargavnakkina462@gmail.com',process.env.publicVapidKey,process.env.privateVapidKey);

app.post('/subscribe',(req,res) => {
    const subscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/c2kUB6RLeI0:APA91bGlriwnMQs8auxBSJR3dEPEcqyF3KQA5A4qh05NIVHn6Y99zOvhSslTENfVPTJjtzBdrAg7JiU3ATGuEZork0d9IU4hjp1M0g2r-2mZ7WbgChrdFZq4tfnuI_86pPixumJlfKrZ',
        expirationTime: null,
        keys: {
          p256dh: 'BBYowAObozCLqcBSxAAJjH83J-qF-rzBw7k310_dNtLVGx_7BIsxrfHkeLA4kDsIx8jkNpFiLPOymgzNXB2LVoA',
          auth: '4VbAzzeo4HMX7He7yU_1dQ'
        }
      };

    console.log('subscription',subscription)

    res.status(201).json({});

    const payload  = JSON.stringify({title:'Connected Deliveries'});
    webpush.sendNotification(subscription,payload).catch(err => console.error(err));
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