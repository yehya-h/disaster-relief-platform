const multer = require('multer');
const storage = multer.memoryStorage(); // use RAM
// const storage = multer.diskStorage({
//     destination: 'uploads/',
//     filename: (req, file, cb) => {
//       cb(null, Date.now() + '-' + file.originalname);
//     },
// });
const upload = multer({ storage });
module.exports = upload;
