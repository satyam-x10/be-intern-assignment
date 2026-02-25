import { Request, Response } from 'express';
import { In } from 'typeorm';
import { Post } from '../entities/Post';
import { Hashtag } from '../entities/Hashtag';
import { Activity } from '../entities/Activity';
import { AppDataSource } from '../data-source';

export class PostController {
    private postRepository = AppDataSource.getRepository(Post);
    private hashtagRepository = AppDataSource.getRepository(Hashtag);
    private activityRepository = AppDataSource.getRepository(Activity);

    async getAllPosts(req: Request, res: Response) {
        try {
            const posts = await this.postRepository.find({
                relations: ['user', 'hashtags'],
                order: { createdAt: 'DESC' },
            });
            res.json(posts);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching posts', error });
        }
    }

    async getPostById(req: Request, res: Response) {
        try {
            const post = await this.postRepository.findOne({
                where: { id: parseInt(req.params.id) },
                relations: ['user', 'hashtags'],
            });
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }
            res.json(post);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching post', error });
        }
    }

    async createPost(req: Request, res: Response) {
        try {
            const { content, userId } = req.body;
            const post = this.postRepository.create({ content, userId });

            const hashtagNames = this.extractHashtags(content);
            if (hashtagNames.length > 0) {
                post.hashtags = await this.syncHashtags(hashtagNames);
            } else {
                post.hashtags = [];
            }

            const result = await this.postRepository.save(post);

            // Log activity
            await this.activityRepository.save(
                this.activityRepository.create({
                    userId,
                    type: 'post',
                    targetId: result.id,
                })
            );

            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ message: 'Error creating post', error });
        }
    }

    async updatePost(req: Request, res: Response) {
        try {
            const post = await this.postRepository.findOne({
                where: { id: parseInt(req.params.id) },
                relations: ['hashtags']
            });
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            if (req.body.content) {
                post.content = req.body.content;
                const hashtagNames = this.extractHashtags(post.content);
                post.hashtags = await this.syncHashtags(hashtagNames);
            }

            const result = await this.postRepository.save(post);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: 'Error updating post', error: error instanceof Error ? error.message : error });
        }
    }

    async deletePost(req: Request, res: Response) {
        try {
            const result = await this.postRepository.delete(parseInt(req.params.id));
            if (result.affected === 0) {
                return res.status(404).json({ message: 'Post not found' });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Error deleting post', error });
        }
    }

    async getPostsByHashtag(req: Request, res: Response) {
        try {
            const tag = req.params.tag.toLowerCase();
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = parseInt(req.query.offset as string) || 0;

            const [posts, total] = await this.postRepository
                .createQueryBuilder('post')
                .innerJoinAndSelect('post.hashtags', 'hashtag', 'LOWER(hashtag.tag) = :tag', { tag })
                .leftJoinAndSelect('post.user', 'user')
                .loadRelationCountAndMap('post.likeCount', 'post.likes')
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
            res.status(500).json({ message: 'Error fetching posts by hashtag', error });
        }
    }

    private extractHashtags(content: string): string[] {
        const hashtagRegex = /#(\w+)/g;
        const matches = content.match(hashtagRegex);
        if (!matches) return [];
        return Array.from(new Set(matches.map(tag => tag.substring(1).toLowerCase())));
    }

    private async syncHashtags(hashtagNames: string[]): Promise<Hashtag[]> {
        if (hashtagNames.length === 0) return [];

        // Find existing hashtags
        const existingHashtags = await this.hashtagRepository.find({
            where: { tag: In(hashtagNames) }
        });

        const existingNames = existingHashtags.map(h => h.tag);
        const newNames = hashtagNames.filter(name => !existingNames.includes(name));

        let allHashtags = [...existingHashtags];
        if (newNames.length > 0) {
            const newHashtags = newNames.map(name => this.hashtagRepository.create({ tag: name }));
            const savedNewHashtags = await this.hashtagRepository.save(newHashtags);
            allHashtags = [...allHashtags, ...savedNewHashtags];
        }

        return allHashtags;
    }
}
