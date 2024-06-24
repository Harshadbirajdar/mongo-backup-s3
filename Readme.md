# MongoDB Backup to S3

This script performs a MongoDB backup and uploads the backup file to an AWS S3 bucket. The backup process is automated to run at midnight every day using cron. The script is packaged as a Docker container for ease of deployment.

## Features

Automates MongoDB backups.
Compresses backup files into a zip archive.
Uploads the backup files to an AWS S3 bucket.
Runs daily at midnight using cron.

## Environment Variables

The script uses the following environment variables which need to be set:

- AWS_ACCESS_KEY_ID: Your AWS access key ID.
- AWS_SECRET_ACCESS_KEY: Your AWS secret access key.
- AWS_REGION: The AWS region where your S3 bucket is located.
- S3_BUCKET: The name of your S3 bucket.
- MONGODB_URL: The URI for your MongoDB database.


## Using Docker

The script is available as a Docker image. You can pull and run the Docker container as follows:

Pull the Docker image:

```
docker pull harshadbirajdar/mongo-backup-s3:latest
```

```
docker run -d \
  -e AWS_ACCESS_KEY_ID=your_aws_access_key_id \
  -e AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key \
  -e AWS_REGION=your_aws_region \
  -e S3_BUCKET=your_s3_bucket_name \
  -e MONGODB_URL=your_mongodb_uri \
  harshadbirajdar/mongo-backup-s3
```