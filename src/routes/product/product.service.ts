import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductService {
    create(dto: any) {
        return dto;
    }

    findAll() {
        return [];
    }
}
