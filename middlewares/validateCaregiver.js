const { body, validationResult } = require('express-validator');

exports.validateCaregiver = [
    body('name').isString().trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').isString().trim().notEmpty().withMessage('Phone number is required'),
    body('address.street').isString().trim().notEmpty().withMessage('Street address is required'),
    body('address.city').isString().trim().notEmpty().withMessage('City is required'),
    body('address.state').isString().trim().notEmpty().withMessage('State is required'),
    body('address.postalCode').isString().trim().notEmpty().withMessage('Postal code is required'),
    body('address.country').isString().trim().notEmpty().withMessage('Country is required'),
    body('age').isInt({ min: 18 }).withMessage('Age must be at least 18'),
    body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Gender is required'),
    body('fees').isNumeric().withMessage('Fees must be a number'),
    body('bio').isString().trim().notEmpty().withMessage('Bio is required'),
    body('experience').isString().trim().notEmpty().withMessage('Experience is required'),
    body('profilePicture').optional().isURL().withMessage('Profile picture must be a valid URL'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
