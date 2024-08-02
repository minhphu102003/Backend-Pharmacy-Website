import {body,param} from 'express-validator';

export const loginValidator  = [
    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email CANNOT be empty")
    .bail()
    .isEmail()
    .withMessage("Email is invalid"),
    body("password").notEmpty().withMessage("Password CANNOT be empty")
];

export const signupValidator = [
    body("username")
    .trim()
    .notEmpty()
    .withMessage("User name CANNOT empty"),
    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email CANNOT be empty")
    .bail()
    .isEmail()
    .withMessage("Email is invalid")
    .bail()
    .custom(async (email) =>{
        const emailExist = await User.findOne({email});
        if(emailExist){
            throw new Error("Email already in use");
        }
    }),
    body("password")
    .trim()
    .notEmpty()
    .withMessage("Password CANNOT empty")
    .bail()
    .isLength({min: 6})
    .withMessage("Password MUST be at least 6 characters long")
    .bail()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password MUST include one uppercase letter, one lowercase letter, and one number")
];

export const forgotPasswordValidatior = [
    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email CANNOT be empty")
    .bail()
    .isEmail()
    .withMessage("Email is invalid")
];


export const resetPasswordValidator = [
    param("resetToken").notEmpty().withMessage("Reset token missing"),
    body("password")
        .notEmpty()
        .withMessage("Password CANNOT be empty")
        .bail()
        .isLength({ min: 6 })
        .withMessage("Password MUST be at least 6 characters long")
        .bail()
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Password MUST include one uppercase letter, one lowercase letter, and one number"),
    body("passwordConfirm").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Passwords DO NOT match");
        }
        return true;
    }),
];