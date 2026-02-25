import Joi from 'joi';

export const createHashtagSchema = Joi.object({
    tag: Joi.string().required().min(1).max(50).messages({
        'string.empty': 'Hashtag is required',
        'string.max': 'Hashtag cannot exceed 50 characters',
    }),
});
