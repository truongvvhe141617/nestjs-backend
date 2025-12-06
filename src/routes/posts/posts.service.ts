import { Injectable } from '@nestjs/common'

@Injectable()
export class PostsService {
  getPosts() {
    return 'This action returns all posts'
  }
  createPost(body: any) {
    return body
  }
}
