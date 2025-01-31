const axios = require('axios');
require('dotenv').config();

// Template Id: b4215063-5cb6-49e0-9fee-49731e7567ae
// Alias: howdy-otp

// test

const apiKey = '937d38cba2609e88e6a3736c7803d997'
const baseUrl = 'https://rest.qikberry.ai/v1';

// const apiKey = process.env.QIKSMS_API_KEY;
// const baseUrl = process.env.QIKSMS_BASE_URL;

exports.sendOTP = async (otp, phone) => {
    try {
        const response = await axios.post(
            `${baseUrl}/sms/messages`,
            {
                "to": `${phone}`,
                "sender": "HOWDYC",
                "service": "SI",
                "template_id": "1707171617322661330",
                "message": `${otp} is your verification code for Howdy Chats`
            },
            // {
            //     "alias": "howdy-otp",
            //     "recipient": {
            //       "to": [`+${phone}`]
            //     },
            //     "data": {
            //       "otp": otp
            //     },
            //     "meta": {
            //         "webhook_id": "adaf6f9d-c020-4902-ae27-7743b125fcbc",
            //         "tags": ["tag1", "tag2"]
            //       }
            //   },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // console.log(response.data);
        return response.data;
    } catch (error) {
        console.error(error.response.data.error);
        return error;
    }
}