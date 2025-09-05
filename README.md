


# 🏠 MERN House Rental App (RentBridge)

## 🌐 Live Application
🚀 **Frontend**: [https://rent-bridge-house-rental-app.vercel.app](https://rent-bridge-house-rental-app.vercel.app)  
🔧 **Backend API**: [https://rentbridge-backend.onrender.com](https://rentbridge-backend.onrender.com)

## 📌 Project Overview
The **MERN House Rental App** (RentBridge) is designed to bridge the gap between property owners and renters.  
Our platform ensures that only **authentic, verified owners** can list properties, as all users must be approved by admins before they can access full functionality.  
This verification process reduces the risk of **cyber scams** and promotes a **secure, efficient, and optimized** owner–renter relationship.

---
## 🎥 Demo Video

[![Project Demo](https://drive.google.com/file/d/1OwzUlI8THy_rKSG-F6LmyzHe4EOhn4Lm/view?usp=sharing)](https://drive.google.com/file/d/1OwzUlI8THy_rKSG-F6LmyzHe4EOhn4Lm/view?usp=sharing)

---

## 🚀 Features
- **Secure User Authentication** – Registration, login, and role-based access control (Renter, Owner, Admin).
- **Property Listings** – Owners can add, edit, and delete their properties.
- **Property Search & Filters** – Renters can search properties by location, price, and amenities.
- **Property Booking** – Renters can book properties and view booking confirmations.
- **Wishlist** – Renters can save properties for later.
- **Admin Approval System** – Admins can approve or reject property listings.
- **Responsive UI** – Mobile-first, works across devices.
- **JWT Authentication** – Secure API endpoints with token-based access.

---

## 🛠 Tech Stack
**Frontend:**
- React.js (Vite)
- React Router DOM
- React Bootstrap
- Context API for state management
- CSS & component-specific styles

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer (for image uploads)

**Other Tools:**
- Postman (API Testing)
- Git & GitHub (Version Control)
- Vercel (Frontend Deployment)
- Render.com (Backend Deployment)
- MongoDB Atlas (Database Hosting)

---

## 🌐 Deployment Details

### **Production Environment**
- **Frontend**: Deployed on **Vercel** with automatic deployments from GitHub
- **Backend**: Deployed on **Render.com** with environment variables configured
- **Database**: **MongoDB Atlas** cloud database
- **CORS**: Configured for cross-domain communication between Vercel and Render
- **Authentication**: JWT-based with HTTP-only cookies for secure cross-domain auth

### **Environment Variables**
**Frontend (Vercel):**
```env
VITE_API_URL=https://rentbridge-backend.onrender.com
```

**Backend (Render):**
```env
PORT=5000
MONGO_URI=your-mongodb-atlas-uri
JWT_SECRET=your-secret-key
NODE_ENV=production
```

---

## 📂 Folder Structure
```plaintext
RentBridge_Final/
├── .git/                     # Git repository
├── .gitignore               # Git ignore file
├── README.md                # Project documentation
└── Projects/                # Main project folder
    ├── deploy.sh            # Deployment script
    ├── DEPLOYMENT_GUIDE.md  # Deployment documentation
    ├── status-check.js      # Application status checker
    ├── backend/             # Node.js + Express backend
    │   ├── .env             # Environment variables
    │   ├── .env.production.example # Production env template
    │   ├── .gitignore       # Backend git ignore
    │   ├── package.json     # Backend dependencies
    │   ├── package-lock.json # Dependency lock file
    │   ├── index.js         # Backend entry point
    │   ├── vercel.json      # Vercel configuration
    │   ├── config/          # Database configuration
    │   │   └── db.js        # MongoDB connection
    │   ├── context/         # Auth context (backend)
    │   │   └── AuthContext.js
    │   ├── controllers/     # Request handlers
    │   │   ├── adminController.js
    │   │   ├── bookingController.js
    │   │   ├── contactController.js
    │   │   ├── messageController.js
    │   │   ├── propertyController.js
    │   │   └── userController.js
    │   ├── middlewares/     # Auth & role-based access
    │   │   ├── auth.js      # JWT authentication
    │   │   └── roleMiddlewares.js
    │   ├── models/          # Mongoose schemas
    │   │   ├── Booking.js   # Booking model
    │   │   ├── Contact.js   # Contact model
    │   │   ├── Message.js   # Message model
    │   │   ├── Property.js  # Property model
    │   │   └── user.js      # User model
    │   ├── routes/          # API endpoints
    │   │   ├── adminRoutes.js
    │   │   ├── BookingRoute.js
    │   │   ├── contactRoutes.js
    │   │   ├── messageRoutes.js
    │   │   ├── PropertyRoutes.js
    │   │   ├── ProtectedRoute.js
    │   │   └── UserRoutes.js
    │   └── services/        # Business logic
    │       ├── adminService.js
    │       └── propertyService.js
    │
    └── frontend/            # React frontend (Vite)
        ├── .env.production.example # Production env template
        ├── dist/            # Build output (generated)
        ├── public/          # Public assets
        ├── package.json     # Frontend dependencies
        ├── package-lock.json # Dependency lock file
        ├── index.html       # HTML template
        ├── eslint.config.js # ESLint configuration
        ├── vite.config.js   # Vite configuration
        ├── vercel.json      # Vercel configuration
        └── src/
            ├── App.css      # Global styles
            ├── App.jsx      # Root component
            ├── index.css    # Base styles
            ├── main.jsx     # Main entry point
            ├── assets/      # Static assets
            ├── components/  # Reusable UI components
            │   ├── AddPropertyForm.jsx
            │   ├── BookingForm.jsx
            │   ├── Chat.jsx
            │   ├── ChatModal.jsx
            │   ├── FancyFooter.jsx
            │   ├── FancyFooter.css
            │   ├── FancyNavbar.jsx
            │   ├── FancyNavbar.css
            │   ├── Header.jsx
            │   ├── LoadingSpinner.jsx
            │   ├── PropertyCard.jsx
            │   ├── ProtectedRoute.jsx
            │   ├── PublicRoute.jsx
            │   ├── ReviewStars.jsx
            │   ├── RoleSelector.jsx
            │   └── Wishlist.jsx
            ├── context/     # Global state management
            │   └── AuthContext.jsx
            ├── pages/       # App pages
            │   ├── dashboard/ # Dashboard components
            │   ├── Booking.jsx
            │   ├── Contact.jsx
            │   ├── ContactPage.jsx
            │   ├── DetailedProperty.jsx
            │   ├── Home.jsx
            │   ├── Login.jsx
            │   ├── Profile.jsx
            │   ├── Register.jsx
            │   ├── SignupPage.jsx
            │   └── Unauthorized.jsx
            ├── routes/      # Route configuration
            └── services/    # API services
```


---

## ⚙️ Installation & Setup

### 🌐 **Access Live Application**
Visit the live application: [https://rent-bridge-house-rental-app.vercel.app](https://rent-bridge-house-rental-app.vercel.app)

### 💻 **Local Development Setup**
1. **Clone the repository**
```bash
git clone https://github.com/vedamehar/RentBridge_house-rental-app.git
cd RentBridge_house-rental-app/Projects
````

2. **Backend Setup**

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:

```env
PORT=5000
MONGO_URI=your-mongodb-atlas-uri
JWT_SECRET=your-secret-key
NODE_ENV=development
```

Run the backend:

```bash
npm start
```

3. **Frontend Setup**

```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend folder:

```env
VITE_API_URL=http://localhost:5000
```

Run the frontend:

```bash
npm run dev
```

### 🔗 **API Endpoints**
- **Health Check**: `GET /api/health`
- **User Registration**: `POST /api/users/register`
- **User Login**: `POST /api/users/login`
- **Properties**: `GET /api/properties`
- **Bookings**: `GET /api/bookings`
- **Admin Routes**: `GET /api/admin/*`

---

## 🧪 Testing

### **Live Application Testing**
Test all features on the live application: [https://rent-bridge-house-rental-app.vercel.app](https://rent-bridge-house-rental-app.vercel.app)

### **API Testing**
- **Backend Health**: [https://rentbridge-backend.onrender.com/api/health](https://rentbridge-backend.onrender.com/api/health)
- **Properties API**: [https://rentbridge-backend.onrender.com/api/properties](https://rentbridge-backend.onrender.com/api/properties)

### **Manual Testing**
* Use Postman to test backend API routes
* **User Acceptance Testing**: Completed for Registration, Login, Property Management, Booking, Wishlist, and Admin Approval

### **Authentication Testing**
* ✅ User Registration with role validation
* ✅ Secure login with JWT tokens
* ✅ Cross-domain authentication
* ✅ Role-based access control
* ✅ Session persistence

---

## 📅 Project Timeline

* **Development Period:** 25 July 2025 – 10 August 2025
* **Deployment Period:** August 2025 - September 2025
* **Current Status:** ✅ **LIVE IN PRODUCTION**

* **Sprints:**
  * Sprint 1: Registration & Login
  * Sprint 2: Property Management & Search
  * Sprint 3: Booking, Wishlist & Admin Approval
  * Sprint 4: Deployment & Production Optimization

---

## 👥 Contributors

**Team ID:** PNT2025TMID10856
**Team Size:** 4 Members

| Role            | Name            |
| --------------- | --------------- |
| **Team Leader** | Vedant Mehar    |
| **Team Member** | Supriya Patil   |
| **Team Member** | Sneha Khatave   |
| **Team Member** | Snehal Yelwande |

---

## 📜 License

This project is licensed under the **MIT License** – feel free to use and modify it.

---

## 📧 Contact

For queries, reach out to: **[vedamehar@gmail.com](mailto:vedamehar@gmail.com)**

**Live Application**: [https://rent-bridge-house-rental-app.vercel.app](https://rent-bridge-house-rental-app.vercel.app)  
**GitHub Repository**: [https://github.com/vedamehar/RentBridge_house-rental-app](https://github.com/vedamehar/RentBridge_house-rental-app)

```
