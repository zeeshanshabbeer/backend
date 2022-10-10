const express = require("express");
const router = express.Router();
const S_authController = require("../Controllers/S_authController");
const BA_authController = require("../Controllers/BA_authController");
const ChatBoxController = require("../Controllers/ChatBoxController");
//student create chat
router.post(
  "/CreateChat",
  S_authController.protect,
  ChatBoxController.createchat
);
//student send message with in subject
router.post(
  "/S_SendMessage/:subject/:message",
  S_authController.protect,
  ChatBoxController.S_sendmessage
);
//student view message
router.get(
  "/S_ViewMessage",
  S_authController.protect,
  ChatBoxController.S_viewmessage
);
//student view specific message
router.get(
  "/S_ViewMessage/:subject",
  S_authController.protect,
  ChatBoxController.S_ViewSpecificMessage
);
//student delete message chatbox
router.delete(
  "/S_DeleteChat/:subject",
  S_authController.protect,
  ChatBoxController.S_deleteChat
);
//batch advisor view all the message
router.get(
  "/BA_ViewMessage",
  BA_authController.protect,
  ChatBoxController.BA_viewmessages
);
//batch advisor view specific message
router.get(
  "/BA_ViewMessages/:registrationId/:subject",
  BA_authController.protect,
  ChatBoxController.BA_ViewSpecificMessages
);
//batch advisor reply student message
router.post(
  "/BA_MessageReply/:registrationId/:subject/:message",
  BA_authController.protect,
  ChatBoxController.BA_messageReply
);
// batch advisor delete chat
router.delete(
  "/BA_DeleteChat/:registrationId/:subject",
  BA_authController.protect,
  ChatBoxController.BA_deleteChat
);

module.exports = router;
