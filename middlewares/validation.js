import { body, param, validationResult } from "express-validator"

const usernameValidation = body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 2, max: 32 })
    .withMessage("Username must be between 2-32 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Username can only contain letters and spaces")

const emailValidation = body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("Email must not exceed 255 characters")

const passwordValidation = body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain uppercase, lowercase, and number");


const userIdValidation = param("userId")
    .isInt({ min: 1 })
    .withMessage("Invalid user ID")
    .toInt();

export const createUserValidation = [
    emailValidation,
    usernameValidation,
    passwordValidation
];

export const loginValidation = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email is invalid")
        .normalizeEmail(),
    body("password")
        .notEmpty()
        .withMessage("Password is required")
];

export const updateUserValidation = [
    body("username")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 2, max: 32 })
        .withMessage("Username must be between 2-32 characters long")
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage("Name can contain only letters and spaces"),
    body("email")
        .optional({ values: "falsy" })
        .trim()
        .isEmail()
        .withMessage("Invalid email")
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage("Email must not exceed 255 characters")
]

export const getUserValidation = [userIdValidation]

export const deleteUserValidation = [userIdValidation]

// -------------------- POST VALIDATION --------------------

const postIdValidation = param("postId")
    .isInt({ min: 1 })
    .withMessage("Invalid post ID")
    .toInt();

const titleValidation = body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 2, max: 500 })
    .withMessage("TItle must be between 2-3000 characters")

const contentValidation = body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 10, max: 5000 })
    .withMessage("Content must be between 10-5000 characters")

export const getPostValidation = [postIdValidation];


export const createPostValidation = [
    titleValidation,
    contentValidation
]

export const updatePostValidation = [
    body("title")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isLength({ min: 2, max: 500 })
        .withMessage("TItle must be between 2-3000 characters"),
    body("content")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Content is required")
        .isLength({ min: 10, max: 5000 })
        .withMessage("Content must be between 10-5000 characters")

]

export const deletePostValidation = [postIdValidation];

export const createAndUpdateComment =
    body("content")
        .trim()
        .notEmpty()
        .withMessage("Comment could not be empty string")
        .isLength({ min: 2, max: 3000 })
        .withMessage("Comment must be between 2-3000 characters")

export const deleteCommentValidation = param("commentId")
    .isInt({ min: 1 })
    .withMessage("Invalid post ID")
    .toInt();

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().reduce((acc, err) => {
            const field = err.path || err.param;

            if (!acc[field]) {
                acc[field] = []
            }
            acc[field].push(err.msg)
            return acc;
        }, {})
        return res.status(400).json({
            success: false,
            errors: formattedErrors
        })
    }
    next();
}