var express = require('express');
var router = express.Router();
var mqtt = require('mqtt');
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
    username: config.mqtt.username,
    password: config.mqtt.password
};

var client = mqtt.connect(config.mqtt.url, clientOptions);

client.on('connect', function () {
  client.subscribe('sensors')
  console.log("Subscribed to sensors channel")
})

  client.on('message', function (topic, message) {
    const object = JSON.parse(message);
    _.forEach(object.readings, function(value, key) {
      var values = {"Timestamp": value.timestamp,
                     "Value":   value.reading};
      db.update({ "Type" : value.type }, { $push: { "Readings" : values }})
        .catch(err => {
          console.error(err);
        });
      console.log("Value: " + value.type + " : " + "Key: " + key );
    });
  });


/* GET home page. */
router.get('/', function(req, res) {
console.log("/TestPage");
});

module.exports = router;
