import { Controller } from '@nestjs/common';
import { WebsocketsService } from './websockets.service';

@Controller('websockets')
export class WebsocketsController {
  constructor(private readonly websocketsService: WebsocketsService) {}
}
