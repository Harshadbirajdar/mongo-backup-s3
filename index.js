const { exec } = require("child_process");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");
const { getDbName, formatDate } = require("./utils");
const cron = require("node-cron");
require("dotenv").config();

// Configure AWS S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const S3_BUCKET = process.env.S3_BUCKET;
const mongoUri = process.env.MONGODB_URL;

const backupDir = "backup";
const dbName = getDbName(mongoUri);

const backupMongoDB = () => {
  const zipFileName = `${formatDate(new Date())}.zip`;

  return new Promise((resolve, reject) => {
    const dumpCommand = `mongodump --uri="${mongoUri}" --out="${backupDir}"`;

    exec(dumpCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Backup error: ${stderr}`);
        reject(error);
      } else {
        exec(
          `zip -r ${zipFileName} ${backupDir}`,
          (zipError, zipStdout, zipStderr) => {
            if (zipError) {
              console.error(`Failed to create zip file: ${zipError}`);
              return;
            }
            console.log("Zip file created successfully.");
            const zipFilePath = path.join(__dirname, zipFileName);

            resolve(zipFilePath);
          }
        );
        console.log(`Backup stdout: ${stdout}`);
      }
    });
  });
};

// Function to upload the backup to S3
const uploadToS3 = (filePath) => {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(filePath);
    const params = {
      Bucket: S3_BUCKET,
      Key: `db/${dbName}/${path.basename(filePath)}`,
      Body: fileStream,
    };

    const command = new PutObjectCommand(params);

    s3Client.send(command)
      .then((data) => {
        const s3Location = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/db/${dbName}/${path.basename(filePath)}`;
        console.log(`Upload success: ${s3Location}`);
        resolve(s3Location);
      })
      .catch((err) => {
        console.error(`Upload error: ${err}`);
        reject(err);
      });
  });
};

// Main function to perform the backup and upload
const main = async () => {
  try {
    console.log("Starting MongoDB backup...");
    const backupFilePath = await backupMongoDB();
    console.log("Backup completed. Uploading to S3...");
    const s3Location = await uploadToS3(backupFilePath);

    console.log(`Backup successfully uploaded to S3: ${s3Location}`);
  } catch (error) {
    console.error(`Error during backup process: ${error}`);
  }
};

const job = cron.schedule("0 0 * * *", () => {
  main();
});

main();

job.start();
