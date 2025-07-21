const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.TABLE_NAME;

exports.deleteApplicationHandler = async (event) => {
    const id = event.pathParameters?.id;

    if (!id) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Application ID is required" }),
        };
    }

    try {
        await dynamo.delete({
            TableName: TABLE_NAME,
            Key: { id }
        }).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Application deleted successfully" }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error" }),
        };
    }
}