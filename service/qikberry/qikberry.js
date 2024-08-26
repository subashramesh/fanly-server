const axios = require('axios');
require('dotenv').config();

// Template Id: b4215063-5cb6-49e0-9fee-49731e7567ae
// Alias: howdy-otp

// test

const apiKey = process.env.QIKSMS_API_KEY;
const baseUrl = process.env.QIKSMS_BASE_URL;

exports.sendOTP = async (otp, phone) => {
    try {
        const response = await axios.post(
            `${baseUrl}/sms/send/template`,
            {
                "alias": "howdy-otp",
                "recipient": {
                  "to": [phone]
                },
                "data": {
                  "otp": otp
                },
                "meta": {
                    "webhook_id": "adaf6f9d-c020-4902-ae27-7743b125fcbc",
                    "tags": ["tag1", "tag2"]
                  }
              },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error(error);
        return error;
    }
}