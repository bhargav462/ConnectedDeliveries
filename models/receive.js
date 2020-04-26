const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const receiveSchema = new Schema({
    username:{
        type:String
    },
    userId : {
        type:ObjectId
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
    reqSent:[{
        username:{
            type:String,
            unique:true
          },
          userId:{
              type:ObjectId,
              unique:true
          }
    }],
    reqReceived:[{
        username:{
            type:String,
            unique:true
          },
          userId:{
              type:ObjectId,
              unique:true
          }
    }],
    rejectedBy:[{
        username:{
            type:String,
            unique:true
          },
          userId:{
              type:ObjectId,
              unique:true
          }
    }],
    acceptedBy:{
        username:{
            type:String,
            unique:true
          },
          userId:{
              type:ObjectId,
              unique:true
          }
    },
    vacancy:{
        type:Number,
        default:0
    },
    createdAt: { type: Date, expires: '1d', default: Date.now }
})


module.exports = mongoose.model('receive',receiveSchema)