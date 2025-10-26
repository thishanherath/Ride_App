const asyncHandler = require("express-async-handler");
const feedbackModel = require("../models/feedback.model");
const { validationResult } = require("express-validator");

// Submit feedback
module.exports.submitFeedback = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const {
    type,
    category,
    priority,
    subject,
    description,
    rideId,
    attachments,
    isAnonymous
  } = req.body;

  const userId = req.user._id;

  try {
    const feedback = await feedbackModel.create({
      user: userId,
      type,
      category,
      priority,
      subject,
      description,
      ride: rideId,
      attachments,
      isAnonymous
    });

    res.status(201).json({
      message: "Feedback submitted successfully",
      feedback: {
        _id: feedback._id,
        type: feedback.type,
        category: feedback.category,
        priority: feedback.priority,
        subject: feedback.subject,
        status: feedback.status,
        createdAt: feedback.createdAt
      }
    });

  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ message: "Error submitting feedback" });
  }
});

// Get user's feedback history
module.exports.getUserFeedback = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, type } = req.query;
  const userId = req.user._id;

  try {
    const skip = (page - 1) * limit;
    let query = { user: userId };

    if (status) query.status = status;
    if (type) query.type = type;

    const feedback = await feedbackModel
      .find(query)
      .populate("ride", "pickup destination fare createdAt")
      .populate("assignedTo", "fullname email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await feedbackModel.countDocuments(query);

    res.status(200).json({
      feedback,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: "Error fetching feedback" });
  }
});

// Get specific feedback
module.exports.getFeedbackById = asyncHandler(async (req, res) => {
  const { feedbackId } = req.params;
  const userId = req.user._id;

  try {
    const feedback = await feedbackModel
      .findOne({
        _id: feedbackId,
        user: userId
      })
      .populate("ride", "pickup destination fare createdAt")
      .populate("assignedTo", "fullname email");

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(200).json({ feedback });

  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: "Error fetching feedback" });
  }
});

// Update feedback
module.exports.updateFeedback = asyncHandler(async (req, res) => {
  const { feedbackId } = req.params;
  const { subject, description, type, category, priority } = req.body;
  const userId = req.user._id;

  try {
    const feedback = await feedbackModel.findOne({
      _id: feedbackId,
      user: userId,
      status: { $in: ["open", "in_progress"] }
    });

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found or cannot be updated" });
    }

    const updatedFeedback = await feedbackModel.findByIdAndUpdate(
      feedbackId,
      {
        subject,
        description,
        type,
        category,
        priority
      },
      { new: true }
    ).populate("ride", "pickup destination fare createdAt")
     .populate("assignedTo", "fullname email");

    res.status(200).json({
      message: "Feedback updated successfully",
      feedback: updatedFeedback
    });

  } catch (error) {
    console.error("Error updating feedback:", error);
    res.status(500).json({ message: "Error updating feedback" });
  }
});

// Rate feedback response
module.exports.rateFeedbackResponse = asyncHandler(async (req, res) => {
  const { feedbackId } = req.params;
  const { userSatisfaction } = req.body;
  const userId = req.user._id;

  try {
    const feedback = await feedbackModel.findOne({
      _id: feedbackId,
      user: userId
    });

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    await feedbackModel.findByIdAndUpdate(feedbackId, {
      userSatisfaction
    });

    res.status(200).json({ message: "Feedback response rated successfully" });

  } catch (error) {
    console.error("Error rating feedback response:", error);
    res.status(500).json({ message: "Error rating feedback response" });
  }
});

// Admin: Get all feedback
module.exports.getAllFeedback = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    type,
    category,
    priority,
    assignedTo,
    search
  } = req.query;

  try {
    const skip = (page - 1) * limit;
    let query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const feedback = await feedbackModel
      .find(query)
      .populate("user", "fullname email phone")
      .populate("ride", "pickup destination fare createdAt")
      .populate("assignedTo", "fullname email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await feedbackModel.countDocuments(query);

    res.status(200).json({
      feedback,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: "Error fetching feedback" });
  }
});

// Admin: Get feedback statistics
module.exports.getFeedbackStats = asyncHandler(async (req, res) => {
  const { dateFrom, dateTo } = req.query;

  try {
    const stats = await feedbackModel.getFeedbackStats(dateFrom, dateTo);

    res.status(200).json(stats);

  } catch (error) {
    console.error("Error fetching feedback stats:", error);
    res.status(500).json({ message: "Error fetching feedback statistics" });
  }
});

// Admin: Update feedback status
module.exports.updateFeedbackStatus = asyncHandler(async (req, res) => {
  const { feedbackId } = req.params;
  const { status, adminResponse, resolution, internalNotes } = req.body;
  const adminId = req.admin._id;

  try {
    const updateData = {
      status,
      internalNotes
    };

    if (adminResponse) {
      updateData.adminResponse = {
        message: adminResponse,
        respondedBy: adminId,
        respondedAt: new Date()
      };
    }

    if (resolution) {
      updateData.resolution = resolution;
      updateData.resolvedAt = new Date();
    }

    if (status === "resolved" || status === "closed") {
      updateData.resolvedAt = new Date();
    }

    const feedback = await feedbackModel.findByIdAndUpdate(
      feedbackId,
      updateData,
      { new: true }
    ).populate("user", "fullname email phone")
     .populate("assignedTo", "fullname email");

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(200).json({
      message: "Feedback status updated successfully",
      feedback
    });

  } catch (error) {
    console.error("Error updating feedback status:", error);
    res.status(500).json({ message: "Error updating feedback status" });
  }
});

// Admin: Assign feedback
module.exports.assignFeedback = asyncHandler(async (req, res) => {
  const { feedbackId } = req.params;
  const { assignedTo } = req.body;

  try {
    const feedback = await feedbackModel.findByIdAndUpdate(
      feedbackId,
      { assignedTo },
      { new: true }
    ).populate("user", "fullname email phone")
     .populate("assignedTo", "fullname email");

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(200).json({
      message: "Feedback assigned successfully",
      feedback
    });

  } catch (error) {
    console.error("Error assigning feedback:", error);
    res.status(500).json({ message: "Error assigning feedback" });
  }
});
