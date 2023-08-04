const express = require('express');
const controller = require('../controllers/controller');

const router = express.Router();

router.get('/', (req, res) => {
    res.send('Hello World!');
});

router.get('/courses', controller.getCourses);
router.get('/courses/:id', controller.getCourse);

router.get('/posts/:year/:month', (req, res) => {
    res.send(req.params);
});

module.exports = router;
