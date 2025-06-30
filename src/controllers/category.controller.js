import { Book } from "../models/book.models.js";
import { Category } from "../models/catrgory.models.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    if (!name || !description) {
        throw new ApiError(400, "Please provide name and description to categorize the books.");
    }
    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
        throw new ApiError(409, "Category already exists.");
    }
    const category = await Category.create({
        name: name.trim(),
        description: description.trim()
    });
    res.status(201).json({
        message: "Category created successfully",
        category
    });
});




const updateCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const { name, description } = req.body;

    if (!categoryId) {
        throw new ApiError(400, "Category ID is required.");
    }
    if (!name) {
        throw new ApiError(400, "Category name is required.");
    }

    const category = await Category.findByIdAndUpdate(
        categoryId,
        { name: name.trim(), description: description ? description.trim() : undefined },
        { new: true }
    );

    if (!category) {
        throw new ApiError(404, "Category not found.");
    }

    res.status(200).json({
        message: "Category updated successfully",
        category
    });
});


const deleteCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    if (!categoryId) {
        throw new ApiError(400, "Provide category ID.");
    }
    const deleted = await Category.findByIdAndDelete(categoryId);
    if (!deleted) {
        throw new ApiError(404, "Category not found.");
    }
    res.status(200).json({
        message: "Category is deleted",
        category: deleted
    });
});
const addBookToCategory = asyncHandler(async (req, res) => {
  const { bookId ,categoryId} = req.params;
  

  // Validate book ID
  if (!bookId) {
    throw new ApiError(405, "Provide a valid book ID");
  }

  // Validate category ID
  if (!categoryId) {
    throw new ApiError(406, "Provide a valid category ID");
  }

  // Find the book
  const book = await Book.findById(bookId);
  if (!book) {
    throw new ApiError(404, "Book not found");
  }

  // Find the category
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // Check if book is already in category
  if (category.books.includes(bookId)) {
    return res.status(200).json({ success: true, message: "Book already in category" });
  }

  // Add book to category
  category.books.push(bookId);
  await category.save();

  res.status(200).json({
    success: true,
    message: "Book added to category successfully",
    category,
  });
});
const removeBookFromCategory = asyncHandler(async (req, res) => {
  const { bookId, categoryId } = req.params;

  // Validate input
  if (!bookId || !categoryId) {
    throw new ApiError(400, "Both bookId and categoryId are required");
  }

  // Find book and category
  const book = await Book.findById(bookId);
  if (!book) {
    throw new ApiError(404, "Book not found");
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // Remove book from category if exists
  if (category.books.includes(bookId)) {
    category.books.pull(bookId);
    await category.save();
  }

  // Populate and return updated category
  const updatedCategory = await Category.findById(categoryId).populate("books");

  res.status(200).json({
    success: true,
    message: "Book removed from the category successfully",
    category: updatedCategory,
  });
});

    

export { createCategory, updateCategory, deleteCategory,addBookToCategory,removeBookFromCategory};