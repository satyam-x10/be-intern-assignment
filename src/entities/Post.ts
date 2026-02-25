import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    ManyToMany,
    JoinTable,
    JoinColumn,
} from 'typeorm';
import { User } from './User';
import { Like } from './Like';
import { Hashtag } from './Hashtag';

@Entity('posts')
export class Post {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'text' })
    content: string;

    @Column()
    userId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @OneToMany(() => Like, (like) => like.post)
    likes: Like[];

    @ManyToMany(() => Hashtag, (hashtag) => hashtag.posts)
    @JoinTable({
        name: 'post_hashtags',
        joinColumn: { name: 'postId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'hashtagId', referencedColumnName: 'id' },
    })
    hashtags: Hashtag[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
