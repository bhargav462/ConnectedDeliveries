const express = require('express');
const router = express.Router();
const User = require('../models/user');
const _ = require('lodash')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register',async (req,res) => {
    console.log(req.body)
    const user = _.pick(req.body,['name','email','password','phoneNo','upiId']);
    console.log('user',user);
    
    const newUser = new User(user);
    newUser.save().then((result) => {
        console.log('saved suucessfully');
        res.status(200).send(result);
    }).catch(async (e) => {
        var email = await User.findOne({email:req.body.email},'email')
        if(email)
        {
            return res.status(403).send({ error: "email" });
        }
        var phoneNo = await User.findOne({phoneNo:req.body.phoneNo},'phoneNo')
        if(phoneNo)
        {
            return res.status(403).send({ error: "phoneNo" });
        }
        var upiId  = await User.findOne({upiId:req.body.upiId},'upiId')
        if(upiId)
        {
            return res.status(403).send({ error: "upiId" });
        }
    })
   
});

module.exports = router