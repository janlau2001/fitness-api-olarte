const mongoose = require("mongoose");
const Workout = require("../models/Workout");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

module.exports.addWorkout = async (req, res) => {
  try {
    const { name, duration } = req.body;

    if (!name || !duration) {
      return res.status(400).send({ error: "Name and duration are required" });
    }

    const newWorkout = new Workout({
      name,
      duration,
      userId: req.user.id,
    });

    const savedWorkout = await newWorkout.save();
    return res.status(201).send(savedWorkout);
  } catch (err) {
    console.error("Error in adding workout:", err);
    return res.status(500).send({ error: "Failed to save the workout" });
  }
};

module.exports.getMyWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.user.id });
    return res.status(200).send({ workouts });
  } catch (err) {
    console.error("Error in fetching workouts:", err);
    return res.status(500).send({ error: "Failed to fetch workouts" });
  }
};

module.exports.updateWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).send({ error: "Invalid workout id" });
    }

    // Only these fields can be edited; id, userId and dateAdded stay untouched
    const updates = {};
    for (const field of ["name", "duration", "status"]) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).send({ error: "Nothing to update" });
    }

    const updatedWorkout = await Workout.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      updates,
      { returnDocument: "after" },
    );

    if (!updatedWorkout) {
      return res.status(404).send({ error: "Workout not found" });
    }

    return res.status(200).send({
      message: "Workout updated successfully",
      updatedWorkout,
    });
  } catch (err) {
    console.error("Error in updating workout:", err);
    return res.status(500).send({ error: "Failed to update workout" });
  }
};

module.exports.deleteWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).send({ error: "Invalid workout id" });
    }

    const deletedWorkout = await Workout.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!deletedWorkout) {
      return res.status(404).send({ error: "Workout not found" });
    }

    return res.status(200).send({ message: "Workout deleted successfully" });
  } catch (err) {
    console.error("Error in deleting workout:", err);
    return res.status(500).send({ error: "Failed to delete workout" });
  }
};

module.exports.completeWorkoutStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).send({ error: "Invalid workout id" });
    }

    const updatedWorkout = await Workout.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { status: "completed" },
      { returnDocument: "after" },
    );

    if (!updatedWorkout) {
      return res.status(404).send({ error: "Workout not found" });
    }

    return res.status(200).send({
      message: "Workout status updated successfully",
      updatedWorkout,
    });
  } catch (err) {
    console.error("Error in completing workout:", err);
    return res.status(500).send({ error: "Failed to update workout status" });
  }
};
