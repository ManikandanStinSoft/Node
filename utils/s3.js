const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const s3 = new AWS.S3({
  endpoint: new AWS.Endpoint(process.env.SPACES_ENDPOINT),
  credentials: {
    accessKeyId: process.env.SPACES_KEY,
    secretAccessKey: process.env.SPACES_SECRET,
  },
  // s3ForcePathStyle: true,
  signatureVersion: 'v4',
  sslEnabled: true,
});
async function uploadFileToSpaces(file, loanId) {
  const fileBuffer = fs.readFileSync(file.path);
  const folderName = `${loanId}`;
  const uploadParams = {
    Bucket: process.env.SPACES_BUCKET,
    Key: `${folderName}/${file.originalname}`,
    Body: fileBuffer,
    ContentType: file.mimetype,
  };
  const result = await s3.upload(uploadParams).promise();
  return result.Location;
}
// async function getCdnUrlWithPresignedUrl(filePath, fileName) {
//   try {
//     const presignedUrl = await generatePresignedUrl(filePath, fileName);
//     const url = new URL(presignedUrl);
//     const objectPath = url.pathname;
//     const cdnUrl = `${process.env.SPACES_CDN_LINK}${objectPath}${url.search}`;
//     return cdnUrl;
//   } catch (err) {
//     console.error('Error generating CDN URL: ', err);
//     throw err;
//   }
// }
async function generatePresignedUrl(filePath, fileName) {
  const actualFilePath = `${filePath}${fileName}`;
  const params = {
    Bucket: process.env.SPACES_BUCKET,
    Key: actualFilePath,
    Expires: 60 * 60,
  };
  try {
    const url = await s3.getSignedUrlPromise('getObject', params);
    return url;
  } catch (err) {
    throw err;
  }
}
module.exports = { uploadFileToSpaces,generatePresignedUrl };