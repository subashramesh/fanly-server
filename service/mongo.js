require('dotenv').config();
const mongoose = require('mongoose');
console.log(process.env.MONGO_URL)
const connection = mongoose.createConnection(process.env.MONGO_URL);
connection.on('open', function () {
    console.log("MongoDB is connected and ready at: "+new Date());
});

connection.on('error', function(err) {
    console.log("MongoDB connection Error at: "+new Date(), err);
});

connection.on('close', function(str) {
    console.log("MongoDB Disconnected at: "+new Date(),str);
});