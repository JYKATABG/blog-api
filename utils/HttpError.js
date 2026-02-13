export class HttpError extends Error {
    constructor(message, status, code) {
        super(message)
        this.status = status;
        this.code = code;
    }
}