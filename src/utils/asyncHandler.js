

const asyncHandler = (requestHandler) => { 
    // return async (req, res, next) => {
    //     try {
    //         await requestHandler(req, res, next);
    //     } catch (err) {
    //         next(err);
    //     }
    // };
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => next(err));
    }
}

export { asyncHandler }