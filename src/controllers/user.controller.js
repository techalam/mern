import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessNdRefreshToken = async (userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false})
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "User not found")
        
    }
}

const registerUser = asyncHandler(async (req, res) =>{
    // res.status(200).json({
    //     message: "User registered successfully",
    // })

    // console.log("request is -- :",req);
    

    const {username, email, fullname, password} = req.body
    // console.log("email", email);
    // console.log("Request Files:", req.files);
    

    if(
        [fullname, email, username, password].some(field => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required!!")
    }

    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })

    if(existedUser) {
        throw new ApiError(400, "Username or Email already exists!!")
    }
    const avatarLocalPath = await req.files?.avatar[0]?.path;
    // const coverImageLocalPath = await req.files?.coverImage[0]?.path;

    var coverImageLocalPath;

    if(req.files && req.files.coverImage && req.files.coverImage.length >0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required!!");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar) {
        throw new ApiError(400, "Avatar upload failed!!");
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if(!createdUser) {
        throw new ApiError(500, "User not registered!!")
    }

    return res.status(200).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )
    
})

const loginUser = asyncHandler(async (req, res) => {
const {username, email, password} = req.body;
    if(!username || !email) {
        throw new ApiError(400, "Username and Email are required!!");
    }

    const user = await User.findOne({
        $or: [{email}, {username}]
    })

    if(!user) {
        throw new ApiError(400, "Invalid username or email!!");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid) {
        throw new ApiError(400, "Invalid password!!");
    }

    const {accessToken, refreshToken} = await generateAccessNdRefreshToken(user._id)
    const loggedInuser = await User.findById(user._id)
    .select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    res.status(200).cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200,
             {
                loggedInuser, accessToken, refreshToken
            }, "User logged in successfully")
    )


})

const logoutUser = asyncHandler(async (req, res) => {
       await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    refreshToken: undefined
                }
            },
            {
                new: true
            }
        )

        const options = {
            httpOnly: true,
            secure: true
        }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged out successfully"))
})

export {
    registerUser,
    loginUser,
    logoutUser
}