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

    const conversationList = (await Promise.all(
      Array.from(participants).map(async (pId) => {
        const contact = await User.findById(pId).select('fname lname avatar role');
        if (!contact) return null;

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
    )).filter(Boolean);

    res.json(conversationList.sort((a, b) => {
      const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return timeB - timeA;
    }));
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

// @desc    Get all recent messages for current user
// @route   GET /api/messages
// @access  Private
exports.getAllMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort('-createdAt').limit(50);
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

    const senderName = `${req.user.fname || ''} ${req.user.lname || ''}`.trim() || 'A user';

    // 1. Create In-App Notification for Receiver
    await Notification.create({
      userId: receiverId,
      subject: 'New Message Received',
      message: `${senderName} sent you a new message on TalentFlow.`,
      sender: 'TalentFlow Messenger'
    }).catch(err => console.warn('Message notification error:', err.message));

    // 2. Transactional Email for Receiver
    const emailService = require('../services/emailService');
    const receiver = await User.findById(receiverId);
    if (receiver && receiver.email) {
      if (receiver.role === 'recruiter') {
        emailService.sendNewMessageToRecruiter({
          email: receiver.email,
          recruiterName: receiver.fname || 'Hiring Manager',
          senderName,
          previewText: content,
          messageId: message._id,
          idempotencyKey: `msg_rec_${message._id}`
        }).catch(err => console.warn('Recruiter message email error:', err.message));
      } else {
        emailService.sendNewMessageToCandidate({
          email: receiver.email,
          candidateName: receiver.fname || 'there',
          senderName,
          previewText: content,
          messageId: message._id,
          idempotencyKey: `msg_cand_${message._id}`
        }).catch(err => console.warn('Candidate message email error:', err.message));
      }
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
