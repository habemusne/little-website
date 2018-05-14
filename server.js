const express = require('express')
const axios = require('axios')
const AWS = require('aws-sdk')
const fileUpload = require('express-fileupload')
const Papa = require('papaparse')
const nodemailer = require('nodemailer')
const strs = require('stringstream')

// Create express router
const router = express.Router()

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
const AWS_REGION = process.env.AWS_REGION
const S3_BUCKET = process.env.S3_BUCKET

AWS.config.update({ accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY, region: AWS_REGION });
const s3 = new AWS.S3();

// Transform req & res to have the same API as express
// So we can use res.status() & res.json()
var app = express()
router.use(fileUpload());
router.use((req, res, next) => {
  Object.setPrototypeOf(req, app.request)
  Object.setPrototypeOf(res, app.response)
  req.res = res
  res.req = req
  next()
})

router.post('/upload', (req, res) => {
  const file = req.files.file
  const s3_key = `mass_emailer/csv/${Math.random().toString(36).substring(6)}/${file.name}`
  s3.upload({
    Bucket: S3_BUCKET,
    Key: s3_key,
    Body: file.data,
  }, function(err, data) {
    if (err) {
      console.log(err);
      res.status(500).json(err);
    }
    res.json({ code: 200, s3_key });
  });
})

router.post('/mass-send', async (req, res) => {
  try {
    console.log(req.body)
    // TODO remove s3 file
    const emailEncoded = encodeURIComponent(`${req.body.sender_email_account}:${req.body.sender_password}`);
    const mail_sender = nodemailer.createTransport(`smtps://${emailEncoded}@${req.body.smtp_server}`);
    const csv_s3_url = `https://s3.amazonaws.com/${S3_BUCKET}/${req.body.receivers_data_csv_s3_key}`
    console.log(csv_s3_url)
    s3.getObject({ Bucket: S3_BUCKET, Key: req.body.receivers_data_csv_s3_key }, function(err, data) {
        if (err) {
          console.log(err, err.stack);
        } else {
          Papa.parse(data.Body.toString(), {
            header: true,
            complete: function(results, file) {
              const params = Object.keys(results.data[0])
              const failed_emails = []
              let index = 0
              let handler = setInterval(async function() {
                const data_row = results.data[index]
                const subject = format_template(req.body.subject_template, params, data_row)
                const message = format_template(req.body.message_template, params, data_row)
                const response = await mail_sender.sendMail({
                  from: req.body.sender_email_account,
                  to: data_row.email,
                  subject,
                  html: message,
                })
                if (response.accepted.length == 0) {
                  failed_emails.push(data_row.email)
                }
                if (index == results.data.length) {
                  clearInterval(handler)
                  res.json({ code: 200, failed_emails })
                  return
                }
                index += 1
              }, parseInt(req.body.message_delay) * 1000)
            },
          })
        }
    }) 
  } catch (e) {
    console.log(e)
    res.json({ code: 500 });
  }
})

function format_template(template, params, data_row) {
  let result = template
  params.map(param => {
     result = result.replace(`{${param}}`, data_row[param])
  })
  return result
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
// Export the server middleware
module.exports = {
  path: '/api',
  handler: router
}
