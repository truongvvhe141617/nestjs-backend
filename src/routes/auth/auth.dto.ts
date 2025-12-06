import { IsString, Length } from "class-validator"

export class LoginBodyDTO {
  @IsString()
  email: string
  @IsString()
  @Length(6, 20, { message: 'Mật khẩu phải từ 6 đến 20 ký tự' })
  password: string
}

export class RegisterBodyDTO extends LoginBodyDTO {
  @IsString({ message: 'Tên phải là chuỗi' })
  name: string

  @IsString()
  //@Match('password', { message: 'Mật khẩu không khớp' })
  confirmPassword: string
}