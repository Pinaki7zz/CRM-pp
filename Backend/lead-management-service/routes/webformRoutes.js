const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Save a new webform definition
router.post('/', async (req, res) => {
  try {
    const { name, url, fields } = req.body;
    const webform = await prisma.webform.create({
      data: { name, url, fields }
    });
    res.status(201).json(webform);
  } catch (error) {
    res.status(500).json({ error: "Failed to save webform" });
  }
});

// Get a webform by URL
router.get('/:url', async (req, res) => {
  try {
    const webform = await prisma.webform.findUnique({
      where: { url: req.params.url }
    });
    if (!webform) return res.status(404).json({ error: "Not found" });
    res.json(webform);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch webform" });
  }
});

module.exports = router;