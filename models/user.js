const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

let userSchema = new Schema({
    username:{
        type:String,
        unique:true
    },
    name:{
        type:String
    },
    del:{
        type:String
    },
    email:{
        type:String,
        unique:true,
        required:true,
        match:/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    },
    password:{
        type:String,
        required:true
    },
    phoneNo:{
        type:Number,
        required:true,
        unique:true
    },
    upiId:{
        type:String,
        required:true,
        unique:true
    },
    subscriptionKey:{
        type:Object
    },
    tokens:[{
        token:{
            type:String        }
    }]
})

userSchema.pre('save',async function(next){
  
    const user = this;

    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password,8);
    }

})

userSchema.methods.generateAuthToken = async function(){
    const user = this
    console.log('secret',process.env.JWT_SECRET)
    const token = jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET,{expiresIn:24*60*60*1000})
    console.log('token',token);
    user.tokens = user.tokens.concat({token})
    await user.save()

    return token
}

module.exports = mongoose.model("User",userSchema);