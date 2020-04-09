const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const serviceSchema = new Schema({
    username:{
        type:String
    },
    userId : {
        type:ObjectId
    },
    mode:{
        type:String
    },
    location : {
        type:String
    },
    from:{
        type:String
    },
    to:{
        type:String
    },
    date:{
        type:Date
    },
    time:{
        type:String
    },
    charge:{
        type:Number
    },
    itemList:{
        type:Array
    },
    createdAt: { type: Date, expires: '1m', default: Date.now }
})


module.exports = mongoose.model('Service',serviceSchema)