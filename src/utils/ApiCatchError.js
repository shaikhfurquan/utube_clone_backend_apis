
// catch block error handler function
export const ApiCatchError = (res, message, error, statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        message: message || 'Internal Server Error',
        error: error.message
    });
};