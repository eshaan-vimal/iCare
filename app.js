const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/SickSense', express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname)));

mongoose.connect('mongodb://localhost:27017/sicksense')
.then(() => console.log('Connected to MongoDB successfully'))
.catch(err => 
{
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    personalInfo: {
        name: String,
        age: Number,
        gender: String,
        height: Number,
        weight: Number
    }
}, 
{
    timestamps: true
});

const User = mongoose.model('User', userSchema);

const authenticateToken = (req, res, next) => 
{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) 
    {
        return res.status(401).json({ status: 'error', message: 'Access denied' });
    }

    jwt.verify(token, 'your-secret-key', (err, user) => 
    {
        if (err) 
        {
            return res.status(403).json({ status: 'error', message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

app.get('/', (req, res) => 
{
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/dashboard', authenticateToken, (req, res) => 
{
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/register', (req, res) => 
{
    res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/about', (req, res) => 
{
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/contact', (req, res) => 
{
    res.sendFile(path.join(__dirname, 'contact.html'));
});

app.post('/register', async (req, res) => 
{
    try
    {
        const { username, password } = req.body;

        if (!username || !password) 
        {
            return res.status(400).json({
                status: 'error',
                message: 'Username and password are required'
            });
        }

        if (username.length < 3) 
        {
            return res.status(400).json({
                status: 'error',
                message: 'Username must be at least 3 characters long'
            });
        }

        if (password.length < 6) 
        {
            return res.status(400).json({
                status: 'error',
                message: 'Password must be at least 6 characters long'
            });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) 
        {
            return res.status(409).json({
                status: 'error',
                message: 'Username already exists'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            password: hashedPassword,
            personalInfo: {},
            medicalInfo: {
                symptoms: [],
                lifestyle: {}
            },
            reports: []
        });

        await newUser.save();

        res.status(201).json({
            status: 'success',
            message: 'Registration successful'
        });

    } 
    catch (error) 
    {
        console.error('Registration error:', error);
        
        if (error.name === 'ValidationError') 
        {
            return res.status(400).json({
                status: 'error',
                message: Object.values(error.errors).map(err => err.message).join(', ')
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'An error occurred during registration'
        });
    }
});

app.post('/login', async (req, res) => 
{
    try 
    {
        const { username, password } = req.body;

        if (!username || !password) 
        {
            return res.status(400).json({
                status: 'error',
                message: 'Username and password are required'
            });
        }

        const user = await User.findOne({ username });
        if (!user) 
        {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid username or password'
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) 
        {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid username or password'
            });
        }

        const token = jwt.sign(
            { userId: user._id, username: user.username },
            'your-secret-key',
            { expiresIn: '1h' }
        );

        res.json({
            status: 'success',
            token,
            username: user.username
        });

    } 
    catch (error) 
    {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred during login'
        });
    }
});

app.post('/api/personal-info', authenticateToken, async (req, res) => 
{
    try 
    {
        const { name, age, gender, height, weight } = req.body;
        
        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            {
                $set: {
                    personalInfo: { name, age, gender, height, weight }
                }
            },
            { new: true }
        );

        res.json({
            status: 'success',
            message: 'Personal information updated successfully',
            data: updatedUser.personalInfo
        });
    } 
    catch (error) 
    {
        console.error('Update error:', error);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while updating personal information'
        });
    }
});

app.get('/api/profile', authenticateToken, async (req, res) => 
{
    try 
    {
        const user = await User.findById(req.user.userId).select('-password');
        res.json({
            status: 'success',
            data: user
        });
    } 
    catch (error) 
    {
        console.error('Fetch profile error:', error);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while fetching profile information'
        });
    }
});

app.post('/api/predict', async (req, res) => 
{
    const { symptomsInput } = req.body;
    const apiKey = 'AIzaSyDVTryXu8lvMHSoFwJQ4RoQTFOPeVXdGo8';
    const genAI = new GoogleGenerativeAI(apiKey);

    try 
    {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const diseasePrompt = `In theory, (${symptomsInput}) are the likely symptoms of which disease. Explain scientifically.`;
        const diseaseResponse = await model.generateContent(diseasePrompt);
        const diseaseText = diseaseResponse.response.text() || 'No prediction available';

        const treatmentPrompt = `In modern textbook theory how are diseases with these symptoms ${symptomsInput} cured. Explain scientifically.`;
        const treatmentResponse = await model.generateContent(treatmentPrompt);
        const treatmentText = treatmentResponse.response.text() || 'No treatment available';

        res.json({ disease: diseaseText, remedy: treatmentText });

    } 
    catch (error) 
    {
        console.error('Error fetching from Gemini API:', error);
        res.status(500).json({ error: 'Failed to fetch data from Gemini API' });
    }
});

const feedbackSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

app.post('/api/contact', async (req, res) => 
{
    try 
    {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) 
        {
            return res.status(400).json({
                status: 'error',
                message: 'All fields are required'
            });
        }

        const newFeedback = new Feedback({
            name,
            email,
            subject,
            message
        });

        await newFeedback.save();

        res.status(201).json({
            status: 'success',
            message: 'Feedback submitted successfully'
        });

    } 
    catch (error) 
    {
        console.error('Feedback submission error:', error);
        
        if (error.name === 'ValidationError') 
        {
            return res.status(400).json({
                status: 'error',
                message: Object.values(error.errors).map(err => err.message).join(', ')
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'An error occurred while submitting feedback'
        });
    }
});

app.get('/api/feedback', authenticateToken, async (req, res) => 
{
    try 
    {
        const feedback = await Feedback.find().sort({ submittedAt: -1 });
        res.json({
            status: 'success',
            data: feedback
        });
    } 
    catch (error) 
    {
        console.error('Fetch feedback error:', error);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while fetching feedback'
        });
    }
});

app.listen(port, () => 
{
    console.log(`Server running on http://localhost:${port}`);
});
