require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
    console.log("Testing Nodemailer with:");
    console.log("Service:", process.env.EMAIL_SERVICE);
    console.log("User:", process.env.EMAIL_USER);
    // console.log("Pass:", process.env.EMAIL_PASS);

    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        await transporter.verify();
        console.log("✅ Success! Transporter is ready.");
    } catch (error) {
        console.error("❌ Error! Transporter failed:");
        console.error(error.message);
        if (error.message.includes('Invalid login')) {
            console.log("\n💡 TIP: It looks like an 'Invalid login'. If you're using Gmail, you MUST use an 'App Password', not your regular login password.");
        }
    }
};

testEmail();
