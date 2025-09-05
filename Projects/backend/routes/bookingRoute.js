const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { auth, authRole } = require("../middlewares/auth");

router.use(auth);

// Define routes
router.post("/", bookingController.createBooking);       // Direct booking creation
router.post("/request", bookingController.requestBooking); // Booking request (needs approval)
router.get("/", auth, authRole('admin'), bookingController.getAllBookings); // Admin route for all bookings
router.get("/user/:userId", bookingController.getUserBookings);
router.get("/owner", bookingController.getOwnerBookings);
router.patch("/:id/approve", bookingController.approveBooking);
router.patch("/:id/reject", bookingController.rejectBooking);
router.post("/:id/message", bookingController.addMessage);

module.exports = router;
