# Recruitment Management System (RMS)

A professional, modern, and data-driven Recruitment Management System built with the MERN stack (MongoDB, Express, React, Node.js). This platform streamlines the hiring process by managing candidates, job postings, and interviews in one centralized location.

## 🚀 Features

### **For Recruiters & Admins**
- **Dashboard Analytics**: Visualized recruitment metrics using Chart.js, including candidate pipelines and hiring trends.
- **Candidate Management**: Comprehensive profiles with resume uploads, status tracking (Engaged, Hired, etc.), and direct messaging.
- **Job Management**: Create, edit, and close job postings with a premium, user-friendly interface.
- **Interview Scheduling**: Integrated scheduling and messaging system for seamless communication.
- **Secure Authentication**: JWT-based login/logout for secure access.

### **Technical Excellence**
- **Responsive UI**: Sleek, mobile-first design using Tailwind CSS 4 and Radix UI components.
- **Dynamic Animations**: Smooth transitions and micro-animations with Framer Motion.
- **Cloud Storage**: Seamless resume and avatar uploads powered by Cloudinary.
- **Input Validation**: Robust server-side validation using Joi and client-side form handling.
- **Real-time Feedback**: Interactive elements with hover effects and responsive layouts.

## 🛠️ Tech Stack

### **Frontend**
- **React 19**: Modern UI development.
- **Vite 8**: Ultra-fast build and development tool.
- **Tailwind CSS 4**: Next-gen utility-first styling.
- **Chart.js**: Dynamic data visualization.
- **Framer Motion**: Premium interactive animations.
- **Radix UI**: Accessible UI component primitives.
- **Lucide React**: Clean and consistent iconography.

### **Backend**
- **Node.js & Express 5**: Scalable server architecture.
- **MongoDB & Mongoose**: Flexible NoSQL database management.
- **JWT & Bcryptjs**: Secure authentication and password hashing.
- **Cloudinary**: Cloud-based image and file management.
- **Nodemailer**: Email communication for interviews and updates.
- **Multer**: Reliable multipart form data handling.

## 📦 Installation

To get started with the project locally, follow these steps:

### **1. Clone the repository**
```bash
git clone https://github.com/prakharsf27/RMS.git
cd RMS
```

### **2. Setup Backend**
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory and add your credentials:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
SMTP_EMAIL=your_email
SMTP_PASSWORD=your_password
```
Run the server:
```bash
npm run dev
```

### **3. Setup Frontend**
```bash
cd ..
npm install
```
Run the development server:
```bash
npm run dev
```

## 📄 License

This project is licensed under the ISC License.

---
Built with ❤️ by [Prakhar](https://github.com/prakharsf27)
