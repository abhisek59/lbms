import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import User from "../models/user.model";
import jwt from "jsonwebtoken";
import  ApiResponse from "../utils/apiResponse";
import { uploadOnCloudinary } from "../utils/cloudinary";

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, fullname, section, address, phoneNo, avatar, password } = req.body;

    // Validate required fields
    if (!username || !email || !fullname || !section || !address || !phoneNo || !avatar || !password) {
        throw new ApiError(400, "All fields are required"); 
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
       throw new ApiError(400, "Username or email already exists");
    }
     const avatarLocalPath = req.files?.avatar[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    const avatars = await uploadOnCloudinary(avatarLocalPath)
    if (!avatars) {
       throw new ApiError(500, "Failed to upload avatar to Cloudinary");
    }

    // Create new user
    const newUser = new User({
        username,
        email,
        fullname,
        section,
        address,
        phoneNo,
        avatar,
        password
    });
  const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    await newUser.save();
    res
    .status(201)
    .json({
        
        message: "User registered successfully", user: newUser 
    });
}); 

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    // Check password
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid email or password");
    }
 const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

   
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler(async (req, res) => {
   
   
   const user =  await User.findByIdAndUpdate(req.user._id, {
    $unset: { refreshToken: 1 }        
    }, 
    {
         new: true
         })    
           const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})  
const accessRefreshToken = asyncHandler(async(req,res)=>{
   const incomingRefreshToken= req.cookie.refreshToken||req.body.refreshToken
   if(!incomingRefreshToken){
    throw new ApiError(400, "Refresh token is required")
   }
  try {
     const decodedToken=   jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
     const user =User.findById(decodedToken?._id)
  if(!user){
      throw new ApiError(404, "User not found")   
  }
  if(incomingRefreshToken !== user.refreshToken){
      throw new ApiError(401, "Refresh token is expired or used")    
  }
  
  const options = {
      httpOnly: true,
      secure: true    
  }
  const {accessToken,newRefreshToken}= await generateAccessAndRefereshTokens(user._id)
   return res 
   .status(200)
   .cookie("accessToken", accessToken,options)
   .cookie("refreshToken",newRefreshToken, options)
   .json (new ApiResponse(200, {
      accessToken,
      refreshToken: newRefreshToken}, "Access and Refresh tokens generated successfully") )
  
  
  } catch (error) {
      throw new ApiError(401, error?.message || "Invalid refresh token")    
    
  }

   
})
const changePassword = asyncHandler(async (req, res) => {
    const {oldPassword, newPassword} = req.body;

    // Check if both passwords are provided
    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old password and new password are required");
    }

    // Find the user
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Verify old password
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Old password is incorrect");
    }

    // Update password
    user.password = newPassword;
    await user.save(); // This will trigger the password hashing middleware

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    );
});
const changeUserDetails = asyncHandler(async (req, res) => { 
    const { username, email, fullname, section, address, phoneNo} = req.body;

    // Validate required fields
    if (!username || !email || !fullname || !section || !address || !phoneNo) {
        throw new ApiError(400, "All fields are required");
    }

    // Find the user
    const user = await User.findByIdAndUpdate(
        req.user._id,{
            $set: {
                username:username,
                email:email,
                fullname:fullname,
                section:section,
                address:address,
                phoneNo:phoneNo,        
                fullname: fullname,
    
            }
        }
        ,{new:true}.select("-password -refreshToken")
    );  
    if (!user) {
        throw new ApiError(404, "User not found");
    }   
    return res.status(200).json(
        new ApiResponse(200, { user }, "User details updated successfully")
    );
});
const updateUserAvatar = asyncHandler(async(req, res) => {
    // Check if user exists
    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized request");
    }

    // Check if file exists in request
    const localPath = req.files?.avatar?.[0]?.path;
    if (!localPath) {
        throw new ApiError(400, "No avatar file uploaded");
    }

    // Upload to Cloudinary
    const avatar = await uploadOnCloudinary(localPath);
    if (!avatar?.url) {
        throw new ApiError(500, "Error while uploading avatar to cloud");
    }

    // Update user avatar
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true,
            runValidators: true
        }
    ).select("-password -refreshToken");

    // Check if user was updated
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                { user }, 
                "Avatar updated successfully"
            )
        );
});

const getUserProfile = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "books", // Collection name should be lowercase
                localField: "_id",
                foreignField: "borrowHistory.user",
                as: "borrowedBooks"
            }
        },
        {
            $lookup: {
                from: "books",
                localField: "_id",
                foreignField: "reservedBy.user",
                as: "reservedBooks"
            }   
        },
        {
            $addFields: {
                totalBorrowedBooks: { $size: "$borrowedBooks" },
                totalReservedBooks: { $size: "$reservedBooks" }
            }
        },
        {
            $project: {
                username: 1,
                email: 1,
                fullname: 1,
                section: 1,
                address: 1,
                phoneNo: 1,
                avatar: 1,
                totalBorrowedBooks: 1,
                totalReservedBooks: 1,
                borrowedBooks: {
                    $map: {
                        input: "$borrowedBooks",
                        as: "book",
                        in: {
                            _id: "$$book._id",
                            title: "$$book.title",
                            author: "$$book.author",
                            borrowDate: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: "$$book.borrowHistory",
                                            as: "history",
                                            cond: { $eq: ["$$history.user", "$_id"] }
                                        }
                                    },
                                    0
                                ]
                            }
                        }
                    }
                },
                reservedBooks: {
                    $map: {
                        input: "$reservedBooks",
                        as: "book",
                        in: {
                            _id: "$$book._id",
                            title: "$$book.title",
                            author: "$$book.author",
                            reservedDate: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: "$$book.reservedBy",
                                            as: "reserve",
                                            cond: { $eq: ["$$reserve.user", "$_id"] }
                                        }
                                    },
                                    0
                                ]
                            }
                        }
                    }
                }
            }
        }
    ]);

    if (!user || user.length === 0) {
        throw new ApiError(404, "User profile not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user[0], "User profile fetched successfully")
    );
});

export{
    registerUser,
    loginUser,
    logoutUser,
    accessRefreshToken,
    changePassword,
    changeUserDetails,
    updateUserAvatar,
    getUserProfile  
}