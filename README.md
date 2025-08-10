


# 🏠 MERN House Rental App (RentBridge)

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
- Vercel/Netlify (Frontend Deployment)
- MongoDB Atlas (Database Hosting)

---

## 📂 Folder Structure
```plaintext
mern-house-rental-app/
├── backend/                  # Node.js + Express backend
│   ├── controllers/          # Request handlers
│   ├── middleware/           # Auth & role-based access
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API endpoints
│   ├── uploads/              # Uploaded property images
│   ├── server.js             # Entry point
│
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # App pages (Login, Dashboard, etc.)
│   │   ├── context/          # AuthContext for global state
│   │   ├── App.jsx           # Root component
│   │   └── index.js          # Entry point
│
├── .env                      # Environment variables
├── package.json              # Dependencies
└── README.md                 # Project documentation


---

## ⚙️ Installation & Setup
1. **Clone the repository**
```bash
git clone https://github.com/your-username/mern-house-rental-app.git
cd mern-house-rental-app
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
```

Run the backend:

```bash
npm start
```

3. **Frontend Setup**

```bash
cd ../frontend
npm install
npm run dev
```

---

## 🧪 Testing

* **Manual Testing:**
  Use Postman to test backend API routes.
* **User Acceptance Testing:**
  Conducted for Registration, Login, Property Management, Booking, Wishlist, and Admin Approval.

---

## 📅 Project Timeline

* **Development Period:** 25 July 2025 – 10 August 2025
* **Sprints:**

  * Sprint 1: Registration & Login
  * Sprint 2: Property Management & Search
  * Sprint 3: Booking, Wishlist & Admin Approval

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

```
