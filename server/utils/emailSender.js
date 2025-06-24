const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

const sendRegistrationEmail = async (toEmail, username) => {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: toEmail,
        subject: 'Welcome to BoilerList! Your Account Has Been Created',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #c28e0e;">Welcome, ${username}!</h2>
                <p>Thank you for registering with BoilerList. Your account has been successfully created.</p>
                <p>We're excited to have you on board.</p>
                <p>If you have any questions or need assistance, feel free to contact us.</p>
                <p>Best regards,</p>
                <p>The BoilerList Team</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 0.8em; color: #777;">This is an automated email, please do not reply.</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending registration email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendRegistrationEmail,
};