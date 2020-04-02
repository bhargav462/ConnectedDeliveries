const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req,res,next) => {
    try {
        const token =  req.cookies.token
        console.log('auth',token)
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const user = await User.findOne({_id:decoded._id,'tokens.token':token })
        console.log(user);

        if(!user){
            res.render('Login');
        }

        req.user = user
        req.token = token
        next()

    } catch (err) {
        res.render('Login');
    }

}

module.exports = auth