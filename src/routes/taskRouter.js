const Task = require("../models/task");
const express = require("express");
const auth = require("../middleware/auth");

const taskRouter = new express.Router();

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sort=createdAt_asc
//get all tasks || get tasks by condition
taskRouter.get("/tasks", auth, async (req, res) => {
  try {
    console.log(!!req.query.sort);
    const match = {};
    const sort = {};

    //take conditions for filtering tasks
    if (req.query.completed) {
      match.completed = req.query.completed === "true";
    }
    //take conditions for sorting task
    if (req.query.sort) {
      const sortQuery = req.query.sort.split("_");

      //property: 1 for ascending, -1 for descending order
      sort[sortQuery[0]] = sortQuery[1] === "asc" ? 1 : -1;
      console.log(sort);
    }

    await req.user.populate({
      path: "tasks",
      //filer tasks by condition
      match,
      options: {
        //set paginations
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        //sorting tasks
        sort,
      },
    });
    res.send(req.user.tasks);
  } catch (err) {
    res.status(404).send(err);
  }
});

//get tasks by ID
taskRouter.get("/tasks/:id", auth, async (req, res) => {
  try {
    const _id = req.params.id;

    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send({});
    }
    res.send(task);
  } catch (err) {
    res.status(404).send(err);
  }
});

//create new task
taskRouter.post("/tasks", auth, async (req, res) => {
  try {
    const task = await new Task({ ...req.body, owner: req.user._id }).save();
    // console.log(Object.getPrototypeOf(task));
    res.send(task);
  } catch (err) {
    res.status(400).send(err);
  }
});

//update task by ID
taskRouter.patch("/tasks/:id", auth, async (req, res) => {
  try {
    const updateField = Object.keys(req.body);
    const allowedUpdate = ["description", "completed"];
    const isValidUpdate = updateField.every((update) =>
      allowedUpdate.includes(update)
    );

    if (!isValidUpdate) {
      throw new Error("Invalid update field");
    }

    const task = await Task.findById({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      throw new Error();
    }

    updateField.forEach((update) => (task[update] = req.body[update]));
    task.save();

    res.send(task);
  } catch (err) {
    res.status(404).send(err.message);
  }
});

//delete task

taskRouter.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

module.exports = taskRouter;
