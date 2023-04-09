import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface TouchData {
    touchType: string;
    positionX: number;
    positionY: number;
}

@WebSocketGateway()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        client.emit('event', 'datayuswyavyuuv')
        console.log("connection handled")
        // throw new Error('Method not implemented.');
    }
    handleDisconnect(client: any) {
        throw new Error('Method not implemented.');
    }

    @SubscribeMessage('event')
    handleEvent(client: any, data: any) {
        console.log('Received data:', data);
        this.server.emit('event', data);
    }
}

// @WebSocketGateway()
// export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {

//     @WebSocketServer()
//     server: Server;

//     private connections: Map<string, Socket> = new Map();

//     handleConnection(client: Socket, ...args: any[]) {
//         console.log(`User connected: ${client}`);

//         // Join the socket to the chat room
//         client.join('chat-room');
//     }

//     handleDisconnect(client: Socket) {
//         console.log(`User disconnected: ${client.id}`);
//     }

//     handleInit(server: Server) {
//         console.log('Socket chat server started.');
//     }

//     @SubscribeMessage('message')
//     handleMessage(client: Socket, data: string) {
//         console.log(`Received message from ${client.id}: ${data}`);

//         // Send the message to all sockets in the same room
//         this.server.to('chat-room').emit('message', {
//             from: client.id,
//             message: data,
//         });
//     }

//     // afterInit() {
//     //     console.log('Socket gateway initialized');
//     // }

//     // handleConnection(socket: Socket, user: User) {
//     //     // Add the user to the connections map
//     //     this.connections.set(user.userName, socket);
//     // }

//     // handleDisconnect(user: User) {
//     //     // Remove the user from the connections map
//     //     this.connections.delete(user.userName);
//     // }

//     // createConnection(user: User, userToConnect: User) {
//     //     // Create a new socket session between the two users
//     //     const socket1 = this.connections.get(user.userName);
//     //     const socket2 = this.connections.get(userToConnect.userName);

//     //     if (socket1 && socket2) {
//     //         socket1.join(userToConnect.userName);
//     //         socket2.join(user.userName);
//     //     }
//     // }

//     // @SubscribeMessage('touch')
//     // handleTouch(socket: Socket, data: TouchData) {
//     //     // Broadcast touch data to all sockets in the same room as the sender
//     //     socket.to(socket.rooms[0]).emit('touch', data);
//     // }

//     // sendMessage(userId: string, message: any) {
//     //     const socket = this.connections.get(userId);
//     //     if (socket) {
//     //         socket.emit('message', message);
//     //     }
//     // }

//     // SubscribeMessage(arg0: string) {
//     //     throw new Error('Function not implemented.');
//     // }

// }
