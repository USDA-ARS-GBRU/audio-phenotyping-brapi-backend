const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const Image = require('../models/imageModel');
const Audio = require('../models/audioModel');
const { Queue, Worker } = require('bullmq');
// const Redis = require('ioredis');

const myQueue = new Queue('myqueue', {
    connection: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
    },
});

// console.log(myQueue);
// (async () => {
//     const jobs = await myQueue.getJobs(['waiting', 'active', 'completed', 'failed']);
//     jobs.forEach(job => {
//       console.log(job);
//     });
//   })();

exports.imagesImageDbIdGET = async function (req, res, next) {
    try {
        // const completed = await myQueue.getJobs(['wait'], 0, 100, true);
        // console.log(completed);
        const id = parseInt(req.params.imageDbId);
        let audio = await Audio.findByPk(id);

        if (!audio)
            return res.status(404).json({
                messageType: 'ERROR',
                message: 'Audio does not exist',
            });

        res.status(200).json({
            status: [
                {
                    message: 'Request accepted, response successful',
                    messageType: 'INFO',
                },
            ],
            result: {
                data: [audio],
            },
        });
    } catch (err) {
        res.status(400).json({
            messageType: 'ERROR',
            message: err.message,
        });
    }
};

exports.imagesPOST = async (req, res, next) => {
    try {
        if (req.body.additionalInfo.media == 'audio') {
            data = {
                audio_file_name: req.body.imageFileName,
                audiomimetype: req.body.mimeType,
                audiourl: req.body.imageURL,
                time_stamp: req.body.imageTimeStamp,
                field_id: req.body.additionalInfo.fieldId,
            };
            // console.log(data);
            const audio = await Audio.create(data);
            res.status(200).json({
                metadata: {
                    datafiles: [],
                    pagination: {
                        totalCount: 1,
                        pageSize: 1,
                        totalPages: 1,
                        currentPage: 0,
                    },
                    status: [
                        {
                            message: 'Request accepted, response successful',
                            messageType: 'INFO',
                        },
                    ],
                },
                result: {
                    data: [
                        {
                            imageDbId: audio.id,
                            imageFileName: audio.audio_file_name,
                            mimeType: audio.audiomimetype,
                            imageURL: audio.audiourl,
                            imageTimeStamp: audio.time_stamp,
                            additionalInfo: { field_id: audio.field_id },
                        },
                    ],
                },
            });
        } else {
            data = {
                additionalInfo: req.body.additionalInfo,
                copyright: req.body.copyright,
                description: req.body.description,
                descriptiveOntologyTerms: req.body.descriptiveOntologyTerms,
                externalReferences: req.body.externalReferences,
                image_file_name: req.body.imageFileName,
                image_file_size: req.body.imageFileSize,
                image_height: req.body.imageHeight,
                image_location: req.body.imageLocation,
                image_name: req.body.imageName,
                image_time_stamp: req.body.imageTimeStamp,
                imageurl: req.body.imageURL,
                image_width: req.body.imageWidth,
                imagemimetype: req.body.mimeType,
                observationDbIds: req.body.observationDbIds,
                observationUnitDbId: req.body.observationUnitDbId,
            };
            const image = await Image.create(data);
            res.status(200).json({
                status: [
                    {
                        message: 'Request accepted, response successful',
                        messageType: 'INFO',
                    },
                ],
                result: {
                    data: [image],
                },
            });
        }
    } catch (err) {
        res.status(400).json({
            messageType: 'ERROR',
            message: err.message,
        });
    }
};

exports.imageContentPUT = async function (req, res, next) {
    try {
        // console.log(req.headers);
        // console.log(typeof req.params.imageDbId);
        const id = parseInt(req.params.imageDbId);
        // console.log(typeof id);
        let audio = await Audio.findByPk(id);

        if (!audio)
            return res.status(404).json({
                messageType: 'ERROR',
                message: 'Audio does not exist',
            });

        const response = await axios.get(
            'https://demo.breedbase.org/ajax/user/login',
            { params: { username: 'janedoe', password: 'secretpw' } }
        );

        const cookie = response.headers['set-cookie'];
        const URL = `https://demo.breedbase.org/ajax/breeders/trial/${audio.field_id}/upload_additional_file`;
        // console.log(audio);
        // Create a new FormData instance
        const formData = new FormData();
        // console.log(req);
        formData.append(
            'trial_upload_additional_file',
            req.body,
            'example.mp3' //TO DO: have some naming convention for this
        );
        // Append the binary data to the form data
        // console.log(cookie);
        // console.log(formData);
        const response2 = await axios.post(URL, formData, {
            headers: { Cookie: cookie, ...formData.getHeaders() },
        });
        // console.log(response2);
        if (response2.data.success == 1) {
            await Audio.update(
                {
                    audiomimetype: req.headers['content-type'],
                    audiourl: `https://demo.breedbase.org/breeders/phenotyping/download/${response2.data.file_id}`,
                    file_id: response2.data.file_id,
                },
                {
                    where: {
                        id: id,
                    },
                }
            );
            audio = await Audio.findByPk(id);
            const jobData = {
                audio_url: audio.audiourl,
                log_url:
                    'https://demo.breedbase.org/breeders/phenotyping/download/54',
                field_id: audio.field_id,
                file_id: audio.file_id,
            };
            const job = await myQueue.add(`job${audio.file_id}`, jobData);
            console.log(job);
            res.status(200).json({
                metadata: {
                    datafiles: [],
                    pagination: {
                        totalCount: 1,
                        pageSize: 1,
                        totalPages: 1,
                        currentPage: 0,
                    },
                    status: [
                        {
                            messageType: 'INFO',
                            message: 'Request accepted, response successful',
                        },
                    ],
                },
                result: {
                    data: [
                        {
                            imageDbId: audio.id,
                            imageFileName: audio.audio_file_name,
                            mimeType: audio.audiomimetype,
                            imageURL: audio.audiourl,
                            imageTimeStamp: audio.time_stamp,
                            additionalInfo: {
                                field_id: audio.field_id,
                                file_id: audio.file_id,
                            },
                        },
                    ],
                },
            });
        } else {
            res.status(400).json({
                messageType: 'ERROR',
                message: 'Audio upload unsuccessful',
            });
        }
        // const path = `./uploads/${audio.audio_file_name}`;
        // fs.writeFile(path, req.body, async (err) => {
        //     if (err) {
        //         console.error('Error writing file:', err);
        //         res.status(400).json({ result: 'Unsuccessful' });
        //     } else {
        //         console.log('File saved successfully!');
        //         console.log(id);
        //         console.log(path);
        //         console.log(req.headers['content-type']);
        //         await Audio.update(
        //             {
        //                 audiomimetype: req.headers['content-type'],
        //                 audiourl: path,
        //             },
        //             {
        //                 where: {
        //                     id: id,
        //                 },
        //             }
        //         );
        //         // console.log(audio);
        //         res.status(200).json({
        //             status: [
        //                 {
        //                     message:
        //                         'Request accepted, response successful',
        //                     messageType: 'INFO',
        //                 },
        //             ],
        //             result: {
        //                 data: [audio],
        //             },
        //         });
        //     }
        // });
    } catch (err) {
        res.status(400).json({
            messageType: 'ERROR',
            message: err.message,
        });
    }
};

exports.imagesImageDbIdPUT = async function (req, res, next) {
    try {
        if (
            req.body.additionalInfo &&
            req.body.additionalInfo.media == 'audio'
        ) {
            data = {
                audio_file_name: req.body.imageFileName,
                audiomimetype: req.body.mimeType,
                audiourl: req.body.imageURL,
                time_stamp: req.body.imageTimeStamp,
            };
            const id = parseInt(req.params.imageDbId);
            let audio = await Audio.findByPk(id);
            if (!audio)
                return res.status(404).json({
                    messageType: 'ERROR',
                    message: 'Audio does not exist',
                });
            await Audio.update(data, {
                where: {
                    id: id,
                },
            });
            return res.status(200).json({
                status: [
                    {
                        message: 'Request accepted, response successful',
                        messageType: 'INFO',
                    },
                ],
                result: {
                    data: [audio],
                },
            });
        }
        res.status(400).json({
            messageType: 'ERROR',
            message: 'Incorrect request format',
        });
    } catch (err) {
        res.status(400).json({
            messageType: 'ERROR',
            message: err.message,
        });
    }
};

exports.serverInfo = async function (req, res, next) {
    res.status(200).json({
        metadata: {
            datafiles: [],
            pagination: {
                currentPage: 0,
                pageSize: 1000,
                totalCount: 10,
                totalPages: 1,
            },
            status: [
                {
                    message: 'Request accepted, response successful',
                    messageType: 'INFO',
                },
            ],
        },
        result: {
            calls: [
                {
                    contentTypes: ['application/json'],
                    dataTypes: ['application/json'],
                    methods: ['GET', 'POST'],
                    service: 'germplasm/{germplasmDbId}/pedigree',
                    versions: ['2.0', '2.1'],
                },
                {
                    contentTypes: ['application/json'],
                    dataTypes: ['application/json'],
                    methods: ['POST'],
                    service: 'images',
                    versions: ['2.0', '2.1'],
                },
                {
                    contentTypes: ['application/json'],
                    dataTypes: ['application/json'],
                    methods: ['PUT'],
                    service: 'images/{imageDbId}/imageContent',
                    versions: ['2.0', '2.1'],
                },
            ],
        },
    });
};
