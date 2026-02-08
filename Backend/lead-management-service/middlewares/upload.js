const multer = require("multer");

const storage = multer.memoryStorage(); // or diskStorage later
const upload = multer({ storage });

module.exports = upload;