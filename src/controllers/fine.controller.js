import { Borrow } from "../models/borrow.model.js";
import { Fine } from "../models/fine.models.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { calculateFine } from "../utils/fine.js";

const createFineAmount = asyncHandler(async(req,res)=>{
    const { borrowId } = req.params;
    const userId = req.user._id;

    if(!borrowId){
        throw new ApiError(400,"The borrowId is not found");
    }

    const borrow = await Borrow.findOne({
        _id: borrowId,
        userId: userId
    });

    if(!borrow){
        throw new ApiError(401,"Borrow book is not found or the book is returned");
    }

    if (!borrow.actualReturnDate || borrow.actualReturnDate <= borrow.returnDate) {
        throw new ApiError(400, "No fine: Book was not returned late.");
    }

    const fineAmount = calculateFine(borrow.returnDate, borrow.actualReturnDate);

    const existingFine = await Fine.findOne({ borrowId, userId });
    if(existingFine){
        throw new ApiError(405,"Fine already exists");
    }

    const fine = await Fine.create({
        userId,
        borrowId,
        amount: fineAmount,
        reason: "Late Reason",
        dueDate: new Date(),
        paymentMethod: "Cash"
    });

    res.status(201).json({
        message: "Fine created successfully",
        fine
    });
});
const listAllFine = asyncHandler(async(req,res)=>{
   const fine = await Fine.find()
   .populate('userId','name email')
   .populate('borrowId')
    res.status(200).json({
        message: "All fines retrieved successfully",
        total: fines.length,
        fines
    });

})
// Get user fines (Admin/User)
const getUserFines = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    // If not admin, only allow user to see their own fines
    if (!req.user.isAdmin && req.user._id.toString() !== userId) {
        throw new ApiError(403, "Forbidden");
    }
    const fines = await Fine.find({ userId })
        .populate('borrowId');
    res.status(200).json({
        message: "User fines retrieved successfully",
        total: fines.length,
        fines
    });
});
//admin
const markFineAsPaid = asyncHandler(async (req, res) => {
    const { fineId } = req.params;
    const fine = await Fine.findById(fineId);
    if (!fine) {
        throw new ApiError(404, "Fine not found");
    }
    fine.paidStatus = true;
    fine.paymentDate = new Date();
    fine.paymentMethod = req.body.paymentMethod || "cash";
    await fine.save();
    res.status(200).json({
        message: "Fine marked as paid",
        fine
    });
});

export {createFineAmount,getUserFines,markFineAsPaid}