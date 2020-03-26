const express = require('express');

const app = express();

app.use(express.static(__dirname + '/public'))

app.get('/',(req,res) => {
    res.sendFile('index.html',{root:__dirname + '/public'})
})

var server = app.listen(3000,(res) => {
    console.log('Server is up on port 3000')
})