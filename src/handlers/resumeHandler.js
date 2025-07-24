exports.handler = async (event, context) => {
  console.log('S3 Event Received:', JSON.stringify(event, null, 2));
  // Extract bucket and object key for each record
  if (event.Records) {
    event.Records.forEach(record => {
      const bucket = record.s3.bucket.name;
      const key = record.s3.object.key;
      console.log(`File uploaded: Bucket = ${bucket}, Key = ${key}`);
    });
  } else {
    console.log('No S3 records found in event.');
  }
  return { statusCode: 200 };
};
