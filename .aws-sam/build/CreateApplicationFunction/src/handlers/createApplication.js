const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;

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

  await dynamo.put({
    TableName: TABLE_NAME,
    Item: item,
  }).promise();

  return {
    statusCode: 201,
    body: JSON.stringify({ message: "Application created", id }),
  };
};