export function errorHandler(err, req, res, next) {
// fix: never expose stack traces or internal error details to the client in production — log them internally instead
    console.error(err);
    const isProd = process.env.NODE_ENV === "production";
    res.status(err.status || 500).json({
        error: {
            code: err.code || "INTERNAL_ERROR",
            message: isProd ? "Something went wrong." : err.message,
        },
    });
}