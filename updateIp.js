var AWS = require("aws-sdk");
var http = require('http');
var os = require("os");

//http://docs.aws.amazon.com/amazondynamodb/latest/gettingstartedguide/GettingStarted.NodeJs.03.html


AWS.config.update({
  region: "eu-west-2",
  endpoint: "dynamodb.eu-west-2.amazonaws.com"
});

var docClient = new AWS.DynamoDB.DocumentClient();

updateNode();


function getPublicIP(cb){
  http.get('http://bot.whatismyipaddress.com', function(res){
      res.setEncoding('utf8');
      res.on('data', function(chunk){
          cb(chunk);
      });
  });
}

function updateNode(){
  var date = new Date();
  getPublicIP(function(cb){
    var table = "homePi_IP";
    var params = {
        TableName:table,
        Key:{
            "Hostname": os.hostname()
        },
        UpdateExpression: "set Public_IP = :p, Time_Updated=:t",
        ExpressionAttributeValues:{
          ":p": cb.toString(),
          ":t": date.toString()
        },
        ReturnValues:"UPDATED_NEW"
    };
    console.log("Updating the item...");
    docClient.update(params, function(err, data) {
        if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
        }
    });
  });
}

function insertNode(){
  var date = new Date();
  getPublicIP(function(cb){
    var table = "homePi_IP";
    var params = {
        TableName:table,
        Item:{
            "Hostname": os.hostname(),
            "Public_IP": cb.toString(),
            "Time_Updated": date.toString()
        }
    };
    insert(params);
  })

}

function insert(params){
  console.log("Adding a new item...");
  docClient.put(params, function(err, data) {
      if (err) {
          console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
          console.log("Added item:", JSON.stringify(data, null, 2));
      }
  });
}

function get(params, cb){
  console.log("Getting a item...");
  docClient.get(params, function(err, data) {
      if (err) {
          console.error("Unable to get item. Error JSON:", JSON.stringify(err, null, 2));
          cb(err);
      } else {
          //console.log("Got item:", JSON.stringify(data, null, 2));
          cb(data);
      }
  });
}
