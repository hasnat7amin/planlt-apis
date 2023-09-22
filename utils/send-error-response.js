module.exports = (res,status_code, message, errors) =>{
    res.status(status_code).json({
        code: status_code,
  
        status: false,
  
        message: message,
  
        result: { errors },
      });
}