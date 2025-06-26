import { Book } from "../models/book.models.js";
import { Reservation } from "../models/reservation.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import mongoose from "mongoose";


const makeReservation = asyncHandler(async (req, res) => {
    const { bookId } = req.params;
    const userId = req.user._id; // Get userId from JWT
    const { pickupDate, returnDate, notes, priority } = req.body;

    if (!bookId || !userId) {   
        throw new ApiError(402, "Book ID and User ID are required.");
    }
    if (!pickupDate || !returnDate) {
        throw new ApiError(403, "Pickup date and return date are required.");
    }
    if (new Date(pickupDate) >= new Date(returnDate)) {
        throw new ApiError(404, "Pickup date must be before return date.");
    }
const activeReservations = await Reservation.countDocuments({
    userId,
    status: "active"    
})
if (activeReservations >= 2) {
    throw new ApiError(405, "You can only have up to 2 active reservations at a time.");
}   
    const book = await Book.findById(bookId);
    if (!book) {
        throw new ApiError(405, "Book not found.");
    }
    if (!book.copies || book.copies.available < 1) {
        throw new ApiError(406, "No copies available for reservation.");
    }

    const reservation = await Reservation.create({
        userId,
        bookId,
        pickupDate,
        returnDate,
        notes,
        priority: priority || 0
    });

    if (!reservation) {
        throw new ApiError(500, "Failed to create reservation.");
    }

    // Decrement available copies
    book.copies.available -= 1;
    if (book.copies.available === 0) {
        book.status = "reserved";
    }
    await book.save();

    res.status(201).json({
        message: "Reservation created successfully",
        reservation
    });
});
const getReservation = asyncHandler (async (req,res)=>{
    const { reservationId } = req.params;
    if (!reservationId) {
        throw new ApiError(407, "Reservation ID is required.");
    }

    const reservation = await Reservation.findById(reservationId)
        .populate("userId", "name email")
        .populate("bookId", "title author");    
        if (!reservation) {
            throw new ApiError(408, "Reservation not found.");
        }   

    res.status(200).json({
        message: "Reservation retrieved successfully",
        reservation
    });

})

const getMyReservations = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Get userId from JWT
    if (!userId) {
        throw new ApiError(409, "User ID is required.");
    }   
    const reservations = await Reservation.find({ userId })
        .populate("bookId", "title author")
        .sort({ createdAt: -1 }); // Sort by creation date, most recent first   
    if (!reservations || reservations.length === 0) {
        throw new ApiError(410, "No reservations found for this user.");
    }   
    res.status(200).json({
        message: "Reservations retrieved successfully",
        reservations
    });
});
const getAllReservations = asyncHandler(async (req, res) => {
    const reservations = await Reservation.find({})
        .populate("userId", "name email")
        .populate("bookId", "title author")
        .sort({ createdAt: -1 }); // Sort by creation date, most recent first

    if (!reservations || reservations.length === 0) {
        throw new ApiError(411, "No reservations found.");
    }

    res.status(200).json({
        message: "All reservations retrieved successfully",
        reservations
    });
});
const updateReservation = asyncHandler(async (req, res) => {
    const { reservationId } = req.params;
    const { pickupDate, returnDate, notes, priority, status } = req.body;

    if (!reservationId || !mongoose.Types.ObjectId.isValid(reservationId)) {
        throw new ApiError(407, "Valid Reservation ID is required.");
    }

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
        throw new ApiError(413, "Reservation not found.");
    }

    // Build updateFields dynamically
    const updateFields = {};
    if (pickupDate !== undefined) updateFields.pickupDate = pickupDate;
    if (returnDate !== undefined) updateFields.returnDate = returnDate;
    if (notes !== undefined) updateFields.notes = notes;
    if (priority !== undefined) updateFields.priority = priority;
    if (status !== undefined) updateFields.status = status;

    if (Object.keys(updateFields).length === 0) {
        throw new ApiError(414, "No valid fields provided for update.");
    }

    // Update the reservation
    const updatedReservation = await Reservation.findByIdAndUpdate(
        reservationId,
        { $set: updateFields },
        { new: true }
    )
    .populate("userId", "name email")
    .populate("bookId", "title author");

    res.status(200).json({
        message: "Reservation updated successfully",
        reservation: updatedReservation
    });
});
const deleteReservation = asyncHandler(async (req, res) => {
    const { reservationId } = req.params;

    if (!reservationId) {
        throw new ApiError(415, "Reservation ID is required.");
    }

    const reservation = await Reservation.findByIdAndDelete(reservationId);
    if (!reservation) {
        throw new ApiError(416, "Reservation not found.");
    }

    // Increment available copies in the book
    const book = await Book.findById(reservation.bookId);
    if (book) {
        book.copies.available += 1;
        if (book.copies.available > 0) {
            book.status = "available";
        }
        await book.save();
    }   
    res.status(200).json({
        message: "Reservation deleted successfully",
        reservation
    });
});
export {makeReservation, getReservation,getMyReservations,getAllReservations,updateReservation,deleteReservation};