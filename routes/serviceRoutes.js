const express = require('express');
const _ = require('lodash');
const Service = require('../models/services')
const User = require('../models/user')
const auth = require('../middleware/auth');
const webpush = require('web-push')
const router = express.Router();

router.post('/deliver',auth,(req,res) => {
    console.log('deliver')
    
    var newService = _.pick(req.body,['location','from','to','date','time','charge'])
    newService.userId = req.user._id;
    newService.mode = "deliver";
    newService.username = req.user.name;
    var service = new Service(newService)
        console.log(service)

    service.save().then((result) => {

        console.log('result',result);
        
        Service.find({mode:'receive',location:result.location,from:result.from,to:result.to,date:result.date}).then((deliveries) => {
            console.log('deliveries',deliveries);
            res.send(deliveries);
        })
    }).catch((err) => {
        res.status(403).send()
    });
})

router.post('/receive',auth,(req,res) => {
    console.log('receive',req.body)
    
    var newService = _.pick(req.body,['location','from','to','date','time','charge','itemList'])
    newService.userId = req.user._id;
    newService.mode = "receive";
    newService.username = req.user.name;
    var service = new Service(newService)
        console.log(service)

    service.save().then((result) => {
        console.log()
        res.send(); 
    }).catch((err) => {
        res.status(403).send()
    });
})

router.post('/getOrders',async(req,res) => {
    Service.find({},'userId itemList').then(async (result) => {
        console.log(result);
        user = await User.findOne({_id:result[0].userId})

        var response = {
            name : user.name,
            deliver : result[0]
        };

        res.send(response);
    })
})

router.post('/accepted',auth,async(req,res) => {

    User.findOne({name:req.body.name}).then((result) => {
        console.log('result',result);
        const payload  = JSON.stringify({title:'Connected Deliveries'});
        res.send();
        webpush.sendNotification(result.subscriptionKey,payload).catch(err => console.error(err));
    })

})

module.exports = router;
