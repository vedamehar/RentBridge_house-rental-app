const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController"); // Add this import
const { auth } = require("../middlewares/auth");

router.use(auth);

// Define routes
router.post("/:id/message", bookingController.addMessage);
router.post("/", bookingController.requestBooking);
router.get("/user/:userId", bookingController.getUserBookings);
router.get("/owner", bookingController.getOwnerBookings);
router.patch("/:id/approve", bookingController.approveBooking);
router.patch("/:id/reject", bookingController.rejectBooking);

module.exports = router;
