import Joi from 'joi';

export const createFollowSchema = Joi.object({
    followerId: Joi.number().required(),
    followingId: Joi.number().required(),
});
