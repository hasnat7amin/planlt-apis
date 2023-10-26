/* The above code is a JavaScript module that handles the chatting functionality of the Planit app
using Socket.IO. It exports a function that takes in an instance of Socket.IO and sets up event
listeners for various socket events. */
const Users = require("../models/Users");
const Event = require("../models/Event");
const Chat = require("../models/Chat");
const firebase = require("../firebase");

function getMessageTypeText(messageType) {
  switch (messageType) {
    case "text":
      return "Message";
    case "image":
      return "Image";
    case "file":
      return "File";
    case "emoji":
      return "Emoji";
    case "audio":
      return "Audio";
    case "document":
      return "Document";
    default:
      return "Message";
  }
}

module.exports = async (io) => {
  io.on("connection", (socket) => {
    console.log("socket connected " + socket.id);
    if (socket != null) {
      // welcome message
      socket.emit(
        "welcome",
        "Welcome to the chatting functionality of the Planit app"
      );

      // requesting userId
      io.to(socket.id).emit("userId", "Send your userId");

      socket.on("receive-userId", async (userId) => {
        try {
          let user = await Users.findById(userId);
          if (!user) {
            io.to(socket.id).emit(
              "invalid-user",
              "User not found with that id."
            );
            return;
          }

          user.socketId = socket.id;
          user.isOnline = true;
          await user.save();

          if (user.role == "admin") {
            const events = await Event.find({ userId: userId });

            let checkSenderChat = await Chat.findOne({
              sender: userId
            });

            if (!checkSenderChat) {
              checkSenderChat = await Chat.create({
                sender: userId,
                chats:[]
              });
            }

            for (const event of events) {
              const delegateIds = event.delegates.map((delegate) =>
                delegate.toString()
              );

            
              if (checkSenderChat) {
                const receiversToAdd = delegateIds.filter((delegateId) => {
                  // Check if the delegate ID is not in any chat's receiver
                  let chatFound = false;
                  checkSenderChat.chats.map((chat) => {
                    if (chat.receiver.toString() == delegateId) {
                      chatFound = true;
                    }
                  });
                  if(!chatFound){
                    return delegateId
                  };
                });
                console.log(receiversToAdd)
                // Add new receivers to the chat
                for (const receiverId of receiversToAdd) {
                  checkSenderChat.chats.push({ receiver: receiverId, messages: [] });
                }

                await checkSenderChat.save();
              }
            }

            io.to(socket.id).emit("userId", user._id);
            console.log("User " + socket.id + " is connected.");

           
          }
          if (user.role === "delegate") {
            // Find all events where the user is a delegate
            const events = await Event.find({ delegates: userId });
            let chat = await Chat.findOne({ sender: userId });

            if (!chat) {
              // Create a new chat if it doesn't exist
              chat = new Chat({ sender: userId, chats: [] });
            }

            for (const event of events) {
              // Add event admin to the list of receivers
              const receiver = event.userId.toString();

              // Add receivers who are not already in the chat

              const receiverInChat = chat.chats.some(
                (chat) => chat.receiver.toString() === receiver
              );

              if (!receiverInChat) {
                // Add the receiver to the chat if not already present
                chat.chats.push({ receiver: receiver, messages: [] });
              }
            }
            await chat.save();

           
          }
          const chats = await Chat.findOne({ sender: userId }).populate({
            path: "chats.receiver",
            select: "-password"
          });
          let allchats = [];
          let suser = {};
          if (chats) {
            for (let chat of chats.chats) {
              const unreadMessages = chat.messages.filter((m) => !m.seen);
              allchats.push({
                receiver: chat.receiver,
                unreadMessages: unreadMessages.length,
                lastMessage:
                  chat.messages.length > 0
                    ? chat.messages[chat.messages.length - 1]
                    : "Send a new message"
              });
            }
            suser = await Users.findById(chats.sender).select("-password");
          }

          socket.emit("receive-all-chats", { user: suser, chat: allchats });

          

        } catch (error) {
          console.error("Error in receive-userId:", error);
        }
      });

      // get the chats of event delegates
      socket.on("get-event-chats", async (userId, eventId) => {
        // Find the user
        const user = await Users.findOne({ _id: userId });
        if (!user) {
          io.to(socket.id).emit("invalid-user", "User not found with that id.");
          return;
        }

        user.socketId = socket.id;
        user.isOnline = true;
        await user.save();

        // Find the event with delegates
        const event = await Event.findOne({ _id: eventId }).populate(
          "delegates"
        );
        if (!event) {
          io.to(socket.id).emit(
            "invalid-event",
            "Event not found with that id."
          );
          return;
        }

        // Initialize an array to store delegate chat details
        const delegateChats = [];

        // Iterate over each delegate and get their chat details
        for (const delegate of event.delegates) {
          let chat = await Chat.findOne({
            sender: userId,
            "chats.receiver": delegate
          });

          // If no chat exists, create a new chat for the delegate
          if (!chat) {
            chat = new Chat({
              sender: userId,
              chats: [{ receiver: delegate, messages: [] }]
            });
            await chat.save();
          }

          // Calculate unread messages and last message details
          const receiverChat = chat.chats.find((c) =>
            c.receiver.equals(delegate._id)
          );
          const unreadMessages = receiverChat.messages.filter((m) => !m.read);
          const lastMessage =
            receiverChat.messages.length > 0
              ? receiverChat.messages[receiverChat.messages.length - 1]
              : {
                  messageType: "text",
                  messageContent: "Send a new message"
                };

          // Add delegate chat details to the array
          delegateChats.push({
            receiver: delegate,
            unreadMessages: unreadMessages.length,
            lastMessage
          });
        }

        // Emit the delegate chat details to the user
        socket.emit("event-chats", { delegateChats });
      });

      // Update message status to 'delivered' when receiver acknowledges it
      socket.on(
        "message-acknowledged",
        async ({ sender, receiver, messageIndex }) => {
          try {
            const receiverChat = await Chat.findOne({ sender: sender });
            if (receiverChat) {
              const message = receiverChat.chats.find((chat) =>
                chat.receiver.equals(receiver)
              ).messages[messageIndex];
              if (message && message.delivered == false) {
                message.delivered = true;
                await receiverChat.save();
                console.log("Message status updated to 'delivered'.");
              }
            }
            socket.emit(
              "message-acknowledged",
              "your message status is updated"
            );
          } catch (error) {
            console.error("Error updating message status:", error);
          }
        }
      );

      // send message to other user
      socket.on("send-message", async (options) => {
        const { sender, receiver, message, messageType } = options;
        console.log(sender, receiver, message, messageType);

        const messageObject = {
          messageType: messageType,
          messageContent: message,
          userType: "sender",
          delivered: false, // Set delivered to false when sending a message
          seen: false, // Set seen to false when sending a message
          time: Date.now()
        };

        // Handle the sender's side of the chat
        let senderChat = await Chat.findOne({ sender: sender });

        if (senderChat === null) {
          senderChat = await Chat.create({
            sender,
            chats: [
              {
                receiver,
                messages: [messageObject]
              }
            ]
          });
        } else {
          const receiverInChat = senderChat.chats.some((chat) =>
            chat.receiver.equals(receiver)
          );

          if (receiverInChat) {
            const messageIndex =
              senderChat.chats
                .find((chat) => chat.receiver.equals(receiver))
                .messages.push(messageObject) - 1;

            // Emit the message index for the receiver to acknowledge it
            socket.emit("message-index", { sender, receiver, messageIndex });
          } else {
            senderChat.chats.push({
              receiver,
              messages: [messageObject]
            });
          }

          await senderChat.save();
          socket.emit("message-saved", "Message saved successfully.");
        }

        // Handle the receiver's side of the chat
        let receiverChat = await Chat.findOne({ sender: receiver });

        if (receiverChat === null) {
          receiverChat = await Chat.create({
            sender: receiver,
            chats: [
              {
                receiver: sender,
                messages: [
                  {
                    messageType: messageType,
                    messageContent: message,
                    userType: "receiver",
                    delivered: false, // Set delivered to false when sending a message
                    seen: false, // Set seen to false when sending a message
                    time: Date.now()
                  }
                ]
              }
            ]
          });
        } else {
          const senderInChat = receiverChat.chats.some((chat) =>
            chat.receiver.equals(sender)
          );

          if (senderInChat) {
            receiverChat.chats
              .find((chat) => chat.receiver.equals(sender))
              .messages.push(  {
                messageType: messageType,
                messageContent: message,
                userType: "receiver",
                delivered: false, // Set delivered to false when sending a message
                seen: false, // Set seen to false when sending a message
                time: Date.now()
              });
          } else {
            receiverChat.chats.push({
              receiver: sender,
              messages: [  {
                messageType: messageType,
                messageContent: message,
                userType: "receiver",
                delivered: false, // Set delivered to false when sending a message
                seen: false, // Set seen to false when sending a message
                time: Date.now()
              }]
            });
          }

          await receiverChat.save();
          socket.emit("message-sent", "Message successfully sent to receiver");
          socket.emit(
            "receiver-profile",
            await Users.findById(receiver).select(
              "username profileImage isOnline lastOnline"
            )
          );
        }

        let receiverUser = await Users.findOne({ _id: receiver });
        if (receiverUser.socketId) {
          io.to(receiverUser.socketId).emit("new-message-received", {
            sender: await Users.findById(sender).select(
              "username profileImage"
            ),
            message
          });
        }

        // Check if the receiver has an FCM token
        if (receiverUser.fcmToken) {
          const messageTypeText = getMessageTypeText(messageType);
          // Create a payload for the Firebase push notification

          let notificationMessagePayload;

          if (receiverUser.image) {
            notificationMessagePayload = {
              notification: {
                title: senderName,
                body:
                  messageType === "text"
                    ? message
                    : `Sent an ${messageTypeText}`,
                image: receiverUser.image // Add the image URL here
              },
              token: receiverUser.fcmToken
            };
          } else {
            notificationMessagePayload = {
              notification: {
                title: senderName,
                body:
                  messageType === "text"
                    ? message
                    : `Sent an ${messageTypeText}`
              },
              token: receiverUser.fcmToken
            };
          }

          try {
            // Send the Firebase push notification
            await firebase.messaging().send(notificationMessagePayload);
            console.log("Firebase push notification sent to receiver.");
          } catch (error) {
            console.error("Error sending Firebase push notification:", error);
          }
        }
      });

      // get user specific chat information
      socket.on("get-user-chat", async (options) => {
        // sender
        let chats = await Chat.findOne({
          sender: options.sender,
          "chats.receiver": options.receiver
        });
        console.log(chats);
        if (chats == null) {
          socket.emit("receive-user-chat", { receiver: {}, messages: [] });
        } else {
          let receiver_chat = chats.chats.find((c) => {
            if (c.receiver.toString() === options.receiver) {
              // Update message status to 'seen' when receiver views the message
              c.messages.forEach((message) => {
                if (!message.seen && !message.userType == "sender") {
                  message.seen = true;
                  message.delivered = true;
                }
              });
              return c;
            }
          });

          await chats.save();

          const result = {
            receiver: await Users.findOne({
              _id: receiver_chat.receiver
            }).select("-password"),
            messages: receiver_chat.messages
          };
          socket.emit("receive-user-chat", result);
        }
        // reciever
        let rchats = await Chat.findOne({
          sender: options.receiver,
          "chats.receiver": options.sender
        });
        console.log(rchats);
        if (chats == null) {
          // socket.emit("receive-user-chat", { receiver: {}, messages: [] });
        } else {
          let receiver_chat = rchats.chats.find((c) => {
            if (c.receiver.toString() === options.receiver) {
              // Update message status to 'seen' when receiver views the message
              c.messages.forEach((message) => {
                if (!message.seen && message.userType == "sender") {
                  message.seen = true;
                  message.delivered = true;
                }
              });
              return c;
            }
          });

          await chats.save();
        }
      });

      // get user all chats
      socket.on("get-all-chats", async (senderId) => {
        const chats = await Chat.findOne({ sender: senderId }).populate({
          path: "chats.receiver",
          select: "-password"
        });
        let allchats = [];
        let suser = {};
        if (chats != null) {
          for (let chat of chats.chats) {
            const unreadMessages = chat.messages.filter((m) => !m.read);
            allchats.push({
              receiver: chat.receiver,
              unreadMessages: unreadMessages.length,
              lastMessage: chat.messages[chat.messages.length - 1]
            });
          }
          suser = await Users.findById(chats.sender).select(
            "username prfileImage isOnline lastOnline"
          );
        }

        socket.emit("receive-all-chats", { user: suser, chat: allchats });
      });

      // disconnect user
      socket.on("disconnect", async () => {
        let user = await Users.findOne({ socketId: socket.id });
        if (user) {
          user.isOnline = false;
          user.lastOnline = Date.now();
          user.socketId = null;
          await user.save();
        }
        console.log("User " + socket.id + " is disconnected.");
      });
    }
  });
};
