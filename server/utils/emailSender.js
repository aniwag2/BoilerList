// server/utils/emailSender.js
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

const sendBuyerInterestEmail = async (sellerEmail, sellerUsername, buyerUsername, buyerEmail, listingName) => {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: sellerEmail,
        subject: `BoilerList: ${buyerUsername} is interested in your ${listingName}!`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #c28e0e;">New Interest in Your Listing!</h2>
                <p>Hi ${sellerUsername},</p>
                <p>Great news! <strong>${buyerUsername}</strong> is interested in your listing: <strong>${listingName}</strong>.</p>
                <p>You can contact them directly via email at: <a href="mailto:${buyerEmail}">${buyerEmail}</a></p>
                <p>Connect with them soon to finalize the sale!</p>
                <br>
                <p>Best regards,</p>
                <p>The BoilerList Team</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 0.8em; color: #777;">This is an automated email. Please do not reply to this email, but reply directly to the buyer's email address if you are interested in continuing the transaction.</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Buyer interest email sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending buyer interest email:', error);
        return { success: false, error: error.message };
    }
};

const sendInterestedBuyersListEmail = async (sellerEmail, sellerUsername, listingName, interestedBuyers) => {
    let buyersListHtml = '';
    if (interestedBuyers && interestedBuyers.length > 0) {
        buyersListHtml = `
            <p>Here's a list of users who have expressed interest in your <strong>${listingName}</strong> listing:</p>
            <ul style="list-style-type: none; padding: 0;">
        `;
        interestedBuyers.forEach(buyer => {
            buyersListHtml += `
                <li style="margin-bottom: 10px; padding: 10px; border: 1px solid #eee; border-radius: 5px; background-color: #f9f9f9;">
                    <strong>Username:</strong> ${buyer.username}<br>
                    <strong>Email:</strong> <a href="mailto:${buyer.email}">${buyer.email}</a><br>
                    <span style="font-size: 0.9em; color: #777;">(Expressed interest on ${new Date(buyer.expressedAt).toLocaleDateString()})</span>
                </li>
            `;
        });
        buyersListHtml += `</ul>
            <p>Feel free to reach out to them to discuss further!</p>
        `;
    } else {
        buyersListHtml = `<p>Currently, no buyers have expressed interest in your <strong>${listingName}</strong> listing.</p>`;
    }

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: sellerEmail,
        subject: `BoilerList: Interested Buyers for Your ${listingName} Listing`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #c28e0e;">Your Interested Buyers!</h2>
                <p>Hi ${sellerUsername},</p>
                ${buyersListHtml}
                <br>
                <p>Best regards,</p>
                <p>The BoilerList Team</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 0.8em; color: #777;">This is an automated email. Please do not reply.</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Interested buyers list email sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending interested buyers list email:', error);
        return { success: false, error: error.message };
    }
};

// --- NEW FUNCTION: sendListingUpdatedEmail ---
const sendListingUpdatedEmail = async (toEmail, buyerUsername, listingName) => {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: toEmail,
        subject: `BoilerList: Update on "${listingName}"`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #c28e0e;">Listing Update Notification</h2>
                <p>Hi ${buyerUsername},</p>
                <p>This is to let you know that the listing you are interested in or have favorited, <strong>"${listingName}"</strong>, has been updated by the seller.</p>
                <p>Please visit BoilerList to see the latest changes!</p>
                <br>
                <p>Best regards,</p>
                <p>The BoilerList Team</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 0.8em; color: #777;">This is an automated email, please do not reply.</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Listing updated email sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending listing updated email:', error);
        return { success: false, error: error.message };
    }
};

// --- NEW FUNCTION: sendListingSoldEmail ---
const sendListingSoldEmail = async (toEmail, buyerUsername, listingName) => {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: toEmail,
        subject: `BoilerList: "${listingName}" is no longer available`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #c28e0e;">Listing Status Update</h2>
                <p>Hi ${buyerUsername},</p>
                <p>This is to inform you that the listing you were interested in or had favorited, <strong>"${listingName}"</strong>, has been marked as sold or deleted by the seller and is no longer available on BoilerList.</p>
                <p>We apologize if this news is disappointing, but there are many other great listings available!</p>
                <br>
                <p>Best regards,</p>
                <p>The BoilerList Team</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 0.8em; color: #777;">This is an automated email, please do not reply.</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Listing sold/deleted email sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending listing sold/deleted email:', error);
        return { success: false, error: error.message };
    }
};


module.exports = {
    sendRegistrationEmail,
    sendBuyerInterestEmail,
    sendInterestedBuyersListEmail,
    sendListingUpdatedEmail, // Export new function
    sendListingSoldEmail,    // Export new function
};