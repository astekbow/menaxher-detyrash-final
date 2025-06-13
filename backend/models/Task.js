const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    description: String,
    priority:    { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
    status:      { type: String, enum: ["To Do", "In Progress", "Done"], default: "To Do" },
    deadline:    Date,
    tags:        [String],
    fileUrl:     String,
    user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
