const multer = require('multer');
const storage = multer.memoryStorage(); // use diskStorage
const upload = multer({ storage });
module.exports = upload;
