const { UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const AWS = require("aws-sdk");

const TABLE_NAME = process.env.TABLE_NAME;
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.processApplicationsHandler = async (event) => {
  const records = event.Records || [];

  //
//   {
//   "Records": [
//     {
//       "body": "{\"applicationID\":\"<some-id>\"}",
//       // ...other SQS metadata...
//     }
//   ]
// }

  for (const record of records) {
    // get the id from the record and 
    // then fetch the application from DynamoDB 
    
    console.log("Processing application ID step 1:");

    const body = JSON.parse(record.body);
    const applicationId = body.applicationID;

    console.log("Processing application ID step 2:", applicationId);

    const application = await dynamo.get({
        TableName: TABLE_NAME,
        Key: { id: applicationId }
    }).promise();

    if(!application.Item) {
      console.error(`Application with ID ${applicationId} not found`);
      continue; // skip to the next record
    }

    // process the application; 
    // update the status of the application 
    // and upsert it back to DynamoDB
   await dynamo.update({
      TableName: TABLE_NAME,
      Key: { id: applicationId },
      UpdateExpression: "set #status = :status, #processedAt = :processedAt",
      ExpressionAttributeNames: {
        "#status": "status",
        "#processedAt": "processedAt"
      },
      ExpressionAttributeValues: {
        ":status": 'Processed',
        ":processedAt": new Date().toISOString(),
      }
    }).promise();

    return {
        statusCode: 200,
    }
  }

  return { statusCode: 200, body: "Applications processed successfully" };
}