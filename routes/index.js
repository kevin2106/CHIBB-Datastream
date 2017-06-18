var express = require('express');
var router = express.Router();
var mqtt = require('mqtt');
var timestamp = require('unix-timestamp');
var _ = require('lodash');
const config = require('config');
const mongoDBClient = require('mongodb').MongoClient;


let db;

mongoDBClient.connect(config.mongo.url)
.then(connection => {
  db = connection.collection(config.mongo.collection);
  }
)
.catch(err => {
  console.error(err);
});

const clientOptions = {
    port: 8083,
    clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    username: 'student_api',
    password: 'QL#vo9v1h6w6whX'
};

var client = mqtt.connect('wss://mqtt.chibb-box.nl', clientOptions);

client.on('connect', function () {
  client.subscribe('sensors')
  console.log("Subscribed to sensors channel");
})

client.on('message', function (topic, message) {
    const object = JSON.parse(message);
    _.forEach(object.readings, function(value, key) {
      console.log(timestamp.toDate(value.timestamp));
      var values = {"TimeStamp": timestamp.toDate(value.timestamp),
                     "Value":   value.reading};
      if(value.type == 'temperature'){
        db.update({ "Name" : "Woonkamer" }, { $push: { "Readings" : values }})
          .catch(err => {
            console.error(err);
          });
        console.log("Value: " + value.type + " : " + "Key: " + key );
      } 
    });
  });



/* GET home page. */
router.get('/', function(req, res) {
console.log("/TestPage");
});

module.exports = router;
