const borrowBook = asyncHandler(async (req, res) => {
    const { bookId } = req.params;
    const userId = req.user._id;
    const { notes } = req.body;

    if (!bookId || !userId) {
        throw new ApiError(400, "Book ID and User ID are required.");
    }

    // Check for a valid reservation
    const reservation = await Reservation.findOne({
        bookId,
        userId,
        status: "reserved"
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
        notes
    });

    // Update reservation status to 'active'
    reservation.status = "active";
    await reservation.save();

    res.status(201).json({
        message: "Book borrowed successfully",
        borrow
    });
});

export { borrowBook };