const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');


// @desc    Get all unique conversations for the current user
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find people the user has messaged or been messaged by
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort('-createdAt');

    const participants = new Set();
    messages.forEach(m => {
      participants.add(m.senderId.toString());
      participants.add(m.receiverId.toString());
    });
    participants.delete(userId.toString());

    const conversationList = await Promise.all(
      Array.from(participants).map(async (pId) => {
        const contact = await User.findById(pId).select('fname lname avatar role');
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: userId, receiverId: pId },
            { senderId: pId, receiverId: userId }
          ]
        }).sort('-createdAt');

        return {
          contact,
          lastMessage,
          unreadCount: await Message.countDocuments({
            senderId: pId,
            receiverId: userId,
            read: false
          })
        };
      })
    );

    res.json(conversationList.sort((a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get message history between current user and another user
// @route   GET /api/messages/:receiverId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { receiverId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId },
        { senderId: receiverId, receiverId: userId }
      ]
    }).sort('createdAt');

    // Mark as read
    await Message.updateMany(
      { senderId: receiverId, receiverId: userId, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;

    const message = await Message.create({
      senderId,
      receiverId,
      content
    });

    // Create Notification for Receiver
    await Notification.create({
      userId: receiverId,
      subject: 'New Message Received',
      message: `${req.user.fname} ${req.user.lname} sent you a new message.`,
      sender: 'TalentFlow Messenger'
    });

    res.status(201).json(message);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
