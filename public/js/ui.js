import * as constants from "./constants.js";
import * as elements from "./elements.js";

//show socket id in input
export const updatePersonalCode = (personalCode) => {
    const personalCodeParagraph = document.getElementById('personal_code_paragraph');
    personalCodeParagraph.innerHTML = personalCode;
}

//open webcam MODEL
export const updateLocalVideo = (stream) => {
    const localVideo = document.getElementById('local_video');
    localVideo.srcObject = stream;

    localVideo.addEventListener('loadedmetadata', () => {
        localVideo.play();
    })
}

export const showVideoCallButtons = () => {
    const personalCodeVideoButton = document.getElementById(
      "personal_code_video_button"
    );
    const strangerVideoButton = document.getElementById("stranger_video_button");
  
    showElement(personalCodeVideoButton);
    showElement(strangerVideoButton);
}

//open chat and open camera users.
export const updateRemoteVideo = (stream) => {
    const remoteVideo = document.getElementById('remote_video');
    remoteVideo.srcObject = stream;
}

//call to show popup accept or reject chat e video call MODEL
export const showIncomingCallDialog = (callType, acceptCallHandler, rejectCallHandler) => {
    const callTypeInfo = callType === constants.callType.CHAT_PERSONAL_CODE ? 'Chat' : 'Video';
    const incomingCallDialog = elements.getIncomingCallDialog(callTypeInfo, acceptCallHandler, rejectCallHandler);

    // removing all dialogs inside HTML dialog element
    const dialog = document.getElementById("dialog");
    dialog.querySelectorAll("*").forEach((dialog) => dialog.remove());

    dialog.appendChild(incomingCallDialog);
}

//call to show popup accept or reject chat e video call USER.
export const showCallingDialog = (rejectCallHandler) => {
    const callingDialog = elements.getCallingDialog(rejectCallHandler);
    // removing all dialogs inside HTML dialog element
    const dialog = document.getElementById("dialog");
    dialog.querySelectorAll("*").forEach((dialog) => dialog.remove());

    dialog.appendChild(callingDialog);
}

export const showNoStrangerAvailableDialog = () => {
  const infoDialog = elements.getInfoDialog("No Stranger Available", "Please try again later");

  if(infoDialog){
    const dialog = document.getElementById("dialog");
    dialog.appendChild(infoDialog);

    setTimeout(() => {
      removeAllDialogs();
    }, [4000]);
  }
}

//show response MODEL the popup to USER.
export const showInfoDialog = (preOfferAnswer) => {
    let infoDialog = null;

    if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
        infoDialog = elements.getInfoDialog("Call rejected", "Callee rejected your call");
    }

    if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
        infoDialog = elements.getInfoDialog("Callee not found", "Please check personal code");
    }

    if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
        infoDialog = elements.getInfoDialog("Call is not possible", "Probably callee is busy. Please try againg later");
    }

    if (infoDialog) {
        const dialog = document.getElementById("dialog");
        dialog.appendChild(infoDialog);

        setTimeout(() => {
        removeAllDialogs();
        }, [4000]);
    }
}

//remove all popup
export const removeAllDialogs = () => {
    const dialog = document.getElementById("dialog");
    dialog.querySelectorAll("*").forEach((dialog) => dialog.remove());
};

//show buttons the webcam and chat.
export const showCallElements = (callType) => {
    if (callType === constants.callType.CHAT_PERSONAL_CODE || callType === constants.callType.CHAT_STRANGER) {
        showChatCallElements();
    }
    
    if (callType === constants.callType.VIDEO_PERSONAL_CODE || callType === constants.callType.VIDEO_STRANGER) {
        showVideoCallElements();
    }
}

//show only show chat and not show buttons the controller the camera(webcam)
const showChatCallElements = () => {
  debugger;
    const finishConnectionChatButtonContainer = document.getElementById(
        "finish_chat_button_container"
    );
    showElement(finishConnectionChatButtonContainer);
    
    const newMessageInput = document.getElementById("new_message");
    showElement(newMessageInput);
    //block panel
    disableDashboard();
}

//show buttons the controller the webcam in chat
const showVideoCallElements = () => {
  debugger;
    const callButtons = document.getElementById("call_buttons");
    showElement(callButtons);
  
    /*const placeholder = document.getElementById("video_placeholder");
    hideElement(placeholder);*/
  
    const remoteVideo = document.getElementById("remote_video_container");
    showElement(remoteVideo);
  
    const newMessageInput = document.getElementById("new_message");
    showElement(newMessageInput);
    //block panel
    disableDashboard();
}

//ui call buttons update image off or on
const micOnImgSrc = './utils/images/mic.png';
const micOffImgSrc = './utils/images/micOff.png';

export const updateMicButton = (micActive) => {
    const micButtonImage = document.getElementById('mic_button_image');
    micButtonImage.src = micActive ? micOffImgSrc : micOnImgSrc;
}

const cameraOnImgSrc = './utils/images/camera.png';
const cameraOffImgSrc = './utils/images/cameraOff.png';

export const updateCameraButton = (cameraActive) => {
    const cameraButtonImage = document.getElementById('camera_button_image');
    cameraButtonImage.src = cameraActive ? cameraOffImgSrc : cameraOnImgSrc; 
}

// ui messages
export const appendMessage = (message, right = false) => {
    const messagesContainer = document.getElementById("messages_container");
    const messageElement = right
      ? elements.getRightMessage(message)
      : elements.getLeftMessage(message);
      console.log(messageElement);
    messagesContainer.appendChild(messageElement);
}
// ui messages
export const clearMessenger = () => {
    const messagesContainer = document.getElementById("messages_container");
    messagesContainer.querySelectorAll("*").forEach((n) => n.remove());
}

//ui recording
export const showRecordingPanel = () => {
    const recordingButtons = document.getElementById("video_recording_buttons");
    showElement(recordingButtons);
  
    // hide start recording button if it is active
    const startRecordingButton = document.getElementById(
      "start_recording_button"
    );
    hideElement(startRecordingButton);
}
//ui recording
export const resetRecordingButtons = () => {
    const startRecordingButton = document.getElementById(
      "start_recording_button"
    );
    const recordingButtons = document.getElementById("video_recording_buttons");
  
    hideElement(recordingButtons);
    showElement(startRecordingButton);
}
//ui recording
export const switchRecordingButtons = (switchForResumeButton = false) => {
    const resumeButton = document.getElementById("resume_recording_button");
    const pauseButton = document.getElementById("pause_recording_button");
  
    if (switchForResumeButton) {
      hideElement(pauseButton);
      showElement(resumeButton);
    } else {
      hideElement(resumeButton);
      showElement(pauseButton);
    }
}

// ui after hanged up
export const updateUIAfterHangUp = (callType) => {
  enableDashboard();
  
  // hide the call buttons
  if (
    callType === constants.callType.VIDEO_PERSONAL_CODE ||
    callType === constants.callType.VIDEO_STRANGER
  ) {
    const callButtons = document.getElementById("call_buttons");
    hideElement(callButtons);
  } else {
    const chatCallButtons = document.getElementById(
      "finish_chat_button_container"
    );
    hideElement(chatCallButtons);
  }
  
  const newMessageInput = document.getElementById("new_message");
  hideElement(newMessageInput);
  //clearMessenger();
  
  updateMicButton(false);
  updateCameraButton(false);
  
  //hide remote video and show placeholder
  const remoteVideo = document.getElementById("remote_video_container");
  hideElement(remoteVideo);

  //const placeholder = document.getElementById("video_placeholder");
  //showElement(placeholder);

  removeAllDialogs();
}

// changing status of checkbox
export const updateStrangerCheckbox = (allowConnections) => {
  const checkboxCheckImg = document.getElementById('allow_strangers_checkbox_image');
  allowConnections ? showElement(checkboxCheckImg) : hideElement(checkboxCheckImg);
}

// ui helper functions

//fuction show backgroud disable the popup
const enableDashboard = () => {
  const dashboardBlocker = document.getElementById("dashboard_blur");
  if (!dashboardBlocker.classList.contains("display_none")) {
    dashboardBlocker.classList.add("display_none");
  }
}

//function remove backgroud desable the popup
const disableDashboard = () => {
    const dashboardBlocker = document.getElementById("dashboard_blur");
    if (dashboardBlocker.classList.contains("display_none")) {
      dashboardBlocker.classList.remove("display_none");
    }
}

//function hide buttons
const hideElement = (element) => {
    if (!element.classList.contains("display_none")) {
      element.classList.add("display_none");
    }
}

//function show buttons
const showElement = (element) => {
    if (element.classList.contains("display_none")) {
      element.classList.remove("display_none");
    }
}

//changer class video local and remote
export const changerVideoLocal = () => {

    //get element by id
    let localVideoContainer = document.getElementById("local_video_container");
    let localVideo = document.getElementById("local_video");
  
    let remoteVideoContainer = document.getElementById('remote_video_container');
    let remoteVideo = document.getElementById('remote_video');
  
    //get Attribute Classes Name
    let getlocalVideoContainer = localVideoContainer.getAttribute("class");
    let getlocalVideo = localVideo.getAttribute("class");
  
    let getRemoteVideoContainer = remoteVideoContainer.getAttribute("class");
    let getRemoteVideo = remoteVideo.getAttribute("class");
  
    if(getlocalVideoContainer === "local_video_container" && getlocalVideo === "local_video"){
  
      //remove and add class name / changer classes - local_video_container to remote_video_container
      localVideoContainer.classList.remove(getlocalVideoContainer);
      localVideoContainer.classList.add("remote_video_container");
      
      //remove and add class name / changer classes - local_video to remote_video
      localVideo.classList.remove(getlocalVideo);
      localVideo.classList.add("remote_video");
  
      //remove and add class name / changer classes - remote_video_container to local_video_container
      remoteVideoContainer.classList.remove(getRemoteVideoContainer);
      remoteVideoContainer.classList.add("local_video_container");
  
      //remove and add class name / changer classes - remote_video to local_video
      remoteVideo.classList.remove(getRemoteVideo);
      remoteVideo.classList.add("local_video");
    }else{
      //remove and add class name / changer classes - local_video_container to remote_video_container
      localVideoContainer.classList.remove(getlocalVideoContainer);
      localVideoContainer.classList.add("local_video_container");
      
      //remove and add class name / changer classes - local_video to remote_video
      localVideo.classList.remove(getlocalVideo);
      localVideo.classList.add("local_video");
  
      //remove and add class name / changer classes - remote_video_container to local_video_container
      remoteVideoContainer.classList.remove(getRemoteVideoContainer);
      remoteVideoContainer.classList.add("remote_video_container");
  
      //remove and add class name / changer classes - remote_video to local_video
      remoteVideo.classList.remove(getRemoteVideo);
      remoteVideo.classList.add("remote_video");
    }
}