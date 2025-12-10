import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { PostsService } from './posts.service'
import { Auth } from 'src/shared/decorators/auth.decorator'
import { AuthType, ConditionGuard } from 'src/shared/constants/auth.constant'
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard'

@Controller('posts')
export class PostsController {
  constructor(private readonly postService: PostsService) { }

  @Auth([AuthType.Bearer, AuthType.APIKey], { condition: ConditionGuard.And })
  @UseGuards(AuthenticationGuard)
  @Get()
  getPosts() {
    return this.postService.getPosts()
  }

  @Post()
  createPosts(@Body() body: any) {
    return this.postService.createPost(body)
  }
}
