const asyncHandler = (fn) => {
    return (req, res, next) => Promise.resolve(fn(req, res, next)).catch((err) => next(err))
}

// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(err.cde || 500).json({ success: false, message: err.message })
//     }
// }

export { asyncHandler } 