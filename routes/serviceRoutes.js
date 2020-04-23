const express = require('express');
const _ = require('lodash');
const Receive = require('../models/receive');
const Deliver = require('../models/deliver')
const User = require('../models/user')
const auth = require('../middleware/auth');
const webpush = require('web-push')
const router = express.Router();

router.post('/deliver',auth,(req,res) => {
    console.log('deliver')
    
    var newService = _.pick(req.body,['location','from','to','date','time','charge'])
    newService.userId = req.user._id;
    newService.username = req.user.username;
    var service = new Deliver(newService)
        console.log(service)

    service.save().then((result) => {

        console.log('result',result);
        
        Receive.find({location:result.location,from:result.from,to:result.to,date:result.date}).then(async (deliveries) => {

            console.log('deliveriesprevious',deliveries);

            var filteredDeliveries = await deliveries.filter((element) => {
                if(element.userId.toString() !== req.user._id.toString())
                {
                    console.log(element.userId,'inside',req.user._id);

                    return element;
                }
            })

            console.log('deliveries',filteredDeliveries);
            res.send(filteredDeliveries);
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
    newService.username = req.user.username;
    var service = new Receive(newService)
        console.log(service)

    service.save().then((result) => {
        
        Deliver.find({location:result.location,from:result.from,to:result.to,date:result.date}).then((deliveryMan) => {

            deliveryMan = deliveryMan.filter((element) => {
               if(element.userId.toString() !== req.user._id.toString())
               {
                console.log(element.userId,'inside ',req.user._id);

                return element;
               }
               
            })

            console.log(deliveryMan);

            res.send(deliveryMan);
        })
    }).catch((err) => {
        res.status(403).send()
    });
})

// router.post('/getOrders',async(req,res) => {
//     Service.find({},'userId itemList').then(async (result) => {
//         console.log(result);
//         user = await User.findOne({_id:result[0].userId})

//         var response = {
//             name : user.name,
//             deliver : result[0]
//         };

//         res.send(response);
//     })
// })

router.post('/deliveryRequested',auth,async(req,res) => {
    console.log('name',req.body)
    User.findOne({username:req.body.name}).then(async (result) => {

       try{

        console.log('result',result);

        var delivery = new Deliver();
        var delivery = await Deliver.findOne({userId:req.user._id});
        console.log('felivery',delivery)
        if(!delivery.reqSent){
            delivery.reqSent = [];
        }
        console.log('reqSent',delivery.reqSent)

        delivery.reqSent = delivery.reqSent.concat({userId:result._id,username:result.username})
        console.log('check',delivery)
        await delivery.save();

        var receiver = await Receive.findOne({userId:result._id})
        console.log('receiver',receiver)
        receiver.reqReceived = receiver.reqReceived.concat({userId:req.user._id,username:req.user.username});
        await receiver.save();


       } catch(e){
           console.log(e);
           res.status(403).send();
       }
        
        const payload  = JSON.stringify({title:'Connected Deliveries',name:req.user.username,mode:'receive'});
        res.send();
        webpush.sendNotification(result.subscriptionKey,payload).catch(err => console.error(err));
    })

})

router.post('/receiveRequested',auth,async(req,res) => {
    console.log('name',req.body)
    User.findOne({username:req.body.name}).then(async (result) => {


        var receiver =  await Receive.findOne({userId:req.user._id})
        receiver.reqSent = receiver.reqSent.concat({userId:result._id,username:result.username})
        console.log('receiver',receiver)
        await receiver.save()

        var deliveryMan = await Deliver.findOne({userId:result._id})
        deliveryMan.reqReceived = deliveryMan.reqReceived.concat({userId:req.user._id,username:req.user.username});
        await deliveryMan.save();

        const payload  = JSON.stringify({title:'Connected Deliveries',name:req.user.username,mode:'delivery'});
        res.send();
        webpush.sendNotification(result.subscriptionKey,payload).catch(err => console.error(err));
    })

})

router.post('/notification',auth,async (req,res) => {

    try{
        var deliver = await Deliver.findOne({userId:req.user._id})

        var receive = await Receive.findOne({userId:req.user._id})
        
        var need = {};
        if(deliver && deliver.reqReceived.length > 0)
        {
            console.log(deliver.reqReceived)
            need.deliver = deliver.reqReceived;
        }
        
    
        if(receive && receive.reqReceived.length > 0)
        {
            need.receive = receive.reqReceived;
        }
        
    
        console.log('need',need);
        
        res.send(need)
    }catch(e){
        console.log(e);
        res.status(403).send();
    }
   
    
})

module.exports = router;
