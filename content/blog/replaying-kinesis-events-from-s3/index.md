Replaying from s3 to kinesis:

- Use PutRecord `SequenceNumberForOrdering` as a crutch
- Create replay stream
- List objects in bucket
- Hook up new projection to both replay stream and active stream
- Stream all objects in bucket to replay stream
- Start Active Stream from the last record in the bucket.