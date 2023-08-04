const express = require('express');

const multer = require('multer');

// const storage = multer.diskStorage({
//     filename: function (req, file, cb) {
//         cb(null, file.originalname);
//     },
//     destination: function (req, file, cb) {
//         cb(null, './uploads');
//     },
// });
const storage = multer.memoryStorage();
const upload = multer({ storage });

const brapiController = require('../controllers/brapiController');

const router = express.Router();

router.get('/serverinfo', brapiController.serverInfo);

router.post('/images', brapiController.createImage);
router.put('/images/:imageDbId', brapiController.imagesImageDbIdPUT);
router.put(
    '/images/:imageDbId/imageContent',
    upload.any('audio'),
    brapiController.imageContentPUT
);
module.exports = router;
