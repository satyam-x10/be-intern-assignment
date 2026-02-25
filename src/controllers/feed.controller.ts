import { Request, Response } from 'express';
import { Post } from '../entities/Post';
import { Follow } from '../entities/Follow';
import { AppDataSource } from '../data-source';

export class FeedController {
    private postRepository = AppDataSource.getRepository(Post);
    private followRepository = AppDataSource.getRepository(Follow);

    async getFeed(req: Request, res: Response) {
        try {
            // For this assignment, we assume userId is passed as a query param or we'd get it from auth
            const userId = parseInt(req.query.userId as string);
            if (!userId) {
                return res.status(400).json({ message: 'userId query parameter is required for feed' });
            }

            const limit = parseInt(req.query.limit as string) || 10;
            const offset = parseInt(req.query.offset as string) || 0;

            // Get users the current user follows
            const following = await this.followRepository.find({
                where: { followerId: userId },
                select: ['followingId']
            });

            const followingIds = following.map(f => f.followingId);

            if (followingIds.length === 0) {
                return res.json({ posts: [], total: 0, limit, offset });
            }

            const [posts, total] = await this.postRepository
                .createQueryBuilder('post')
                .leftJoinAndSelect('post.user', 'user')
                .leftJoinAndSelect('post.hashtags', 'hashtag')
                .loadRelationCountAndMap('post.likeCount', 'post.likes')
                .where('post.userId IN (:...ids)', { ids: followingIds })
                .orderBy('post.createdAt', 'DESC')
                .skip(offset)
                .take(limit)
                .getManyAndCount();

            res.json({
                posts,
                total,
                limit,
                offset
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching feed', error: error instanceof Error ? error.message : error });
        }
    }
}
