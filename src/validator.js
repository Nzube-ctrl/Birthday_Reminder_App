const joi = require("joi");

const userValidator = joi.object({
  username: joi.string().min(5).max(10).trim().required().messages({
    "string.empty": "username is required",
    "string.min": "username must be at least 5 characters long",
    "string.max": "username cannot be more than 10 characters",
    "any.required": "username is required",
  }),
  email: joi
    .string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required()
    .messages({
      "string.email": "Email must be a valid address",
      "any.required": "Email is required",
    }),
  dob: joi.date().iso().less("now").greater("1900-01-01").required().messages({
    "date.base": "Date of birth must be a valid date",
    "date.less": "Date of birth must be in the past",
    "date.greater": "Date of birth must be after January 1, 1900",
    "any.required": "Date of birth is required",
  }),
});

const registerValidator = async (req, res, next) => {
  const userPayload = req.body;
  try {
    await userValidator.validateAsync(userPayload);
    next();
  } catch (error) {
    console.log(error);
    return res.status(406).send(error.details[0].message);
  }
};

module.exports = registerValidator;
