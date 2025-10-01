# Smart Study Scheduler 📚

A comprehensive AI-powered study scheduling web application designed for students to optimize their learning experience with intelligent scheduling, analytics, and personalized insights.

## 🌟 Features

### Core Features
- **User Authentication** - Secure signup, login, and profile management
- **Smart Task Management** - Add, edit, delete, and organize study tasks
- **AI-Powered Scheduling** - Intelligent schedule generation based on preferences and deadlines
- **Study Timer** - Pomodoro technique with customizable intervals
- **Analytics Dashboard** - Comprehensive insights into study patterns and productivity
- **Progress Tracking** - Streaks, achievements, and goal monitoring

### Advanced Features
- **Mood & Energy Tracking** - Correlate study performance with mental state
- **Gamification** - Badges, achievements, and progress rewards
- **Personalization** - Custom themes, color schemes, and motivational quotes
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Themes** - Multiple theme options for comfortable studying

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Authentication**: JWT (JSON Web Tokens)
- **Charts**: Chart.js for analytics visualization
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Inter)

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 14.0 or higher)
- **npm** (comes with Node.js)
- **Git** (optional, for cloning)

## 🚀 Installation & Setup

### Step 1: Clone or Download the Project

If you have Git installed:
```bash
git clone <repository-url>
cd smart-study-scheduler
```

Or download the ZIP file and extract it to your desired location.

### Step 2: Install Dependencies

Open a terminal/command prompt in the project directory and run:

```bash
npm install
```

This will install all required dependencies including:
- express
- sqlite3
- bcryptjs
- jsonwebtoken
- cors
- dotenv
- helmet
- morgan
- express-rate-limit

### Step 3: Initialize the Database

Run the database initialization script:

```bash
npm run init-db
```

This will:
- Create the SQLite database file
- Set up all required tables
- Insert sample motivational quotes

### Step 4: Configure Environment Variables

The `.env` file is already created with default values. For production, update these values:

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
DB_PATH=./database/study_scheduler.db
SESSION_SECRET=your_session_secret_key_change_this_too
```

**Important**: Change the JWT_SECRET and SESSION_SECRET to secure random strings in production!

### Step 5: Start the Application

For development (with auto-restart on changes):
```bash
npm run dev
```

For production:
```bash
npm start
```

### Step 6: Access the Application

Open your web browser and navigate to:
```
http://localhost:3000
```

## 📱 Using the Application

### Getting Started

1. **Create Account**: Click "Sign up here" and create your account
2. **Login**: Use your credentials to log in
3. **Explore Dashboard**: View your study overview and quick actions
4. **Add Tasks**: Click "Add Task" to create your first study task
5. **Generate Schedule**: Use the AI scheduler to optimize your study time
6. **Start Studying**: Use the built-in timer for focused study sessions

### Key Features Guide

#### 🎯 Task Management
- Create tasks with subjects, priorities, and deadlines
- Set estimated duration and difficulty levels
- Add tags for better organization
- Track actual time spent vs. estimated

#### 🤖 AI Scheduling
- Automatically generates optimal study schedules
- Considers task priorities, deadlines, and user preferences
- Breaks long tasks into manageable Pomodoro sessions
- Provides scheduling recommendations and insights

#### ⏱️ Study Timer
- Pomodoro technique with customizable intervals
- Track mood and energy levels before/after sessions
- Automatic break reminders
- Session history and statistics

#### 📊 Analytics
- Study time tracking and visualization
- Subject-wise performance analysis
- Productivity patterns and insights
- Streak tracking and achievements

#### 🎨 Personalization
- Multiple themes (Light, Dark, Pastel, Minimal)
- Color scheme options
- Daily motivational quotes
- Customizable study preferences

## 🗂️ Project Structure

```
smart-study-scheduler/
├── database/
│   ├── init.js              # Database initialization
│   ├── connection.js        # Database connection handler
│   └── study_scheduler.db   # SQLite database file
├── middleware/
│   └── auth.js             # Authentication middleware
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── tasks.js            # Task management routes
│   ├── analytics.js        # Analytics and session routes
│   └── users.js            # User preferences routes
├── utils/
│   └── aiScheduler.js      # AI scheduling algorithms
├── public/
│   ├── css/
│   │   ├── styles.css      # Main styles
│   │   ├── themes.css      # Theme variations
│   │   └── components.css  # Component styles
│   ├── js/
│   │   ├── app.js          # Main application controller
│   │   ├── auth.js         # Authentication handler
│   │   ├── dashboard.js    # Dashboard functionality
│   │   ├── api.js          # API communication
│   │   └── utils.js        # Utility functions
│   └── index.html          # Main HTML file
├── server.js               # Express server
├── package.json            # Dependencies and scripts
├── .env                    # Environment variables
└── README.md              # This file
```

## 🔧 Development

### Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon
- `npm run init-db` - Initialize the database

### Adding New Features

1. **Backend**: Add routes in the `routes/` directory
2. **Frontend**: Create corresponding JavaScript modules in `public/js/`
3. **Database**: Update schema in `database/init.js` if needed
4. **Styling**: Add styles in the appropriate CSS files

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

#### Tasks
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/generate-schedule` - Generate AI schedule

#### Analytics
- `GET /api/analytics/dashboard` - Dashboard analytics
- `POST /api/analytics/session/start` - Start study session
- `PUT /api/analytics/session/:id/end` - End study session

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS protection
- Helmet.js security headers

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   - Change the PORT in `.env` file
   - Or kill the process using the port

2. **Database errors**
   - Run `npm run init-db` to reinitialize
   - Check file permissions in the database directory

3. **Module not found errors**
   - Run `npm install` to ensure all dependencies are installed
   - Clear npm cache: `npm cache clean --force`

4. **Authentication issues**
   - Check JWT_SECRET in `.env` file
   - Clear browser localStorage and try again

### Getting Help

If you encounter issues:
1. Check the browser console for JavaScript errors
2. Check the server logs in the terminal
3. Ensure all dependencies are properly installed
4. Verify the database was initialized correctly

## 🚀 Deployment

For production deployment:

1. Set `NODE_ENV=production` in `.env`
2. Update JWT_SECRET and SESSION_SECRET with secure values
3. Configure proper database backup strategy
4. Set up process manager (PM2) for production
5. Configure reverse proxy (Nginx) if needed
6. Enable HTTPS for secure authentication

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

This is a portfolio project, but suggestions and improvements are welcome!

## 📞 Support

For support or questions about this project, please create an issue in the repository or contact the developer.

---

**Happy Studying! 🎓**

Built with ❤️ for students who want to optimize their learning journey.
