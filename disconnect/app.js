const AWS = require("aws-sdk");
const DDB = new AWS.DynamoDB({ apiVersion: "2012-10-08" });

exports.handler = (event,context,callback) => {
    const deleteParams = {
        TableName: process.env.TABLE_NAME,
        Key: {
            connectionId: {
                S: event.requestContext.connectionId
            }
        }
    };

    DDB.deleteItem(deleteParams,err => {
        callback(null,{
            statusCode: err ? 500 :200,
            body: err ? "Failed to disconnect: " + JSON.stringify(err) : "Disconnected."
        });
    });
}