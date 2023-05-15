const mongoose = require("mongoose");
//const{DB_HOST,DB_PORT,DB_NAME,username,password,authDb} = require('./bootstrap')
/* description:@connect mongodb */
const productionDBString = "mongodb+srv://darkomtourism:75hvi8hyaWkrMPAW@darkom-tourism.lawwdxe.mongodb.net/test"; /* MOngodb connection String*/
mongoose.connect( productionDBString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
    //useCreateIndex: true
  },(err) => {
    if (err) {
      console.log(`mongodb connection failed`, err);
    } else {
      console.log("Database connected successfully");
    }
  }
);
mongoose.connection.on('connect',()=>{
  console.log('mongodb connection successfull'); //mongodb connection emit
});
mongoose.connection.on('error',(err)=>{
  console.log('mongodb connection unsuccessfull',err); //mongodb error emit
});
mongoose.connection.on('disconnected',()=>{
  console.log('mongodb disconnected...trying to reconnect...please wait...'); //mongodb disconnect..trying to reconnect
  mongoose.createConnection();
});