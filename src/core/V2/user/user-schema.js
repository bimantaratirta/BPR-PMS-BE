import Joi from "joi";

const passwordRule = Joi.string()
  .min(8)
  .pattern(/^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
  .messages({
    "string.empty": "required",
    "string.min": "minimum 8 characters",
    "string.pattern.base":
      "At least 8 characters, 1 uppercase letter, and 1 special character",
  });

const createUserSchema = Joi.object({
  name: Joi.string().required().min(3).messages({
    "string.empty": "required",
    "string.min": "minimum 3 characters",
  }),
  username: Joi.string().required().messages({
    "string.empty": "required",
  }),
  role: Joi.string().valid("Direksi", "AM", "SLO", "LO").required().messages({
    "string.empty": "required",
    "any.only": "invalid role",
  }),
  region_id: Joi.when("role", {
    is: "AM",
    then: Joi.string().required().messages({
      "string.empty": "required",
    }),
    otherwise: Joi.string().optional().allow(null, ""),
  }),
  branch_id: Joi.when("role", {
    is: Joi.valid("LO", "SLO"),
    then: Joi.string().required().messages({
      "string.empty": "required",
    }),
    otherwise: Joi.string().optional().allow(null, ""),
  }),
  password: passwordRule.required(),
  password_confirmation: Joi.string()
    .required()
    .valid(Joi.ref("password"))
    .messages({
      "string.empty": "required",
      "any.only": "Password confirmation does not match password",
    }),
});

const updateUserSchema = Joi.object({
  name: Joi.string().optional().min(3).max(50).messages({
    "string.min": "minimum 3 characters",
    "string.max": "maximum 50 characters",
  }),
  username: Joi.string().optional().min(3).max(30).messages({
    "string.min": "minimum 3 characters",
    "string.max": "maximum 30 characters",
  }),
  role: Joi.string().optional().valid("Direksi", "AM", "SLO", "LO").messages({
    "any.only": "invalid role",
  }),
  region_id: Joi.string().optional().allow(null, ""),
  branch_id: Joi.string().optional().allow(null, ""),
}).min(1);

const resetPasswordSchema = Joi.object({
  password: passwordRule.required(),
  password_confirmation: Joi.string()
    .required()
    .valid(Joi.ref("password"))
    .messages({
      "string.empty": "required",
      "any.only": "Password confirmation does not match password",
    }),
});

export { createUserSchema, updateUserSchema, resetPasswordSchema };
