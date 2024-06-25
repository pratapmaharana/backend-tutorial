import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from 'jsonwebtoken'

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (err) {
        throw new ApiError(500, err.message)
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user details
    // validation - not empty
    // check if user already exist: username, email
    // check for images, and avatar
    // upload them to cloudinary
    // create user object - create entry in db
    // remove password and refresh token from response
    // check for user creation
    // return res

    const { username, email, fullname, password } = req.body

    if ([username, email, fullname, password].some(field => !field?.trim())) {
        throw new ApiError(400, "All fields (username, email, fullname, password) are required")
    }

    const existedUser = await User.findOne({ $or: [{ username }, { email }] })

    if (existedUser) {
        throw new ApiError(400, "User already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    let coverImageLocalPath
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files?.coverImage[0]?.path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath, 'avatar')
    const coverImage = await uploadOnCloudinary(coverImageLocalPath, 'coverImage')

    if (!avatar) {
        throw new ApiError(400, "Failed to upload avatar")
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullname,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ''
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(400, "Failed to create user")
    }

    res.status(201).json(
        new ApiResponse(201, createdUser, "User created successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if ([email, password].some(field => !field?.trim())) {
        throw new ApiError(400, "All fields (email, password) are required")
    }

    const user = await User.findOne({ email })
    // const user = await User.findOne({ $or: [{ username }, { email }] })
    if (!user) {
        throw new ApiError(400, "User not found")
    }

    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    if (!loggedInUser) {
        throw new ApiError(400, "Failed to login user")
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, loggedInUser, "User logged in successfully"))
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: null
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
        .clearCookie("accessToken", null, options)
        .clearCookie("refreshToken", null, options)
        .json(new ApiResponse(200, null, "User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incommingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken

    if (!incommingRefreshToken) {
        throw new ApiError(401, "Refresh token is required")
    }

    try {
        const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken._id)

        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }

        if (incommingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Invalid Refresh Token")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "User logged in successfully"))
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }
})

export { registerUser, loginUser, logoutUser, refreshAccessToken }