const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.TABLE_NAME;

exports.getApplicationByIdHandler = async (event) => {
    const id = event.pathParameters?.id;

    if(!id) {
        return {
            statusCode: 400,
            body: JSON.stringify({message: "Application ID is required"}),
        }
    }

    try {
        const data = await dynamo.get({
            TableName: TABLE_NAME,
            Key: { id }
        }).promise();

        if (!data.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Application not found" }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(data?.Item),
        };
        
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error" }),
        };
    }
}