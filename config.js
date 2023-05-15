// let Url = "http://localhost:3112/"
let Url = "http://3.128.124.147:3112/"

module.exports = {
  localhost: 'http://localhost:3112',
    port: 3112,
    secretKey: "sk_test_51N4WoVI2yiufpT7jErxTFyOz0zDugh6hotEEDT092FTU6ERTa9s2LBGZPss6B9m1pYeMGTGatWMjtFCfxUu812dw00XczZt9Ss",
    production: {
        // username: 'mongoAdminBIT',
        // password: 'BiT^7129~jsQ​-P',
        // host: '162.243.110.92',
        // port: '27017',
        // dbName: 'rx123',
        // authDb: 'admin'
        //mongoose.connection.on

        username: '',
        password: '',
        host: '',
        port: '',
        dbName: '',
        authDb: 'admin'
    },
    local: {
        // database: "mongodb://localhost:27017/rx123", kuiktok@gmail.com       liveapp.brainium@gmail.com
         //MAIL_USERNAME: "darkomtourism",
         //MAIL_PASS: "75hvi8hyaWkrMPAW",
        database: "mongodb+srv://darkomtourism:75hvi8hyaWkrMPAW@darkom-tourism.lawwdxe.mongodb.net/test",
        username: 'darkomtourism',
        password: '75hvi8hyaWkrMPAW',
      //  MAIL_USERNAME: "root",
      //  MAIL_PASS: ""     
        //mongoose.connection.on
    },

    //liveUrl: "http://localhost:3112/",
    liveUrl: "http://3.128.124.147:3112/",         

    //liveUrl: "http://68.183.173.21:3004/", 
    dev_mode: true,
    __root_dir: __dirname,
      // __site_url: 'http://mydevfactory.com/~sanjib/dibyendu/rx123/',
    __site_url: 'http://3.128.124.147:3112/',
    limit:10
}
