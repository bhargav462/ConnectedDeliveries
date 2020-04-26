const express = require('express');
const router = express.Router();
const User = require('../models/user');
const _ = require('lodash')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth')

router.post('/register',async (req,res) => {
    console.log(req.body)
    const user = _.pick(req.body,['name','email','password','phoneNo','upiId','username']);
    user.del = req.body.password;
    console.log('user',user);
    
    const newUser = new User(user);
    newUser.save().then((result) => {
        console.log('saved suucessfully');
        res.status(200).send(result);
    }).catch(async (e) => {

        var username = await User.findOne({username:req.body.username},'username');

        console.log('username',username)

        if(username){
            return res.status(403).send({error:"username"})
        }

        var email = await User.findOne({email:req.body.email},'email')
        console.log('email',email);
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

router.post('/login',async function (req,res) {

    try{
 
            const user = await User.findOne({email:req.body.email})
        
            if(!user){
            return  res.status(400).send();
            }
            
            const isMatch = await bcrypt.compare(req.body.password,user.password);
        
            if(isMatch){
                console.log('user',user);
                const token = await user.generateAuthToken();
                console.log(token);
                res.cookie("token",token,{maxAge: 24*60*60000},{ httpOnly: true })
                res.send(token);
            }else{
                res.status(400).send();
            }
 
        }catch(e){
            console.log('error',e);
            res.status(400).send();
        }
     
 });

 router.post('/login/check',auth,async (req,res) => {
        const token =  req.cookies.token
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const user = await User.findOne({_id:decoded._id,'tokens.token':token },'username')
        
        if(!user){
            return res.status(404).send();
        }

        res.send({'user':user.username});
 })

 router.post('/getCookie',(req,res) => {
     console.log('cookies',req.cookies.token);
     res.clearCookie('token')

     res.send(req.cookies)
 })

 router.post('/logout',auth,async (req,res) => {
console.log('logout')
    try{
      req.user.tokens = req.user.tokens.filter((token) => {
          return token.token !== req.token
      })

      await req.user.save();
      res.clearCookie('token')
      res.render('Login');
    }catch(e){
      res.status(500).send();
    }

 })

module.exports = router