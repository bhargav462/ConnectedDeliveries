const express = require('express');

const app = express();

app.use(express.static(__dirname + '/playground'))

app.get('/',(req,res) => {
    res.sendFile('header.html',{root:__dirname + '/playground'})
})

var server = app.listen(3000,(res) => {
    console.log('Server is up on port 3000')
})