import { Borrow } from "../models/borrow.model.js";
import { Reservation } from "../models/reservation.models.js";
import { ApiError } from "../utils/apiError.js";
import { calculateFine } from "../utils/fine.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { Book } from "../models/book.models.js";

const borrowBook = asyncHandler(async (req, res) => {
    const { bookId } = req.params;
    const userId = req.user._id;
    const { notes } = req.body;

    if (!bookId || !userId) {
        throw new ApiError(400, "Book ID and User ID are required.");
    }
    // Check for a valid reservation
 const reservation = await Reservation.findOne({
    bookId: new mongoose.Types.ObjectId(bookId),
    userId: new mongoose.Types.ObjectId(userId),
    status: "active"
});
    if (!reservation) {
        throw new ApiError(404, "No reservation found for this book, so it cannot be borrowed.");
    }

    // Set borrowDate as now and returnDate as 1 month from now
    const borrowDate = new Date();
    const returnDate = new Date();
    returnDate.setMonth(returnDate.getMonth() + 1);

    // Create a borrow record
    const borrow = await Borrow.create({
        userId,
        bookId,
        borrowDate,
        returnDate,
        notes,
        status:'borrowed'
    });

    // Update reservation status to 'active'
    reservation.status = "completed";
    await reservation.save();

    res.status(201).json({
        message: "Book borrowed successfully",
        borrow
    });
});
const getUserBorrowBook = asyncHandler (async(req,res)=>{
    const {userId} = req.params;
    if (!userId) {
        throw new ApiError(400, "User ID is required.");
    }   
    const borrows = await Borrow.find({ userId }).populate('bookId', 'title author');
    if (!borrows || borrows.length === 0) {
        throw new ApiError(404, "No borrow records found for this user.");
    }
    res.status(200).json({
        message: "Borrow records retrieved successfully",
        borrows
    });
})
const returnBook = asyncHandler (async(req,res)=>{
    const { bookId} = req.params;
    const userId = req.user._id;
    if (!userId || !bookId) {
        throw new ApiError(400, "User ID and Book ID are required.");
    }
    const borrow = await Borrow.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        bookId: new mongoose.Types.ObjectId(bookId),
        status: 'borrowed'
    });
    if (!borrow) {
        throw new ApiError(404, "No active borrow record found for this user and book.");
    }

    borrow.status = 'returned';
    borrow.actualReturnDate = new Date();

    // FIXED: Correct argument order
    borrow.fine = calculateFine(borrow.returnDate, borrow.actualReturnDate);
    await borrow.save();

    await Book.findByIdAndUpdate(
        bookId,
        { $inc: { "copies.available": 1 } }
    );

    res.status(200).json({
        message: "Book returned successfully",
        borrow
    });
});
const renewBook = asyncHandler(async(req,res)=>{
    const { bookId } = req.params;
    const userId = req.user._id; // Get userId from JWT
    if (!userId || !bookId) {
        throw new ApiError(400, "User ID and Book ID are required.");
    }   
    const borrow = await Borrow.findOne({
        userId,
        bookId,
        status:'borrowed'   
    })
    if (!borrow) {
        throw new ApiError(404, "No active borrow record found for this user and book.");
    }
    // Check if the book has already been renewed twice
    if (borrow.renewals >= 2) {
        throw new ApiError(405, "Maximum renewals reached for this book.");
    }   
    // Extend return date by 1 month
 const previousReturnDate = new Date(borrow.returnDate);
    const newReturnDate = new Date(previousReturnDate);
    newReturnDate.setMonth(newReturnDate.getMonth() + 1);
    borrow.returnDate = newReturnDate;
    borrow.renewals += 1;
    borrow.renewalHistory.push({
        renewalDate: new Date(),
        previousReturnDate,
        newReturnDate
    });
    await borrow.save();
    res.status(200).json({
        message: "Book renewed successfully",
        borrow
    });
})
const userBorrowedBooks = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Get userId from JWT
    if (!userId) {
        throw new ApiError(400, "User ID is required.");
    }
    const borrows = await Borrow.find({ userId })
        .populate('bookId', 'title author')
        .populate('userId', 'name email');
    if (!borrows || borrows.length === 0) {
        throw new ApiError(404, "No borrow records found for this user.");
    }
    res.status(200).json({
        message: "User's borrowed books retrieved successfully",
        borrows
    });
});
const getAllBorrowedBooks = asyncHandler(async (req, res) => {
    const borrows = await Borrow.find()
        .populate('bookId', 'title author')
        .populate('userId', 'name email');
    if (!borrows || borrows.length === 0) {
        throw new ApiError(404, "No borrow records found.");
    }
    res.status(200).json({
        message: "All borrowed books retrieved successfully",
        totalBorrowed: borrows.length,
        borrows
    });
});
const handleOverdueBooks = asyncHandler(async(req,res)=>{
    const currentDate = new Date();
    const overdueBorrows = await Borrow.find({
        returnDate: { $lt: currentDate },
        status: 'borrowed'
    }).populate('bookId', 'title author').populate('userId', 'name email');
    if (!overdueBorrows || overdueBorrows.length === 0) {
        throw new ApiError(404, "No overdue borrow records found.");
    }
    for (const borrow of overdueBorrows) {
        // FIXED: Correct argument order
        borrow.fine = calculateFine(borrow.returnDate, currentDate);
        borrow.status = 'overdue';
        await borrow.save();
    }
    res.status(200).json({
        message: "Overdue books handled successfully",
        overdueBorrows
    });
});
// const fineAmount = asyncHandler(async(req,res)=>{
//     const {borrowId}= req.params;
//     if (!borrowId) {
//         throw new ApiError(400, "Borrow ID is required.");
//     }
//     const borrow = await Borrow.findById(borrowId);
//     if (!borrow) {
//         throw new ApiError(404, "Borrow record not found.");
//     }
//     const fineAmount = calculateFine(borrow.borrowDate, borrow.returnDate, borrow.actualReturnDate || new Date());
//     res.status(200).json({
//         message: "Fine amount calculated successfully",
//         fine: fineAmount
//     }); 
// })


export { borrowBook,
    getUserBorrowBook,
    returnBook,
    renewBook,
    getAllBorrowedBooks,
    userBorrowedBooks,
    handleOverdueBooks,
   
};