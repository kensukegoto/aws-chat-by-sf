const AWS = require("aws-sdk");
const DDB = new AWS.DynamoDB({ apiVersion: "2012-10-08" });

module.exports.connect = (event,context,callback) => {
    const putParams = {
        TableName: process.env.TABLE_NAME,
        Item: {
            connectionId: { S: event.requestContext.connectionId }
        }
    };
    DDB.putItem(putParams, err => {
        callback(null,{
            statusCode: err ? 500 : 200,
            body: err ? "Failed to connect: " + JSON.stringify(err) : "Connected."
        });
    });
};