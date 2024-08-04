// Promise method
const asyncHandler = (requestHandler) =>{
    return (req, res, next) =>{
        Promise.resolve(requestHandler(req, res, next))
        .catch((err)=>next(err));   
    }
}

export {asyncHandler}

// tryCatch

// const asyncHandlertry = (fn) = async() =>{
//     try {
//         await fn(req, res, next)
        
//     } catch (error) {
//         console.error("Error connecting databse",error);
//         res.status(error.code || 500).json({
//             success:error.message
//     });
//     }
// }