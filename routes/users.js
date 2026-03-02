var express = require('express');
var router = express.Router();
let modelUser = require('../schemas/users');

// GET all users (không lấy user đã xóa mềm)
// localhost:3000/api/v1/users
router.get('/', async function(req, res, next) {
  try {
    let data = await modelUser.find({ isDeleted: false }).populate('role');
    res.send(data);
  } catch (error) {
    res.status(500).send({
      message: "Error fetching users",
      error: error.message
    });
  }
});

// GET user by ID
// localhost:3000/api/v1/users/:id
router.get('/:id', async function(req, res, next) {
  try {
    let id = req.params.id;
    let result = await modelUser.findById(id).populate('role');
    if (result && !result.isDeleted) {
      res.send(result);
    } else {
      res.status(404).send({
        message: "User not found"
      });
    }
  } catch (error) {
    res.status(404).send({
      message: "User not found"
    });
  }
});

// CREATE new user
router.post('/', async function(req, res, next) {
  try {
    if (!req.body.username || !req.body.password || !req.body.email) {
      return res.status(400).send({
        message: "Username, password, and email are required"
      });
    }

    let newUser = new modelUser({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      fullName: req.body.fullName || "",
      avatarUrl: req.body.avatarUrl || "https://i.sstatic.net/l60Hf.png",
      status: req.body.status || false,
      role: req.body.role,
      loginCount: req.body.loginCount || 0
    });
    
    await newUser.save();
    let result = await modelUser.findById(newUser._id).populate('role');
    res.send(result);
  } catch (error) {
    res.status(500).send({
      message: "Error creating user",
      error: error.message
    });
  }
});

// UPDATE user
router.put('/:id', async function(req, res, next) {
  try {
    let id = req.params.id;
    let result = await modelUser.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true }
    ).populate('role');
    
    if (result) {
      res.send(result);
    } else {
      res.status(404).send({
        message: "User not found"
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Error updating user",
      error: error.message
    });
  }
});

// DELETE (soft delete) user
router.delete('/:id', async function(req, res, next) {
  try {
    let id = req.params.id;
    let result = await modelUser.findByIdAndUpdate(
      id, 
      { isDeleted: true }, 
      { new: true }
    ).populate('role');
    
    if (result) {
      res.send(result);
    } else {
      res.status(404).send({
        message: "User not found"
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Error deleting user",
      error: error.message
    });
  }
});

// ENABLE user account
// localhost:3000/api/v1/users/enable
router.post('/enable', async function(req, res, next) {
  try {
    if (!req.body.email || !req.body.username) {
      return res.status(400).send({
        message: "Email and username are required"
      });
    }

    let user = await modelUser.findOne({
      email: req.body.email,
      username: req.body.username,
      isDeleted: false
    }).populate('role');

    if (user) {
      user.status = true;
      await user.save();
      res.send({
        message: "User account enabled successfully",
        user: user
      });
    } else {
      res.status(404).send({
        message: "User not found or information is incorrect"
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Error enabling user account",
      error: error.message
    });
  }
});

// DISABLE user account
// localhost:3000/api/v1/users/disable
router.post('/disable', async function(req, res, next) {
  try {
    if (!req.body.email || !req.body.username) {
      return res.status(400).send({
        message: "Email and username are required"
      });
    }

    let user = await modelUser.findOne({
      email: req.body.email,
      username: req.body.username,
      isDeleted: false
    }).populate('role');

    if (user) {
      user.status = false;
      await user.save();
      res.send({
        message: "User account disabled successfully",
        user: user
      });
    } else {
      res.status(404).send({
        message: "User not found or information is incorrect"
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Error disabling user account",
      error: error.message
    });
  }
});

module.exports = router;
