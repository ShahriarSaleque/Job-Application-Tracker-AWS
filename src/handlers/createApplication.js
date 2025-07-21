const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

const QUEUE_URL = process.env.QUEUE_URL;
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;
const sqs = new SQSClient({ region: process.env.AWS_REGION });

exports.createApplicationHandler = async (event) => {
  const { company, position, status } = JSON.parse(event.body);
  const id = uuidv4();

  const item = {
    id,
    company,
    position,
    status,
    createdAt: new Date().toISOString(),
  };

  try {
    await dynamo.put({
    TableName: TABLE_NAME,
    Item: item,
  }).promise();

  // send message to SQS with new application id
  const response = await sqs.send(new SendMessageCommand({
    QueueUrl: QUEUE_URL,
    MessageBody: JSON.stringify({applicationID: id}),
  })); 

  console.log(`Message sent to SQS: ${response}`);

  return {
    statusCode: 201,
    body: JSON.stringify({ message: "Application received and queued", id }),
  };
  } catch (error) {
    console.log(error); 
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }  
};