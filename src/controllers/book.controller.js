import { Book } from "../models/book.models.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const addBook = asyncHandler(async (req, res) => {

    const {
        title,
        author,
        publisher, // <-- fixed spelling
        publicationDate,
        isbn,
        category,
        edition,
        language,
        status,
        shelfLocation,
        description,
        pages,
        copies
    } = req.body;

    // Validate required fields
    if (
        !title || !author || !publisher || !publicationDate || !isbn ||
        !category || !edition || !language || !shelfLocation || !pages
    ) {
        throw new ApiError(400, "All required fields must be provided.");
    }

    // Handle cover image upload (using multer and Cloudinary)
    const coverimagePAth = req.files?.coverImage?.[0]?.path;
    if (!coverimagePAth) {
        throw new ApiError(402, "cover image file is required");
    }
    const cover = await uploadOnCloudinary(coverimagePAth);
    if (!cover || !cover.url) {
        throw new ApiError(503, "Failed to upload cover image to Cloudinary");
    }
    const coverImageUrl = cover.url;

    // Prepare copies object
    let copiesObj = { total: 1, available: 1 };
    if (copies) {
        try {
            // Accepts JSON string or object
            const parsed = typeof copies === "string" ? JSON.parse(copies) : copies;
            copiesObj = {
                total: parsed.total ?? 1,
                available: parsed.available ?? parsed.total ?? 1
            };
        } catch {
            throw new ApiError(401, "Invalid copies format.");
        }
    }

    // Create and save the book
    const newBook = await Book.create({
        title,
        author,
        publisher, // <-- fixed spelling
        publicationDate,
        isbn,
        category,
        edition,
        language,
        status, 
        coverImage: coverImageUrl,
        shelfLocation,
        description,
        pages,
        copies: copiesObj
    });

    res.status(201).json({
        message: "Book added successfully",
        book: newBook
    });
});
const updateBook = asyncHandler(async (req, res) => {
 
    const { bookId } = req.params;
    console.log("Book ID:", bookId);
    if (!bookId) {
        throw new ApiError(401, "Book ID is required.");
    }
    const book = await Book.findById(bookId);
    if (!book) {
        throw new ApiError(404, "Book not found.");
    }

    // Build updateFields dynamically
    const allowedFields = [
        "title", "author", "publisher", "publicationDate", "isbn",
        "category", "edition", "language", "shelfLocation", "description", "pages"
    ];
    const updateFields = {};

    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            updateFields[field] = req.body[field];
        }
    });

    // Handle copies (if provided)
    if (req.body.copies) {
        try {
            const parsed = typeof req.body.copies === "string"
                ? JSON.parse(req.body.copies)
                : req.body.copies;
            updateFields.copies = {
                total: parsed.total ?? book.copies.total,
                available: parsed.available ?? book.copies.available
            };
        } catch {
            throw new ApiError(400, "Invalid copies format.");
        }
    }

    // Handle cover image upload (if provided)
    const coverimagePAth = req.files?.coverImage?.[0]?.path;
    if (coverimagePAth) {
        const cover = await uploadOnCloudinary(coverimagePAth);
        if (!cover || !cover.url) {
            throw new ApiError(503, "Failed to upload cover image to Cloudinary");
        }
        updateFields.coverImage = cover.url;
    }

    // If no fields to update
    if (Object.keys(updateFields).length === 0) {
        throw new ApiError(400, "No valid fields provided for update.");
    }

    const bookData = await Book.findByIdAndUpdate(bookId, updateFields, { new: true });
    if (!bookData) {
        throw new ApiError(404, "Book not found after update.");
    }

    res.status(200).json({
        message: "Book updated successfully",
        book: bookData
    });
});
const getBookById = asyncHandler(async (req, res) => {
     
    const { bookId } = req.params;
    if (!bookId) {
        throw new ApiError(400, "Book ID is required.");
    }
    const book = await Book.findById(bookId);
    if (!book) {
        throw new ApiError(404, "Book not found.");
    }
    res.status(200).json({
        message: "Book retrieved successfully",
        book
    });
});
const deleteBook = asyncHandler(async (req, res) => {
    const { bookId } = req.params;
    if (!bookId) {
        throw new ApiError(400, "Book ID is required.");
    }
    const book = await Book.findByIdAndDelete(bookId);
    if (!book) {
        throw new ApiError(404, "Book not found."); 
    }
    res.status(200).json({
        message: "Book deleted successfully",
        book
    });
});
const getAllBooks = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search = "", sortBy = "title", sortOrder = "asc" } = req.query;
     //Build search filter
    const searchFilter = search ? {
        $or: [
            { title: { $regex: search, $options: "i" } }, 
            {description: { $regex: search, $options: "i" } },  
            {category: { $regex: search, $options: "i" } },
            {author: { $regex: search, $options: "i" } },
            {publisher: { $regex: search, $options: "i" } }
        ]
    } : {};
    const skip = (page - 1) * limit;
    const sort = {[sortBy]: sortOrder === "asc" ? 1 : -1};
    const books = await Book.find(searchFilter)
        .skip(skip)
        .limit(Number(limit))
        .sort(sort);        
    const totalBooks = await Book.countDocuments(searchFilter);
    res.status(200).json({
        message: "Books retrieved successfully",
        books,
        totalBooks,
        totalPages: Math.ceil(totalBooks / limit),
        currentPage: Number(page)
    });
})



export { addBook , updateBook ,getBookById,deleteBook, getAllBooks};