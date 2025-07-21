const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;


exports.updateApplicationHandler = async (event) => {
    const id = event.pathParameters?.id;

    const body = JSON.parse(event.body);

    if(!id || !body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Application ID and update data are required" }),
        };
    }

    const updatedExpression = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    for (const key in body) {
        updatedExpression.push(`#${key} = :${key}`);
        expressionAttributeValues[`:${key}`] = body[key];
        expressionAttributeNames[`#${key}`] = key;
    }
    

    const updateParams = {
        TableName: TABLE_NAME,
        Key: { id },
        UpdateExpression: updatedExpression.join(", "),
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "UPDATED_NEW"
    };

    try {
        const result = await dynamo.update(updateParams).promise();
        return {
            statusCode: 200,
            body: JSON.stringify(result.Attributes),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error" }),
        };
    }
}