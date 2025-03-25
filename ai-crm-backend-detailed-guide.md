# AI CRM Backend: Layered Architecture Development Guide

## 1. Project Initialization and Setup

### 1.1 Project Structure
```
ai-crm-backend/
│
├── src/
│   ├── config/          # Configuration files
│   ├── models/          # Database models
│   ├── controllers/     # Business logic
│   ├── routes/          # API route definitions
│   ├── services/        # External service integrations
│   ├── middleware/      # Request processing middleware
│   └── utils/           # Utility functions
│
├── tests/               # Unit and integration tests
├── .env                 # Environment variables
├── package.json
└── server.js
```

### 1.2 Initial Project Setup
```bash
# Create project directory
mkdir ai-crm-backend
cd ai-crm-backend

# Initialize npm project
npm init -y

# Install core dependencies
npm install express mongoose dotenv
npm install -D nodemon jest supertest

# Create basic project structure
mkdir -p src/{config,models,controllers,routes,services,middleware,utils}
touch .env server.js
```

## 2. Authentication Layer

### 2.1 User Model (src/models/User.js)
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'sales_rep'],
    default: 'sales_rep'
  },
  profile: {
    firstName: String,
    lastName: String,
    department: String
  },
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Password hashing middleware
UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Password verification method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
```

### 2.2 Authentication Service (src/services/authService.js)
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  // Generate JWT token
  generateToken(user) {
    return jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  // User registration
  async register(userData) {
    try {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('User already exists');
      }

      const user = new User(userData);
      await user.save();

      return {
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        },
        token: this.generateToken(user)
      };
    } catch (error) {
      throw error;
    }
  }

  // User login
  async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return {
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      },
      token: this.generateToken(user)
    };
  }
}

module.exports = new AuthService();
```

### 2.3 Authentication Middleware (src/middleware/authMiddleware.js)
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No authentication token' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findOne({ 
      _id: decoded.id, 
      'tokens.token': token 
    });

    if (!user) {
      throw new Error();
    }

    // Attach user and token to request
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

// Role-based access control
const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

module.exports = {
  authMiddleware,
  roleMiddleware
};
```

### 2.4 Authentication Routes (src/routes/authRoutes.js)
```javascript
const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { authMiddleware } = require('../middleware/authMiddleware');

// User Registration
router.post('/register', async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Get User Profile (Protected Route)
router.get('/profile', authMiddleware, (req, res) => {
  res.json(req.user);
});

module.exports = router;
```

## 3. Development Progression Strategy

### Authentication Layer Implementation Steps:
1. Set up basic project structure
2. Install dependencies
3. Create User model with password hashing
4. Implement authentication service
5. Create authentication middleware
6. Develop authentication routes
7. Configure environment variables
8. Add error handling
9. Implement role-based access control

### Environment Configuration (.env)
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ai-crm
JWT_SECRET=your_very_secret_key_here
NODE_ENV=development
```

### Dependency Requirements
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^6.10.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^8.5.1",
    "dotenv": "^16.0.3"
  },
  "devDependencies": {
    "nodemon": "^2.0.20",
    "jest": "^29.3.1",
    "supertest": "^6.3.3"
  }
}
```

## 4. Next Development Phases
- Implement Customer CRUD operations
- Develop AI-powered insights service
- Create interaction tracking
- Add advanced filtering and search
- Implement comprehensive logging
- Set up monitoring and error tracking

## Best Practices
1. Use environment variables for sensitive information
2. Implement proper error handling
3. Use middleware for cross-cutting concerns
4. Keep services and routes decoupled
5. Use dependency injection where possible
6. Implement comprehensive logging
7. Write unit and integration tests
8. Use TypeScript for type safety (optional but recommended)
```

### Recommended Next Steps

1. **Authentication Hardening**
   - Implement password reset mechanism
   - Add multi-factor authentication
   - Create refresh token strategy

2. **Security Enhancements**
   - Rate limiting
   - CORS configuration
   - Input validation
   - Secure HTTP headers

3. **Monitoring & Logging**
   - Implement Winston or Pino for logging
   - Add request tracing
   - Create audit logs for critical actions

Would you like me to elaborate on any specific aspect of the authentication layer or the next development phases?