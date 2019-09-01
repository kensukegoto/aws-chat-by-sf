const AWS = require("aws-sdk");
const DDB = new AWS.DynamoDB({ apiVersion: "2012-10-08" });
const { TABLE_NAME } = process.env;

exports.onconnect = (event,context,callback) => {
    const putParams = {
        TableName: TABLE_NAME,
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


exports.ondisconnect = (event,context,callback) => {
    const deleteParams = {
        TableName: TABLE_NAME,
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

exports.sendmessage = async (event, context) => {

    let connectionData;

    try {
      connectionData = await DDB.scan({ TableName: TABLE_NAME, ProjectionExpression: 'connectionId' }).promise();
    } catch (e) {
      return { statusCode: 500, body: e.stack };
    }

    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
      apiVersion: '2018-11-29',
      endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
    });
    
    const postData = JSON.parse(event.body).data;
    console.log(postData);
  
    const postCalls = connectionData.Items.map(async ({ connectionId }) => {
        console.log(connectionId);
      try {
        await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: postData }).promise();
      } catch (e) {
          console.log("失敗かな");
          console.log(e);
        if (e.statusCode === 410) {
          console.log(`Found stale connection, deleting ${connectionId}`);
          await DDB.delete({ TableName: TABLE_NAME, Key: { connectionId } }).promise();
        } else {
          throw e;
        }
      }
    });
    
    try {
      await Promise.all(postCalls);
    } catch (e) {
      return { statusCode: 500, body: e.stack };
    }
  
    return { statusCode: 200, body: 'Data sent.' };
};
  