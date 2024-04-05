
export const ApiSuccessResponse = (res, data, message = "Success", statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        data: data,
        message: message
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