const Booking = require("../models/Booking");
const Dentist = require("../models/Dentist");

//@desc    Get all bookings
//@route   GET /api/v1/bookings
//@access  Private
exports.getBookings = async (req, res, next) => {
  let query;
  //General uers can see only their bookings!
  if (req.user.role !== "admin") {
    query = Booking.find({ user: req.user.id }).populate({
      path: "dentist",
      select: "name yearsOfExperience areaOfExpertise",
    });
  } else {
    //If you are an admin, you can see all!
    if (req.params.dentistId) {
      query = Booking.find({ dentist: req.params.dentistId }).populate({
        path: "dentist",
        select: "name yearsOfExperience areaOfExpertise",
      });
    } else {
      query = Booking.find().populate({
        path: "dentist",
        select: "name yearsOfExperience areaOfExpertise",
      });
    }
  }
  try {
    const bookings = await query;
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Booking" });
  }
};

//@desc    Get single booking
//@route   GET /api/v1/bookings/:id
//@access  Public
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: "dentist",
      select: "name yearsOfExperience areaOfExpertise",
    });
    if (!booking) {
      return res
        .status(404)
        .json({
          success: false,
          message: `No booking with the id of ${req.params.id}`,
        });
    }
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    console.log(err.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Booking" });
  }
};

//@desc    Add single booking
//@route   POST /api/v1/dentists/:dentistId/bookings/
//@access  Private
exports.addBooking = async (req, res, next) => {
  try {
    req.body.dentist = req.params.dentistId;
    const dentist = await Dentist.findById(req.params.dentistId);
    if (!dentist) {
      return res
        .status(404)
        .json({
          success: false,
          message: `No dentist with the id of ${req.params.dentistId}`,
        });
    }

    //add user Id to req.body
    req.body.user = req.user.id;

    //Check for existed booking
    const existedBookings = await Booking.find({ user: req.user.id });

    //If the user is not an admin, th??y can only create 1 booking.
    if (existedBookings.length >= 1 && req.user.role !== "admin") {
      return res
        .status(400)
        .json({
          success: false,
          message: `The user with Id ${req.user.id} user to book only ONE session`,
        });
    }

    //Check for existed bookingDate
    const existedBookingDate = await Booking.find({ bookingDate: req.body.bookingDate, dentist: req.params.dentistId });

    //If the user is not an admin, They can only create 1 booking and bookingDate is not match with the other.
    if (existedBookingDate.length >= 1 && req.user.role !== "admin") {
      return res
        .status(400)
        .json({
          success: false,
          message: `The bookingDate ${req.body.bookingDate} with dentist ${req.params.dentistId} is already booked by other`,
        });
    }

    let d1 = new Date();
    d1.setHours(d1.getHours() + 8);
    if(new Date(req.body.bookingDate) < d1){
        return res.status(400).json({success:false,message:`bookingDate must more than 1 hours from the current time ${new Date()}`});
    }

    const booking = await Booking.create(req.body);
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    console.log(err.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot create Booking" });
  }
};

//@desc    Update booking
//@route   PUT /api/v1/bookings/:id
//@access  Private
exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res
        .status(404)
        .json({
          success: false,
          message: `No booking with the id of ${req.params.id}`,
        });
    }

    //Make sure user is the booking owner
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(401)
        .json({
          success: false,
          message: `User ${req.user.id} is not authorized to update this booking`,
        });
    }

    //Check for existed bookingDate
    const existedBookingDate = await Booking.find({ bookingDate: req.body.bookingDate, dentist: req.params.dentistId });

    //If the user is not an admin, They can only create 1 booking and bookingDate is not match with the other.
    if (existedBookingDate.length >= 1 && req.user.role !== "admin") {
      return res
        .status(400)
        .json({
          success: false,
          message: `The bookingDate ${req.body.bookingDate} with dentist ${req.params.dentistId} is already booked by other`,
        });
    }

    let d1 = new Date();
    d1.setHours(d1.getHours() + 8);
    if(new Date(req.body.bookingDate) < d1){
        return res.status(400).json({success:false,message:`bookingDate must more than 1 hours from the current time ${new Date()}`});
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot update Booking" });
  }
};

//@desc     Delete booking
//@route    DELETE /api/v1/booking/:id
//@access   Private
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res
        .status(404)
        .json({
          success: false,
          message: `No booking with id ${req.params.id}`,
        });
    }

    //Make sure user is the booking owner
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(401)
        .json({
          success: false,
          message: `User ${req.user.id} is not authorized to delete this bootcamp`,
        });
    }

    await booking.remove();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot delete Booking" });
  }
};
