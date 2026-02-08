const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Save a new webform submission
router.post('/', async (req, res) => {
  try {
    const { webformId, fields } = req.body;
    const submission = await prisma.leadFormSubmission.create({
      data: { webformId, fields }
    });
    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ error: "Failed to save submission" });
  }
});

// Get all submissions (optionally filter by webformId)
router.get('/', async (req, res) => {
  try {
    const { webformId } = req.query;
    const where = webformId ? { webformId: Number(webformId) } : {};
    const submissions = await prisma.leadFormSubmission.findMany({ where });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

module.exports = router;