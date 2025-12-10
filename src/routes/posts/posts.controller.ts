import { Body, Controller, Get, Post } from '@nestjs/common'
import { AuthType, ConditionGuard } from 'src/shared/constants/auth.constant'
import { Auth } from 'src/shared/decorators/auth.decorator'
import { PostsService } from './posts.service'

@Controller('posts')
export class PostsController {
  constructor(private readonly postService: PostsService) { }

  @Auth([AuthType.Bearer, AuthType.APIKey], { condition: ConditionGuard.OR })
  //Can define Global Guard
  //@UseGuards(AuthenticationGuard)
  @Get()
  getPosts() {
    return this.postService.getPosts()
  }

  @Post()
  createPosts(@Body() body: any) {
    return this.postService.createPost(body)
  }
}
