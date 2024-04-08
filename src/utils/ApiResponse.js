
// export const ApiResponse = (res, message = "Success", data, statusCode = 200) => {
//     return res.status(statusCode).json({
//         success: true,
//         message: message,
//         data: data,
//     });
// };


class ApiResponse {
    constructor(statusCode, message = "Success", data) {
        this.statusCode = statusCode;
        this.success = statusCode < 400;
        this.message = message;
        this.data = data;
    }
}


export { ApiResponse }