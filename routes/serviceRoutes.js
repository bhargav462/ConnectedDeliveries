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
        
        Receive.find({location:result.location,from:result.from,to:result.to,date:result.date,vacancy:0}).then(async (deliveries) => {

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
        
        Deliver.find({location:result.location,from:result.from,to:result.to,date:result.date,vacancy:0}).then((deliveryMan) => {

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
        var deliver = await Deliver.findOne({userId:req.user._id,vacancy:0})
        
        var receive = await Receive.findOne({userId:req.user._id,vacancy:0})

        console.log('deliver',deliver,'receive',receive);
        
        var need = {};
        if(deliver && deliver.reqReceived.length > 0)
        {
            console.log('deliver',deliver)
            need.deliver = deliver.reqReceived;

            console.log('acceptedBy',deliver.acceptedBy)
            
        }

        if(deliver && (deliver.acceptedBy.username || deliver.acceptedBy.userId)){
            need.delAccepted = deliver.acceptedBy
        }

        if(deliver && deliver.rejectedBy.length > 0){
            need.delRejected = deliver.rejectedBy
        }
        
    
        if(receive && receive.reqReceived.length > 0)
        {
            console.log('receive',receive)
            need.receive = receive.reqReceived;
            console.log('receive',receive.acceptedBy)
            
        }

        if(receive && receive.rejectedBy.length > 0){
            need.recRejected = receive.rejectedBy
        }

        if(receive && (receive.acceptedBy.username || receive.acceptedBy.userId)){
            console.log('check')
            need.recAccepted = receive.acceptedBy
        }
        
    
        console.log('need',need);
        
        res.send(need)
    }catch(e){
        console.log(e);
        res.status(403).send();
    }
   
    
})

router.post('/rejected',auth,async (req,res) => {
    try{
       
      console.log('/rejected',req.body);

      if(req.body.mode === 'del'){
         var deliver = await Deliver.findOne({userId:req.user._id})

         if(deliver && deliver.reqReceived.length > 0)
         {
           deliver.reqReceived = deliver.reqReceived.filter((element) => {
                return element.username !== req.body.username
            })
         }

         var receive = await Receive.findOne({username:req.body.username,from:deliver.from,to:deliver.to,location:deliver.location,date:deliver.date})
          
         if(receive && receive.reqSent.length > 0)
         {
            receive.reqSent = receive.reqSent.filter((element) => {
                return element.username !== req.user.username
             })
            //  if(!receive.rejectedBy){
            //      receive.rejectedBy = [];
            //  }
             receive.rejectedBy = receive.rejectedBy.concat({userId:req.user._id,username:req.user.username})
             await deliver.save();

          await receive.save();
         }
        
         var user = await User.findOne({username:req.body.username})
         const payload  = JSON.stringify({title:'Connected Deliveries',name:req.user.username,mode:'delRejected'});
        res.send();
        webpush.sendNotification(user.subscriptionKey,payload).catch(err => console.error(err));

      }else if(req.body.mode === 'rec'){

        var deliver = await Deliver.findOne({username:req.body.username});

        if(deliver && deliver.reqSent.length > 0){
            deliver.reqSent = deliver.reqSent.filter((element) => {
                return element.username !== req.user.username
            })

            // if(!deliver.rejectedBy)
            // deliver.rejectedBy = [];

            deliver.rejectedBy = deliver.rejectedBy.concat({userId:req.user._id,username:req.user.username})
            await deliver.save()
        }

         var receive = await Receive.findOne({userId:req.user._id,location:deliver.location,from:deliver.from,to:deliver.to,date:deliver.date})

         if(receive && receive.reqReceived.length > 0){
             receive.reqReceived = receive.reqReceived.filter((element) => {
                 return element.username !== req.body.username
             })
             await receive.save()
         }

         var user = await User.findOne({username:req.body.username})
         const payload  = JSON.stringify({title:'Connected Deliveries',name:req.user.username,mode:'recRejected'});
        res.send();
        webpush.sendNotification(user.subscriptionKey,payload).catch(err => console.error(err));

      }

      res.send();

    }catch(e){
        console.log(e);
        res.status(403).send();
    }
})

router.post('/accepted',auth,async (req,res) => {
    try{
        console.log(req.body);

        if(req.body.mode === 'del'){

            var deliver = await Deliver.findOne({userId:req.user._id})
            
            var receive = await Receive.findOne({username:req.body.username,location:deliver.location,from:deliver.from,to:deliver.to})
            console.log('receive',receive)
            receive.acceptedBy.username = req.user.username;
            receive.acceptedBy.userId = req.user._id;
            receive.vacancy = 1;
            await receive.save();

            deliver.vacancy = 1;
            await deliver.save();
             
            var user = await User.findOne({username:req.body.username})
              const payload  = JSON.stringify({title:'Connected Deliveries',name:req.user.username,mode:'deliveryAccepted'});
              webpush.sendNotification(user.subscriptionKey,payload).catch(err => console.error(err));
              res.send();

        }else{

            var deliver = await Deliver.findOne({username:req.body.username});
            console.log('deliver',deliver)
            console.log('deliver.acceptedBy',deliver.acceptedBy)
            deliver.acceptedBy.username = req.user.username;
            console.log('deliver.acceptedBy',deliver.acceptedBy)
            deliver.acceptedBy.userId = req.user._id;
            deliver.vacancy = 1;


            var receive = await Receive.findOne({username:req.user.username,location:deliver.location,from:deliver.from,to:deliver.to})
            console.log('receive',receive)
            receive.vacancy = 1;
            
            await deliver.save();
            await receive.save();

            var user = await User.findOne({username:req.body.username})
            console.log('user',user);
              const payload  = JSON.stringify({title:'Connected Deliveries',name:req.user.username,mode:'receiveAccepted'});
              res.send();
              webpush.sendNotification(user.subscriptionKey,payload).catch(err => console.error(err));

        }

    }catch(e){
        console.log(e);
        res.status(403).send();
    }
})

module.exports = router;
