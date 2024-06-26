const env = process.env.NODE_ENV || 'development';

if(env === 'production' || env === 'development'){
    var config = require('./config.json');
    var envConfig = config[env];
    Object.keys(envConfig).forEach((key) =>{
        process.env[key] = envConfig[key];
    })
}

module.exports = {config:env}