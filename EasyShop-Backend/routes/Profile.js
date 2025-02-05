const express = require("express");
const fs = require("fs");
const multer = require("multer");
const { random } = require("lodash");
const router = express.Router();

const { Users } = require("../models/Users");

fs.mkdir("./uploads/Users/", { recursive: true }, (err) => {});

const upload = multer({ storage: multer.memoryStorage() });

router.post("/EditProfile", async (req, res) => {
  try {
    const user = await Users.findById(req.body._id);
    if (!user) return res.status(500).send("Invalid User ID");

    Users.findOneAndUpdate(
      { _id: req.body._id },
      { $set: req.body.Edit },
      { useFindAndModify: false },
      async function (err, doc) {
        if (err) {
          res.status(500).send("Email/Phone already exists.");
        } else {
          res.send({ Result: "Done" });
        }
      }
    );
  } catch (error) {
    res.status(500).send("Error");
  }
});

router.post("/ChangeDP", upload.single("ProfilePicture"), async (req, res) => {
  try {
    const user = await Users.findById(req.body._id);
    if (!user) return res.status(500).send("Invalid User ID");

    const DirName = `./uploads/Users/${user._id}/ProfilePicture`;
    const FileName =
      user.Name.slice(0, 4) +
      "_" +
      user.Email.slice(0, 4) +
      "_" +
      random(999999).toString() +
      "." +
      req.file.originalname.split(".").pop();
    const URL = `${DirName}/${FileName}`;
    const OldPic = "." + user.ProfilePicture;

    fs.mkdir(DirName, { recursive: true }, async (err) => {
      if (err) {
        return res.status(500).send("Some Error");
      } else {
        fs.writeFile(URL, req.file.buffer, "ascii", function (err) {
          if (err) {
            return res.status(500).send("Some Error");
          } else {
            Users.findOneAndUpdate(
              { _id: req.body._id },
              {
                $set: { ProfilePicture: URL.slice(1) },
              },
              { useFindAndModify: false },
              async function (err) {
                if (err) {
                  res.status(500).send("Error in Updating Profile Picture");
                } else {
                  res.send({ Result: "Done" });
                  fs.unlink(OldPic, function (err) {});
                }
              }
            );
          }
        });
      }
    });
  } catch (error) {
    res.status(500).send("Error");
  }
});

module.exports = router;
