const express = require('express');

const app = express();
const port = process.env.port || 3000;

app.use(express.static(__dirname + '/public'))

app.get('/',(req,res) => {
    res.sendFile('index.html',{root:__dirname + '/public'})
})

var server = app.listen(port,(res) => {
    console.log(`Server is up on port ${port}`)
})