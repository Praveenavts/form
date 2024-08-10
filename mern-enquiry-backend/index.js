require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const EnquirySchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
});

const Enquiry = mongoose.model('Enquiry', EnquirySchema);

const sendEmail = (enquiry) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: enquiry.email,
        subject: 'Enquiry Received',
        text: `Dear ${enquiry.name},\n\nThank you for your enquiry. We will get back to you shortly.\n\nBest regards,\nYour Company`,
    };

    const adminMailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: 'New Enquiry Received',
        text: `New enquiry from ${enquiry.name} (${enquiry.email}):\n\n${enquiry.message}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('User email sent: ' + info.response);
    });

    transporter.sendMail(adminMailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Admin email sent: ' + info.response);
    });
};

app.post('/api/enquiry', async (req, res) => {
    const { name, email, message } = req.body;
    const newEnquiry = new Enquiry({ name, email, message });
    await newEnquiry.save();
    sendEmail(newEnquiry);
    res.status(200).send('Enquiry submitted successfully!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
