const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const deliverSchema = new Schema({
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
        },
        time:{
            type:String
        },
        itemList:[{
            name:{
                type:String
            },
            qty:{
                type:Number
            }
        }],
    }],
    acceptedBy:{
        username:{
            type:String,
            unique:true
        },
        userId:{
            type:String,
            unique:true
        },
        time:{
            type:String
        },
        itemList:[{
            name:{
                type:String
            },
            qty:{
                type:Number
            }
        }],
    },
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
    vacancy:{
        type:Number,
        default:0
    },
    createdAt: { type: Date, expires: '1d', default: Date.now }
})


module.exports = mongoose.model('deliver',deliverSchema)