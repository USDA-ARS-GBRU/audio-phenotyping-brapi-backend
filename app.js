const express = require('express');
// const bodyParser = require('body-parser');

const router = require('./routes/routes');
const brapiRouter = require('./routes/brapiRoutes');

const app = express();

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(express.raw({ type: '*/*', limit: '50mb' }));
app.use('/api', router);
app.use('/brapi/v2', brapiRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});
