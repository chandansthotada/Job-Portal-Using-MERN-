⭐ Job Portal Using MERN Stack ⭐

A full-stack Job Portal web application built using the MERN Stack (MongoDB, Express, React, Node.js).
This platform allows recruiters to post jobs and job seekers to search and apply for jobs.

🚀 Features
👤 Authentication
User Signup & Login (JWT आधारित authentication)
Role-based access (Admin / Job Seeker)

💼 Job Management
Recruiters can:
Post new jobs
Edit jobs
Delete jobs
View applicants

🔎 Job Search
Search jobs by keyword
Filter jobs by location & category
View job details

📄 Job Application
Apply to jobs
Upload resume
Track applied jobs

🛠️ Tech Stack
Frontend
React.js
React Router
Axios
CSS / Bootstrap
Backend
Node.js
Express.js
MongoDB
Mongoose
JWT Authentication
Bcrypt (Password Hashing)

📁 Project Structure
Job-Portal-Using-MERN
│
├── client        → React Frontend
├── server        → Node/Express Backend
├── README.md
└── package.json

⚙️ Installation & Setup

1️⃣ Clone the Repository
git clone https://github.com/chandansthotada/Job-Portal-Using-MERN-.git

cd Job-Portal-Using-MERN-

2️⃣ Setup Backend
cd server
npm install
npm start

Backend runs on:

http://localhost:5000
3️⃣ Setup Frontend

Open new terminal:

cd client
npm install
npm start

Frontend runs on:

http://localhost:3000
🔐 Environment Variables

Create a .env file inside server folder and add:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000

📸 Screenshots (Add Later)
Login Page
Job Listings
Post Job Page
Apply Job Page

🎯 Future Improvements
Email notifications
Resume parsing
Admin dashboard analytics
Deployment (Render / Vercel)

👨‍💻 Author
Chandan T S
