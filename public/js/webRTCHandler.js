import * as wss from "./wss.js";
import * as constants from "./constants.js";
import * as ui from "./ui.js";
import * as store from "./store.js";
import { getInfoDialog } from "./elements.js";

let connectedUserDetails;
let peerConection;
let dataChannel;

//show camera
const defaulConstrainsts = {
    audio: true,
    video: true,
}

//connection users to show camera and entrer in chat
const configuration = {
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:13902'
        }
    ]
}

//open webcam MODEL
export const getLocalPreview = () => {
    navigator.mediaDevices.getUserMedia(defaulConstrainsts).then((stream) =>{
        ui.updateLocalVideo(stream);
        ui.showVideoCallButtons();
        //here not connection quen chat it's active whith one person
        store.setCallState(constants.callState.CALL_AVAILABLE);
        store.setLocalStream(stream);
    })
    .catch((err) => {
        console.log('error occured when trying to get an access to camera');
        console.log(err);
    });
}

//create peer connection 
const createPeerConnection = () => {
    peerConection = new RTCPeerConnection(configuration);

    //cretae message chat
    dataChannel = peerConection.createDataChannel("chat");

    peerConection.ondatachannel = (event) => {
        const dataChannel = event.channel;

        dataChannel.onopen = () => {
        console.log("peer connection is ready to receive data channel messages");
        }

        dataChannel.onmessage = (event) => {
        console.log("message came from data channel");
        const message = JSON.parse(event.data);
        ui.appendMessage(message);
        }
    }
    //the end create message chat

    peerConection.onicecandidate = (event) => {
        console.log('geeting ice candidates from stun server');
        if(event.candidate) {
            //send our ice candidates to other peer
            wss.sendDataUsingWebRTCSignaling({
                connectedUserSocketId: connectedUserDetails.socketId,
                type: constants.webRTCSignaling.ICE_CANDIDATE,
                candidate: event.candidate,
            });
        }
    }

    peerConection.onconnectionstatechange = (event) => {
        if(peerConection.connectionState === 'connected') {
            console.log('succesfully connected with other peer');
        }
    }

    // receiving tracks and open chat and open camera users.
    const remoteStream = new MediaStream();
    store.setRemoteStream(remoteStream);
    ui.updateRemoteVideo(remoteStream);

    peerConection.ontrack = (event) => {
        remoteStream.addTrack(event.track);
    }

    //add our stream to peer connection
    if(connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE ||
        connectedUserDetails.callType === constants.callType.VIDEO_STRANGER){
        const localStream = store.getState().localStream;

        for (const track of localStream.getTracks()){
            peerConection.addTrack(track, localStream);
        }
    }
}

//create message chat
export const sendMessageUsingDataChannel = (message) => {
    const stringifiedMessage = JSON.stringify(message);
    dataChannel.send(stringifiedMessage);
}

//Pre offer to create connection users.
export const sendPreOffer = (calleePersonalCode, callType) => {
    let state = store.getState();
    connectedUserDetails = {
        callType,
        socketId: calleePersonalCode,
    }

    if (callType === constants.callType.CHAT_PERSONAL_CODE || 
        callType === constants.callType.VIDEO_PERSONAL_CODE){
        const data = {
            callType,
            calleePersonalCode,
        }
    
        if(state.remoteStream === true){
            ui.showCallingDialog(getInfoDialog);
        }else{
            //show popup user
            ui.showCallingDialog(callingDialogRejectCallHandler);
            //here not connection quen chat it's active whith one person
            store.setCallState(constants.callState.CALL_UNAVAILABLE);
            wss.sendPreOffer(data);
        }
    }

    if(callType === constants.callType.CHAT_STRANGER || callType === constants.callType.VIDEO_STRANGER){
        const data = {
            callType,
            calleePersonalCode,
        }
        store.setCallState(constants.callState.CALL_UNAVAILABLE);
        wss.sendPreOffer(data);
    }
}
//Pre offer to create connection users.
export const handlePreOffer = (data) => {
    const { callType, callerSocketId } = data;
    
    //here not connection quen chat it's active whith one person
    if (!checkCallPossibility()) {
        return sendPreOfferAnswer(
          constants.preOfferAnswer.CALL_UNAVAILABLE,
          callerSocketId
        );
    }

    //here not is / not connection quen chat it's active whith one person
    connectedUserDetails = {
        socketId: callerSocketId,
        callType,
    }
    
    //here not connection quen chat it's active whith one person
    store.setCallState(constants.callState.CALL_UNAVAILABLE);

    if(callType === constants.callType.CHAT_PERSONAL_CODE || 
        callType === constants.callType.VIDEO_PERSONAL_CODE){
        console.log("showing call dialog");
        //show popup MODEL
        ui.showIncomingCallDialog(callType, acceptCallHandler, rejectCallHandler);
    }

    if(callType === constants.callType.CHAT_STRANGER || 
        callType === constants.callType.VIDEO_STRANGER){
        createPeerConnection();
        sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
        ui.showCallElements(connectedUserDetails.callType);
    }
}

//buttons accept and reject chat end video
const acceptCallHandler = () => {
    console.log("call accepted");
    createPeerConnection();
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
    ui.showCallElements(connectedUserDetails.callType);
}
//buttons accept and reject chat end video
const rejectCallHandler = () => {
    console.log("call rejected");
    sendPreOfferAnswer();
    //esse set incoming calls available permite enviar novamente o convite quando o usuario enviou uma vez e o modelo recusou, ele permite mandar novamente outro convite.
    setIncomingCallsAvailable();
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED);
}

//
const callingDialogRejectCallHandler = () => {
    console.log("rejecting the call");
    const data = {
        connectedUserSocketId: connectedUserDetails.socketId, 
    }
    closePeerConnectionAndResetState();

    wss.sendUserHangedUp(data);
}

// Receives the response from the "accepted" or "declined" button.
const sendPreOfferAnswer = (preOfferAnswer, callerSocketId = null) => {
    //it was add ofter / callerSocketId = null and const socketId.
    const socketId = callerSocketId
    ? callerSocketId
    : connectedUserDetails.socketId;

    const data = {
        callerSocketId: socketId,
        preOfferAnswer,
    }
    
    //remove popup after click
    ui.removeAllDialogs();
    wss.sendPreOfferAnswer(data);
}

//send response the popup MODEL response to user
export const handlePreOfferAnswer = (data) => {
    const { preOfferAnswer } = data;
    
    //remove popup after click 
    ui.removeAllDialogs();

    if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
        // show dialog that callee has not been found
        ui.showInfoDialog(preOfferAnswer);
        //here not connection quen chat it's active whith one person
        setIncomingCallsAvailable();
    }
    
    if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
        // show dialog that callee is not able to connect
        //here not connection quen chat it's active whith one person
        setIncomingCallsAvailable();
        ui.showInfoDialog(preOfferAnswer);
    }
    
    if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
        // show dialog that call is rejected by the callee
        //here not connection quen chat it's active whith one person
        setIncomingCallsAvailable();
        ui.showInfoDialog(preOfferAnswer);
    }
    
    if (preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED) {
        // send webRTC offer
        ui.showCallElements(connectedUserDetails.callType);
        createPeerConnection();
        sendWebRTCOffer();
    }
}

//connection users to show camera and entrer in chat
const sendWebRTCOffer = async () => {
    const offer = await peerConection.createOffer();
    await peerConection.setLocalDescription(offer);
    wss.sendDataUsingWebRTCSignaling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.webRTCSignaling.OFFER,
        offer: offer,
    });
}

//connection users to show camera and entrer in chat
export const handleWebRTCOffer = async (data) => {
    console.log('webRTC offer came');
    console.log(data);
    await peerConection.setRemoteDescription(data.offer);
    const answer = await peerConection.createAnswer();
    peerConection.setLocalDescription(answer);
    wss.sendDataUsingWebRTCSignaling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.webRTCSignaling.ANSWER,
        answer: answer,
    });
}

//connection users to show camera and entrer in chat
export const handleWebRTCAnswer = async (data) => {
    console.log("handling webRTC Answer");
    await peerConection.setRemoteDescription(data.answer);
}

//connection users to show camera and entrer in chat
export const handleWebRTCCandidate = async (data) => {
    console.log("handling incoming webRTC candidates");
    try{
        await peerConection.addIceCandidate(data.candidate);
    } catch (err) {
        console.error("error occured when trying to add received ice candidate", err);
    }
}

//*************Mostrar Tela do PC***************************/
let screenSharingStream;

export const switchBetweenCameraAndScreenSharing = async (screenSharingActive) => {
    if(screenSharingActive){

        const localStream = store.getState().localStream;
        
        const senders = peerConection.getSenders();

        const sender = senders.find((sender) => {
            return (
                sender.track.kind == localStream.getVideoTracks()[0].kind
            );
        });

        if(sender){
            sender.replaceTrack(localStream.getVideoTracks()[0]);
        }

        //stop screen sharing stream

        store.getState().screenSharingStream.getTracks().forEach((track) => track.stop());

        store.setScreenSharingActive(!screenSharingActive);

        ui.updateLocalVideo(localStream);
    }else{
        console.log('switch for screen sharing');
        try{
            screenSharingStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
            });
            store.setScreenSharingStream(screenSharingStream);
            
            //replace track which sender is sending
            const senders = peerConection.getSenders();

            const sender = senders.find((sender) => {
                return (
                    sender.track.kind == screenSharingStream.getVideoTracks()[0].kind
                );
            });

            if(sender){
                sender.replaceTrack(screenSharingStream.getVideoTracks()[0]);
            }

            store.setScreenSharingActive(!screenSharingActive);
            ui.updateLocalVideo(screenSharingStream);
        }catch (err){
            console.error("error occured when trying to get screen sharing stream", err)
        }
    }
}
//*************fim codigo Mostrar Tela do PC***************************/

// hang up
export const handleHangUp = () => {
    //here is who clicked to end the chat
    console.log("finishing the call");
    const data = {
      connectedUserSocketId: connectedUserDetails.socketId,
    }
  
    wss.sendUserHangedUp(data);
    closePeerConnectionAndResetState();
}
// hang up
export const handleConnectedUserHangedUp = () => {
    //here is who receives from the person who sent the request to end the chat
    console.log("connected peer hanged up");
    closePeerConnectionAndResetState();
}
// hang up
const closePeerConnectionAndResetState = () => {
    if (peerConection) {
      peerConection.close();
      peerConection = null;
    }
  
    // active mic and camera
    if (
        connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE ||
        connectedUserDetails.callType === constants.callType.VIDEO_STRANGER
    ) {
        store.getState().localStream.getVideoTracks()[0].enabled = true;
        store.getState().localStream.getAudioTracks()[0].enabled = true;

        //here finishi connection in only chat
    }
    ui.updateUIAfterHangUp(connectedUserDetails.callType);
    //here not connection quen chat it's active whith one person
    setIncomingCallsAvailable();
    connectedUserDetails = null;
}

//here not connection quen chat it's active whith one person
const checkCallPossibility = (callType) => {
    const callState = store.getState().callState;
  
    if (callState === constants.callState.CALL_AVAILABLE) {
      return true;
    }
  
    if (
      (callType === constants.callType.VIDEO_PERSONAL_CODE ||
        callType === constants.callType.VIDEO_STRANGER) &&
      callState === constants.callState.CALL_AVAILABLE_ONLY_CHAT
    ) {
      return false;
    }
  
    return false;
}

//here not connection quen chat it's active whith one person
const setIncomingCallsAvailable = () => {
    const localStream = store.getState().localStream;
    if (localStream) {
      store.setCallState(constants.callState.CALL_AVAILABLE);
    } else {
      store.setCallState(constants.callState.CALL_AVAILABLE_ONLY_CHAT);
    }
}
  