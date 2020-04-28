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
    itemList:[{
        name:{
            type:String
        },
        qty:{
            type:Number
        }
    }],
    reqSent:[{
        username:{
            type:String
          },
          userId:{
              type:ObjectId
          }
    }],
    reqReceived:[{
        username:{
            type:String
          },
          userId:{
              type:ObjectId
          },time:{
              type:String
          }
    }],
    rejectedBy:[{
        username:{
            type:String
          },
          userId:{
              type:ObjectId
          }
    }],
    acceptedBy:{
        username:{
            type:String
          },
          userId:{
              type:ObjectId
          },
          time:{
              type:String
          }
    },
    vacancy:{
        type:Number,
        default:0
    },
    createdAt: { type: Date, expires: '1d', default: Date.now }
})


module.exports = mongoose.model('receive',receiveSchema)