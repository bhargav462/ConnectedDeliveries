const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req,res,next) => {
    try {
        const token =  req.cookies.token
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const user = await User.findOne({_id:decoded._id,'tokens.token':token })

        if(!user){
            console.log('Login')
           return res.redirect("/login")
        }

        req.user = user
        req.token = token
        next()

    } catch (err) {
        console.log('error')
        res.render('Login')
    }

}

module.exports = auth