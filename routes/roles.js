var express = require('express');
var router = express.Router();
let modelRole = require('../schemas/roles');

// GET all roles (không lấy role đã xóa mềm)
// localhost:3000/api/v1/roles
router.get('/', async function(req, res, next) {
  try {
    let data = await modelRole.find({ isDeleted: false });
    res.send(data);
  } catch (error) {
    res.status(500).send({
      message: "Error fetching roles",
      error: error.message
    });
  }
});

// GET role by ID
// localhost:3000/api/v1/roles/:id
router.get('/:id', async function(req, res, next) {
  try {
    let id = req.params.id;
    let result = await modelRole.findById(id);
    if (result && !result.isDeleted) {
      res.send(result);
    } else {
      res.status(404).send({
        message: "Role not found"
      });
    }
  } catch (error) {
    res.status(404).send({
      message: "Role not found"
    });
  }
});

// CREATE new role
router.post('/', async function(req, res, next) {
  try {
    if (!req.body.name) {
      return res.status(400).send({
        message: "Name is required"
      });
    }

    let newRole = new modelRole({
      name: req.body.name,
      description: req.body.description || ""
    });
    
    await newRole.save();
    res.send(newRole);
  } catch (error) {
    res.status(500).send({
      message: "Error creating role",
      error: error.message
    });
  }
});

// UPDATE role
router.put('/:id', async function(req, res, next) {
  try {
    let id = req.params.id;
    let result = await modelRole.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true }
    );
    
    if (result) {
      res.send(result);
    } else {
      res.status(404).send({
        message: "Role not found"
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Error updating role",
      error: error.message
    });
  }
});

// DELETE (soft delete) role
router.delete('/:id', async function(req, res, next) {
  try {
    let id = req.params.id;
    let result = await modelRole.findByIdAndUpdate(
      id, 
      { isDeleted: true }, 
      { new: true }
    );
    
    if (result) {
      res.send(result);
    } else {
      res.status(404).send({
        message: "Role not found"
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Error deleting role",
      error: error.message
    });
  }
});

module.exports = router;
