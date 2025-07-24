const response = require('cfn-response');

exports.handler = function (event, context) {
  console.log('Received event:', JSON.stringify(event));
  
  try {
    response.send(event, context, response.SUCCESS);
  } catch (e) {
    console.error('Failed sending cfn-response', e);
    response.send(event, context, response.FAILED);
  }
};
