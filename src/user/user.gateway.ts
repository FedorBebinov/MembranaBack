import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: '/socket' })
export class UserGateway {
    @WebSocketServer() server: Server;
}