  import { Injectable, UnauthorizedException } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { PrismaService } from '../prisma/prisma.service';
  import * as bcrypt from 'bcrypt';

  @Injectable()
  export class AuthService {
    constructor(
      private prisma: PrismaService,
      private jwtService: JwtService,
    ) {}

    async login(email: string, pass: string) {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const passwordMatch = await bcrypt.compare(pass, user.password);

      if (!passwordMatch) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          nome: user.nome,
          role: user.role,
          avatarUrl: user.avatarUrl,
          id: user.id,
        },
      };
    }

    async logout() {
      return {
        message: 'Logout realizado com sucesso',
      };
    }
  }
