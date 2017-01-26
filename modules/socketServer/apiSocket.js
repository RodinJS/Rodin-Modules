/**
 * Created by xgharibyan on 11/23/16.
 */


import sio from 'socket.io';
import _ from 'lodash';

const Service = {
    namespaces:{}
};

class RodinNS {

    constructor(io, namespace) {
        this.join = this.join.bind(this);
        this.io = io.of('/'+namespace);
        this.io.on('connection', this.join);
    }

    join(socket){

        socket.leave(socket.id);

        socket.userData  = _.omit(socket.handshake.query, ['EIO', 'transport', 'ns', 't']);

        socket.userData.socketId = socket.id;

        socket.on('broadcastToAll', (data)=> this.broadcastToAll(data));

        socket.on('disconnect', (data)=> this.socketDisconnected(data));

        socket.on('message', (data)=> this.sendMessageToSocket(socket, data));

        socket.on('joinRoom', (data)=> this.joinRoom(socket, data));

        socket.on('leaveRoom', (data)=> this.leaveRoom(socket, data));

        socket.on('getRooms', (data)=> this.getRooms(socket, data));

        socket.on('deleteRoom', (data)=> this.deleteRoom(socket, data));

        socket.on('broadcastToRoom', (data)=> this.broadcastToRoom(data));

        socket.on('getConnectedUsersList', (data)=> this.getConnectedUsersList(socket, data));

    }

    socketDisconnected(socket, data){
        this.broadcastToAll('socketDisconnected', {socketId:socket.id});
    }

    sendMessageToRequester(socket, channel, data){
        socket.emit(channel, data);
    }

    broadcastToRoom(data){
        this.io.to(data.roomName).emit(data.eventName || 'broadcastToRoom', data.data);
    }

    broadcastToAll(data){
        this.io.emit(data.event, data.data);
    }

    getConnectedUsersList(socket, data){

        let connectedUsers = _.filter(_.map(this.io.connected, (socket)=>{
            return _.pick(socket, ['userData', 'id']);
        }), (user)=>{
            return socket.id != user.id;
        });

        this.sendMessageToRequester(socket, 'getConnectedUsersList', connectedUsers);
    }

    sendMessageToSocket(socket, data){
        if(_.isUndefined(data.socketIds) || _.isEmpty(data.socketIds)){
            return this.sendMessageToRequester(socket, 'onError', {error:true, message:'Provide socket id'});
        }
        if(_.isArray(data.socketIds)){
            for(let i = 0; i < data.socketIds.length; i++){
                if(this.io.connected[data.socketIds[i]])
                    this.io.connected[data.socketIds[i]].emit(data.event, data.message);
            }
        }
        else{
            if(this.io.connected[data.socketIds])
                this.io.connected[data.socketIds].emit(data.event, data.message);
        }
    }

    joinRoom(socket, data){
        socket.join(data.roomName);
        if(data.notifyAll){
           this.broadcastToRoom({roomName:data.roomName, eventName:'joinRoom', data:socket.userData})
        }
        return this.sendMessageToRequester(socket, 'message', {error:false, message:`Joined to ${data.roomName} room`});
    }

    leaveRoom(socket, data){
        if(!this.io.adapter.rooms[data.roomName]){
            return this.sendMessageToRequester(socket, 'onError', {error:true, message:`${data.roomName} not exist`});
        }
        socket.leave(data.roomName);
        if(data.notifyAll){
            this.broadcastToRoom({roomName:data.roomName, eventName:'leaveRoom', data:socket.userData})
        }
        return this.sendMessageToRequester(socket, 'message', {error:false, message:`Leaved from ${data.roomName} room`});
    }

    deleteRoom(socket, data){
        if(!this.io.adapter.rooms[data.roomName]){
            return this.sendMessageToRequester(socket, 'onError', {error:true, message:`${data.roomName} not exist`});
        }
        _.each(this.io.adapter.rooms[data.roomName].sockets, (connected, socketId) =>{
            this.broadcastToRoom({roomName:data.roomName, eventName:'leaveRoom', data:this.io.connected[socketId].userData});
            this.io.connected[socketId].leave(data.roomName);
        });
        return this.sendMessageToRequester(socket, 'message', {error:false, message:`${data.roomName} room deleted`});
    }

    getRooms(socket){

        let rooms =  _.reduce(this.io.adapter.rooms, (result, room, roomName) => {
            let Users = _.map(room.sockets, (connected, key)  =>{
                return _.pick(this.io.connected[key], ['userData', 'id']);
            });
            (result[roomName] || (result[roomName] = Users));
            return result;
        }, {});

        return this.sendMessageToRequester(socket, 'getRooms', rooms);
    }

}

function run(server) {
    Service.io = sio(server);
}

function subscribe(req, res){
    if(_.isUndefined(req.body.projectId) || _.isEmpty(req.body.projectId)){
        return res.status(400).json({success:false, data:'Provide namespace'});
    }
    if(!Service.namespaces[req.body.projectId]){
        Service.namespaces[req.body.projectId] = new RodinNS(Service.io, req.body.projectId);
    }
    return res.status(200).json({success:true, data:{ns:req.body.projectId}});
}

export default {run, Service, subscribe};
