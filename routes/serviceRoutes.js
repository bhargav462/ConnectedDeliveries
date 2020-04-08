const express = require('express');
const _ = require('lodash');
const Service = require('../models/services')
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/deliver',auth,(req,res) => {
    console.log('deliver')
    
    var newService = _.pick(req.body,['location','from','to','date','time','charge'])
    newService.userId = req.user._id;
    newService.mode = "deliver";
    var service = new Service(newService)
        console.log(service)

    service.save().then((result) => {
        res.send(); 
    }).catch((err) => {
        res.status(403).send()
    });
})

router.post('/receive',auth,(req,res) => {
    console.log('receive',req.body)
    
    var newService = _.pick(req.body,['location','from','to','date','time','charge','itemList'])
    newService.userId = req.user._id;
    newService.mode = "receive";
    var service = new Service(newService)
        console.log(service)

    service.save().then((result) => {
        console.log()
        res.send(); 
    }).catch((err) => {
        res.status(403).send()
    });
})

module.exports = router;
