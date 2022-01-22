const User = require("../models/user");
const express = require("express");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const userRouter = new express.Router();

//get all user
userRouter.get("/users/me", auth, async (req, res) => {
  try {
    res.send({ user: req.user });
  } catch (err) {
    res.status(404).send(err);
  }
});

//get user by ID
// userRouter.get("/users/:id", async (req, res) => {
//   const _id = req.params.id;
//   try {
//     const user = await User.findOne({ _id });
//     if (!user) {
//       return res.status(404);
//     }
//     res.send(user);
//   } catch (err) {
//     res.status(404).send(err);
//   }
// });

//create new user
userRouter.post("/users", async (req, res) => {
  try {
    const user = await new User(req.body).save();
    const token = await user.generateAuthToken();
    console.log(token);
    res.status(201).send({ user, token });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

//user login
userRouter.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

//user logout
userRouter.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token !== req.token;
    });

    req.user.save();

    res.send();
  } catch (err) {
    res.status(500).send();
  }
});

//user wipe all tokens
userRouter.post("/users/logoutall", auth, async (req, res) => {
  try {
    req.user.tokens = [];

    req.user.save();

    res.send();
  } catch (err) {
    res.status(500).send();
  }
});

//update user by ID
userRouter.patch("/users/me", auth, async (req, res) => {
  try {
    const updateField = Object.keys(req.body);
    const allowedUpdate = ["name", "email", "password", "age"];
    const isValidUpdate = updateField.every((update) =>
      allowedUpdate.includes(update)
    );

    if (!isValidUpdate) {
      throw new Error("Invalid update field");
    }

    updateField.forEach((update) => (req.user[update] = req.body[update]));

    req.user.save();

    //this is commented because findbyidandupdate method pass the middleware, it modifies the database directly
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    // console.log(user);

    // if (!user) {
    //   throw new Error("User not found");
    // }

    res.send(req.user);
  } catch (err) {
    res.status(404).send(err.message);
  }
});

//delete user
userRouter.delete("/users/me", auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user.id);
    // if (!user) {
    //   return res.status(404).send();
    // }

    req.user.remove();

    res.send(req.user);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

//uploading user avatar
const upload = multer({
  // dest: "avatars",
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, callback) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      callback(new Error("Invalid File Type !"));
    }
    callback(undefined, true);
  },
});
// console.log(Object.getPrototypeOf(upload));
userRouter.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send(error.message);
  }
);

//serve user profile with url
userRouter.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.setHeader("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (err) {
    res.status(404).send(err.message);
  }
});

//delete user avatar
userRouter.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

module.exports = userRouter;
