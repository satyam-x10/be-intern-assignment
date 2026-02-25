import { Request, Response } from 'express';
import { Between, In } from 'typeorm';
import { Activity } from '../entities/Activity';
import { AppDataSource } from '../data-source';

export class ActivityController {
    private activityRepository = AppDataSource.getRepository(Activity);

    async getUserActivity(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.id);
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = parseInt(req.query.offset as string) || 0;
            const type = req.query.type as string;
            const startDate = req.query.startDate as string;
            const endDate = req.query.endDate as string;

            const query: any = {
                where: { userId },
                order: { createdAt: 'DESC' },
                take: limit,
                skip: offset,
            };

            if (type) {
                query.where.type = type;
            }

            if (startDate && endDate) {
                query.where.createdAt = Between(new Date(startDate), new Date(endDate));
            } else if (startDate) {
                query.where.createdAt = Between(new Date(startDate), new Date());
            }

            const [activities, total] = await this.activityRepository.findAndCount(query);

            res.json({
                activities,
                total,
                limit,
                offset
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching activity', error: error instanceof Error ? error.message : error });
        }
    }
}
