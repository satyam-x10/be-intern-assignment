import { Request, Response } from 'express';
import { Follow } from '../entities/Follow';
import { Activity } from '../entities/Activity';
import { AppDataSource } from '../data-source';

export class FollowController {
    private followRepository = AppDataSource.getRepository(Follow);
    private activityRepository = AppDataSource.getRepository(Activity);

    async followUser(req: Request, res: Response) {
        try {
            const { followerId, followingId } = req.body;

            if (followerId === followingId) {
                return res.status(400).json({ message: 'Users cannot follow themselves' });
            }

            const existingFollow = await this.followRepository.findOneBy({
                followerId,
                followingId,
            });

            if (existingFollow) {
                return res.status(400).json({ message: 'Already following this user' });
            }

            const follow = this.followRepository.create({ followerId, followingId });
            const result = await this.followRepository.save(follow);

            // Log activity
            await this.activityRepository.save(
                this.activityRepository.create({
                    userId: followerId,
                    type: 'follow',
                    targetId: followingId,
                })
            );

            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ message: 'Error following user', error });
        }
    }

    async unfollowUser(req: Request, res: Response) {
        try {
            const { followerId, followingId } = req.body;
            const result = await this.followRepository.delete({ followerId, followingId });

            if (result.affected === 0) {
                return res.status(404).json({ message: 'Follow relationship not found' });
            }

            // Log activity
            await this.activityRepository.save(
                this.activityRepository.create({
                    userId: followerId,
                    type: 'unfollow',
                    targetId: followingId,
                })
            );

            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Error unfollowing user', error });
        }
    }

    async getUserFollowers(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.id);
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = parseInt(req.query.offset as string) || 0;

            const [followers, total] = await this.followRepository.findAndCount({
                where: { followingId: userId },
                relations: ['follower'],
                order: { createdAt: 'DESC' },
                take: limit,
                skip: offset,
            });

            res.json({
                followers: followers.map(f => f.follower),
                total,
                limit,
                offset
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching followers', error });
        }
    }
}
