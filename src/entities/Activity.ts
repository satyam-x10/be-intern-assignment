import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './User';

export enum ActivityType {
    POST = 'post',
    LIKE = 'like',
    FOLLOW = 'follow',
    UNFOLLOW = 'unfollow',
}

@Entity('activities')
export class Activity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    userId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({
        type: 'varchar',
        length: 50,
    })
    type: string; // post, like, follow, unfollow

    @Column({ type: 'integer', nullable: true })
    targetId: number; // ID of post, followingId, etc.

    @Column({ type: 'text', nullable: true })
    metadata: string; // JSON string for extra info

    @CreateDateColumn()
    createdAt: Date;
}
