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

  // create event to send to EventBridge
  const eventBridge = new AWS.EventBridge();
  
  const eventDetail = {
    applicationID: id,
    company,
    position,
    status,
    createdAt: item.createdAt,
    eventType: "ApplicationCreated",
  };

  // send the event created to EventBridge
  const response = await eventBridge.putEvents({
    Entries: [
      {
        Source: "jat-app",
        DetailType: "JobApplicationCreated",
        Detail: JSON.stringify(eventDetail),
      },
    ],
  }).promise();

  console.log("Event sent to EventBridge:", response);

  return {
    statusCode: 201,
    body: JSON.stringify({ message: "Application received and sent to EventBridge", id }),
  };
  } catch (error) {
    console.log(error); 
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }  
};