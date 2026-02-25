import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { User } from './User';

@Entity('follows')
@Index(['followerId', 'followingId'], { unique: true })
export class Follow {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    followerId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'followerId' })
    follower: User;

    @Column()
    followingId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'followingId' })
    following: User;

    @CreateDateColumn()
    createdAt: Date;
}
