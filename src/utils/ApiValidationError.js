
export const ApiValidationError = (res, message, statusCode = 404) => {
    return res.status(statusCode).json({
        success: false,
        message: message || 'Not Found',
    });
};

// class ApiError extends Error {
//     constructor(
//         statusCode,
//         message = "Something went wrong",
//         errors = [],
//         stack = ""
//     ) {
//         super(message)
//         this.statusCode = statusCode
//         this.data = null
//         this.message = message
//         this.success = false
//         this.errors = errors

//         if (stack) {
//             this.stack = stack
//         } else {
//             Error.captureStackTrace(this, this.constructor)
//         }
//     }
// }


// export { ApiError }
