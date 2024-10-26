class ApiError extends Error {
    statusCode: number;
    message: string;
    errors: Array<any>;
    data: null;
    success: Boolean;

    constructor(statusCode: number, message: string, errors = [], stack = "") {
        super(message);
        this.statusCode = statusCode;
        this.errors = this.errors;
        this.message = message;
        this.data = null;
        this.success = false;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
export default ApiError;
