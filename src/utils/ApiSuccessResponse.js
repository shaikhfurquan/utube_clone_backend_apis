
export const ApiSuccessResponse = (res, message = "Success", data, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message: message,
        data: data,
    });
};


// class ApiResponse {
//     constructor(statusCode, data, message = "Success") {
//         this.statusCode = statusCode
//         this.data = data
//         this.message = message
//         this.success = statusCode < 400
//     }
// }

// export { ApiResponse }