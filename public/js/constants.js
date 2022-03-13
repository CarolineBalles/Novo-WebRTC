//type chat or video
export const callType = {
    CHAT_PERSONAL_CODE: "CHAT_PERSONAL_CODE",
    CHAT_STRANGER: "CHAT_STRANGER",
    VIDEO_PERSONAL_CODE: "VIDEO_PERSONAL_CODE",
    VIDEO_STRANGER: "VIDEO_STRANGER",
}

//type of popup buttons responses
export const preOfferAnswer = {
    CALLEE_NOT_FOUND: "CALLEE_NOT_FOUND",
    CALL_ACCEPTED: "CALL_ACCEPTED",
    CALL_REJECTED: "CALL_REJECTED",
    CALL_UNAVAILABLE: "CALL_UNAVAILABLE",
}

//connection users to show camera and entrer in chat
export const webRTCSignaling = {
    OFFER: "OFFER",
    ANSWER: "ANSWER",
    ICE_CANDIDATE: "ICE_CANDIDATE",
}

//here not connection quen chat it's active whith one person
export const callState = {
    CALL_AVAILABLE: "CALL_AVAILABLE",
    CALL_UNAVAILABLE: "CALL_UNAVAILABLE",
    CALL_AVAILABLE_ONLY_CHAT: "CALL_AVAILABLE_ONLY_CHAT",
}
  