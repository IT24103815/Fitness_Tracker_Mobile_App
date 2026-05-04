const errorHandler = (err, req, res, next) => {
    console.error(`[Error]: ${err.message}`);
    console.error(err.stack);

    const statusCode = err.statusCode || 500;
    
    // Mongoose duplicate key
    if (err.code === 11000) {
        return res.status(400).json({ success: false, message: 'Duplicate field value entered' });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        return res.status(400).json({ success: false, message });
    }

    // Cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({ success: false, message: `Resource not found with id of ${err.value}` });
    }

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Server Error'
    });
};

module.exports = errorHandler;
