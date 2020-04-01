const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
    name:{
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
    tokens:[{
        token:{
            type:String,
            expiresIn : "1d"
        }
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
    const token = jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({token})
    await user.save()

    return token
}

module.exports = mongoose.model("User",userSchema);