import { Router } from 'express';
import { PostController } from '../controllers/post.controller';
import { LikeController } from '../controllers/like.controller';
import { FollowController } from '../controllers/follow.controller';
import { FeedController } from '../controllers/feed.controller';
import { ActivityController } from '../controllers/activity.controller';
import { validate } from '../middleware/validation.middleware';
import { createLikeSchema } from '../validations/like.validation';
import { createFollowSchema } from '../validations/follow.validation';

export const socialRouter = Router();

const postController = new PostController();
const likeController = new LikeController();
const followController = new FollowController();
const feedController = new FeedController();
const activityController = new ActivityController();

// Feed
socialRouter.get('/feed', feedController.getFeed.bind(feedController));

// Likes
socialRouter.post('/likes', validate(createLikeSchema), likeController.likePost.bind(likeController));
socialRouter.delete('/likes', validate(createLikeSchema), likeController.unlikePost.bind(likeController));

// Follows
socialRouter.post('/follows', validate(createFollowSchema), followController.followUser.bind(followController));
socialRouter.delete('/follows', validate(createFollowSchema), followController.unfollowUser.bind(followController));

// User specific
socialRouter.get('/users/:id/followers', followController.getUserFollowers.bind(followController));
socialRouter.get('/users/:id/activity', activityController.getUserActivity.bind(activityController));
