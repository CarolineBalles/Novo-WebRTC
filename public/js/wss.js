import * as store from "./store.js";
import * as ui from "./ui.js";
import * as webRTCHandler from "./webRTCHandler.js"
import * as constants from "./constants.js";
import * as strangerUtils from "./strangerUtils.js";

let socketIO = null;
//receive info from app.js
export const registerSocketEvents = (socket) => {
    socketIO = socket;
    socket.on("connect", () => {
        console.log("Succesfully connected to socket.io server");
        store.setSocketId(socket.id);
        //call metothd show the code socket id in input 
        ui.updatePersonalCode(socket.id);
    });
    //Pre offer create connection users
    socket.on("pre-offer", (data) => {
        webRTCHandler.handlePreOffer(data);
    });

    //send button popup MODEL response to user
    socket.on("pre-offer-answer", (data) => {
        webRTCHandler.handlePreOfferAnswer(data);
    });
    //hang up
    socket.on("user-hanged-up", () => {
        webRTCHandler.handleConnectedUserHangedUp();
    });

    socket.on("webRTC-signaling", (data) =>{
        switch (data.type) {
            case constants.webRTCSignaling.OFFER:
                webRTCHandler.handleWebRTCOffer(data);
                break;
            case constants.webRTCSignaling.ANSWER:
                webRTCHandler.handleWebRTCAnswer(data);
                break;
            case constants.webRTCSignaling.ICE_CANDIDATE:
                webRTCHandler.handleWebRTCCandidate(data);
                break;
            default:
                return;
        }
    });

    socket.on("stranger-socket-id", (data) => {
        strangerUtils.connectWithStranger(data);
    });
}
//all code here down send information from app.js

//Pre offer create connection users
export const sendPreOffer = (data) => {
    console.log("emiting to server pre offer event");
    socketIO.emit("pre-offer", data);
}

//send button popup MODEL response to user
export const sendPreOfferAnswer = (data) => {
    socketIO.emit("pre-offer-answer", data);
}

export const sendDataUsingWebRTCSignaling = (data) => {
    socketIO.emit("webRTC-signaling", data);
}
//hangUP
export const sendUserHangedUp = (data) => {
    socketIO.emit("user-hanged-up", data);
}

export const changeStrangerConnectionStatus = (data) => {
    socketIO.emit("stranger-connection-status", data);
}

export const getStrangerSocketId = () => {
    socketIO.emit("get-stranger-socket-id");
}