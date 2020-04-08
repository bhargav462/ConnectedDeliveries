const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const serviceSchema = new Schema({
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
    }
})

module.exports = mongoose.model('Service',serviceSchema)