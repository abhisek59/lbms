import { Book } from "../models/book.models.js";
import { Reservation } from "../models/reservation.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";


const makeReservation = asyncHandler(async (req, res) => {
    const { bookId } = req.params;
    const userId = req.user._id; // Get userId from JWT
    const { pickupDate, returnDate, notes, priority } = req.body;

    if (!bookId || !userId) {   
        throw new ApiError(400, "Book ID and User ID are required.");
    }
    if (!pickupDate || !returnDate) {
        throw new ApiError(400, "Pickup date and return date are required.");
    }
    if (new Date(pickupDate) >= new Date(returnDate)) {
        throw new ApiError(400, "Pickup date must be before return date.");
    }

    const book = await Book.findById(bookId);
    if (!book) {
        throw new ApiError(404, "Book not found.");
    }
    if (!book.copies || book.copies.available < 1) {
        throw new ApiError(400, "No copies available for reservation.");
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
export {makeReservation}