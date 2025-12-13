import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { AuthType, ConditionGuard } from 'src/shared/constants/auth.constant'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { Auth } from 'src/shared/decorators/auth.decorator'
import { CreatePostBodyDTO, GetPostItemDTO } from './post.dto'
import { PostsService } from './posts.service'

@Controller('posts')
export class PostsController {
  constructor(private readonly postService: PostsService) { }

  @Auth([AuthType.Bearer, AuthType.APIKey], { condition: ConditionGuard.OR })
  //Can define Global Guard
  //@UseGuards(AuthenticationGuard)
  @Get()
  @Auth([AuthType.Bearer, AuthType.APIKey], { condition: ConditionGuard.AND })
  getPosts(@ActiveUser('userId') userId: number) {
    return this.postService.getPosts(userId)
  }

  @Post()
  @Auth([AuthType.Bearer])
  createPosts(@Body() body: CreatePostBodyDTO, @ActiveUser('userId') userId: number) {
    return this.postService.createPost(userId, body)
  }

  @Get(':id')
  async getPost(@Param('id') id: string) {
    return new GetPostItemDTO(await this.postService.getPost(Number(id)))
  }

  @Put(':id')
  @Auth([AuthType.Bearer])
  async updatePost(@Body() body: CreatePostBodyDTO, @Param('id') id: string, @ActiveUser('userId') userId: number) {
    return new GetPostItemDTO(
      await this.postService.updatePost({
        postId: Number(id),
        userId,
        body,
      }),
    )
  }

  @Delete(':id')
  @Auth([AuthType.Bearer])
  deletePost(@Param('id') id: string, @ActiveUser('userId') userId: number): Promise<boolean> {
    return this.postService.deletePost({
      postId: Number(id),
      userId,
    })
  }
}
