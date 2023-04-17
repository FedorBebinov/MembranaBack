import { OnModuleInit } from "@nestjs/common";
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { listen } from "engine.io";


@WebSocketGateway({
    allowEIO3: true,
    pingInterval: 300,
    pingTimeout: 200,
    maxPayload: 1e6,
    cors: {
        origin: "*"
    }
    // cors: true,
    // s
})
export class MyGateway implements OnModuleInit {

    @WebSocketServer()
    server: Server;

    onModuleInit() {
        this.server.on('connection', (socket) => {
            console.log('URAAAAAsocket.id', socket.id);
            console.log('connected')
        })
    }

    @SubscribeMessage('newMessage')
    onNewMessage(@MessageBody() body: any) {
        console.log(body);
        this.server.emit('onMessage', {
            msg: 'New Message',
            content: body
        })
        // this.server.emit('onMessage', {
        //     msg: 'New Message',
        //     content: body
        // })
    }

    @SubscribeMessage('connect')
    onConnect(@MessageBody() body: any) {
        console.log('onConnect body', body);
        this.server.emit('onConnect', {
            msg: `${body.userName} connected to you`,
            content: body
        })
        // this.server.emit('onMessage', {
        //     msg: 'New Message',
        //     content: body
        // })
    }

}