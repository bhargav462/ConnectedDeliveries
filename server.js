const express = require('express');
const path = require('path');
const hbs = require('hbs');

const app = express();
const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname,'/public');
const viewsPath = path.join(__dirname,'/templates/views');
const partialsPath = path.join(__dirname, '/templates/partials')

app.set('view engine','hbs');
app.set('views',viewsPath);
hbs.registerPartials(partialsPath);

app.use(express.static(publicDirectoryPath))

app.get('/',(req,res) => {
    res.render('index');
})

app.get('/login',(req,res) => {
    res.render('login');
})

app.get('/register',(req,res) => {
    res.render('register');
})

app.get('/receive',(req,res) => {
    res.render('receive');
})

app.get('/deliver',(req,res) => {
    res.render('deliver');
})


var server = app.listen(port,(res) => {
    console.log(`Server is up on port ${port}`)
})