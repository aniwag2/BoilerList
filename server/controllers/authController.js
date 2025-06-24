const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { sendRegistrationEmail } = require('../utils/emailSender');

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        let userByEmail = await User.findOne({ email });
        if (userByEmail) {
            return res.status(400).json({ message: 'User with that email already exists' });
        }

        let userByUsername = await User.findOne({ username });
        if (userByUsername) {
            return res.status(400).json({ message: 'User with that username already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        const emailResult = await sendRegistrationEmail(newUser.email, newUser.username);
        if (emailResult.success) {
            console.log('Registration email successfully queued.');
        } else {
            console.error('Failed to send registration email:', emailResult.error);
        }

        res.status(201).json({ message: 'User registered successfully!' });

    } catch (error) {
        console.error('SERVER-SIDE ERROR during registration:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.keys(error.errors).map(key => error.errors[key].message);
            return res.status(400).json({ message: 'Validation failed', errors });
        }

        if (error.code === 11000) {
            let field = Object.keys(error.keyValue)[0];
            return res.status(400).json({ message: `A user with that ${field} already exists.` });
        }

        res.status(500).json({ message: 'Server error during registration. Please try again.' });
    }
};

module.exports = {
    registerUser,
};