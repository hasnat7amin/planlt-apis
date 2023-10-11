// socket.js

module.exports = async (io) => {

  io.on("connection", (socket) => {
    if (socket != null) {
      // welcome message

      socket.emit(
        "welcome",
        "welcome to chatting functionality of planit app"
      );

      // requesting userId
      io.to(socket.id).emit("userId", "send your userId");

      // when receiving userId
      socket.on("recieve-userId", async (userId) => {
        let user = await User.findOne({ _id: userId });
        if (!user) {
          io.to(socket.id).emit("invalid-user", "user not found with that id.");
        }
        user.socketId = socket.id;
        user.isOnline = true;
        await user.save();
        io.to(socket.id).emit("userId", user._id);
        console.log("user " + socket.id + " is connected.");

        const chats = await Chat.findOne({ sender: userId }).populate({
          path: "chats.receiver",
          select: "username profileImage isOnline lastOnline"
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
          suser = await User.findById(chats.sender).select(
            "username prfileImage isOnline lastOnline"
          );
        }

        socket.emit("recieve-all-chats", { user: suser, allchats });
      });

      // send message to other user
      socket.on("send-message", async (options) => {
        const { sender, receiver, message } = options;
        console.log(sender, receiver, message);
        // for sender
        let schat = await Chat.findOne({ sender: sender });
        console.log(schat);
        if (schat == null) {
          // create new chat for sender
          schat = await Chat.create({
            sender: sender,
            chats: [
              {
                receiver: receiver,
                messages: [
                  {
                    message: message,
                    userType: "sender",
                    time: Date.now(),
                    read: true
                  }
                ]
              }
            ]
          });
        } else {
          // check reciever in schat
          let rfound = false;
          for (let r of schat.chats) {
            if (r.receiver == receiver) {
              rfound = true;
              r.messages.push({
                message: message,
                userType: "sender",
                time: Date.now(),
                read: true
              });
            }
          }
          if (!rfound) {
            schat.chats.push({
              receiver: receiver,
              messages: [
                {
                  message: message,
                  userType: "sender",
                  time: Date.now(),
                  read: true
                }
              ]
            });
          }
          await schat.save();
          socket.emit("message-saved", "message saved successfully.");
        }

        //for reciever
        let rchat = await Chat.findOne({ sender: receiver });
        if (rchat == null) {
          rchat = await Chat.create({
            sender: receiver,
            chats: [
              {
                receiver: sender, 
                messages: [
                  {
                    message: message,
                    userType: "receiver",
                    time: Date.now()
                  }
                ]
              }
            ]
          });
        } else {
          let sfound = false;
          for (let s of rchat.chats) {
            if (s.receiver == sender) {
              sfound = true;
              s.messages.push({
                message: message,
                userType: "receiver",
                time: Date.now()
              });
            }
          }
          if (!sfound) {
            rchat.chats.push({
              receiver: sender,
              messages: [
                {
                  message: message,
                  userType: "receiver",
                  time: Date.now()
                }
              ]
            });
          }
          await rchat.save();
          socket.emit("message-sent", "message successfully sent to receiver");
          socket.emit(
            "receiver-profile",
            await User.findById(receiver).select(
              "username prfileImage isOnline lastOnline"
            )
          );
        }

        let ruser = await User.findOne({ _id: receiver });
        if (ruser.socketId) {
          io.to(ruser.socketId).emit("new-message-received", {
            sender: await User.findById(sender).select("username profileImage"),
            message
          });
        }
      });

      // get user all chats
      socket.on("get-all-chats", async (senderId) => {
        const chats = await Chat.findOne({ sender: senderId }).populate({
          path: "chats.receiver",
          select: "username profileImage isOnline lastOnline"
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
          suser = await User.findById(chats.sender).select(
            "username prfileImage isOnline lastOnline"
          );
        }

        socket.emit("recieve-all-chats", { user: suser, chat: allchats });
      });

      // get user specific chat information
      socket.on("get-user-chat", async (options) => {
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
              c.messages.map((message) => {
                message.read = true;
              });
              return c;
            }
          });

          await chats.save();
          const result = {
            receiver: await User.findOne({
              _id: receiver_chat.receiver
            }).select("username prfileImage isOnline lastOnline"),
            messages: receiver_chat.messages
          };
          socket.emit("receive-user-chat", result);
        }
      });

      // disconnect user
      socket.on("disconnect", async () => {
        let user = await User.findOne({ socketId: socket.id });
        if (user) {
          user.isOnline = false;
          user.lastOnline = Date.now();
          await user.save();
        }
        console.log("user " + socket.id + " is disconnected.");
      });
    }
  });
};

