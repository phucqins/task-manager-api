const express = require("express");
const userRouter = require("./routes/userRouter");
const taskRouter = require("./routes/taskRouter");
//this is not for graping anything from moongoose. This guarantee that moongoose will always run and connect to the database
require("./db/mongoose");

const app = express();

const port = process.env.PORT;

//import express middleware
// app.use((req, res, next) => {
//   res.status(503).send("Updating server");
// });

//comfig express to use json
app.use(express.json());
//config express to use external routes
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log("Server started at " + port);
});

// const Task = require("./models/task");
// const User = require("./models/user");

// const main = async () => {
//   ////  this to find the owner by the task

//   // const task = await Task.findById("61e97e379027c0dc02123126");
//   // await task.populate("owner");
//   // console.log(task.owner);

//   //// this to find the tasks create by the owner
//   const user = await User.findById("61e97db49027c0dc0212311a");
//   await user.populate("tasks");
//   console.log(user.tasks);
// };

// main();
