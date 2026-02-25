import { Request, Response } from 'express';
import { Like } from '../entities/Like';
import { Activity } from '../entities/Activity';
import { AppDataSource } from '../data-source';

export class LikeController {
    private likeRepository = AppDataSource.getRepository(Like);
    private activityRepository = AppDataSource.getRepository(Activity);

    async likePost(req: Request, res: Response) {
        try {
            const { userId, postId } = req.body;

            const existingLike = await this.likeRepository.findOneBy({
                userId,
                postId,
            });

            if (existingLike) {
                return res.status(400).json({ message: 'Post already liked' });
            }

            const like = this.likeRepository.create({ userId, postId });
            const result = await this.likeRepository.save(like);

            // Log activity
            await this.activityRepository.save(
                this.activityRepository.create({
                    userId,
                    type: 'like',
                    targetId: postId,
                })
            );

            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ message: 'Error liking post', error });
        }
    }

    async unlikePost(req: Request, res: Response) {
        try {
            const { userId, postId } = req.body;
            const result = await this.likeRepository.delete({ userId, postId });

            if (result.affected === 0) {
                return res.status(404).json({ message: 'Like not found' });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Error unliking post', error });
        }
    }
}
