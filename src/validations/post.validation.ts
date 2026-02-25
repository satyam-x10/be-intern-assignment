import Joi from 'joi';

export const createPostSchema = Joi.object({
    content: Joi.string().required().min(1).max(5000).messages({
        'string.empty': 'Post content is required',
        'string.max': 'Post content cannot exceed 5000 characters',
    }),
    userId: Joi.number().required().messages({
        'any.required': 'User ID is required',
    }),
});

export const updatePostSchema = Joi.object({
    content: Joi.string().min(1).max(5000).messages({
        'string.max': 'Post content cannot exceed 5000 characters',
    }),
})
    .min(1)
    .messages({
        'object.min': 'At least one field must be provided for update',
    });
