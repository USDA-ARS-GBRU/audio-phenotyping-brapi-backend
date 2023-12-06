const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const Image = require('../models/imageModel');
const Audio = require('../models/audioModel');
const { Queue, Worker } = require('bullmq');
const AdmZip = require('adm-zip');

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
        const id = parseInt(req.params.imageDbId);
        let audio = await Audio.findByPk(id);

        if (!audio)
            return res.status(404).json({
                messageType: 'ERROR',
                message: 'Audio does not exist',
            });

        const login_response = await axios.get(
            `${process.env.BREEDBASE_HOST}ajax/user/login`,
            {
                params: {
                    username: `${process.env.BREEDBASE_USERNAME}`,
                    password: `${process.env.BREEDBASE_PASSWORD}`,
                },
            }
        );

        const cookie = login_response.headers['set-cookie'];
        const URL = `${process.env.BREEDBASE_HOST}ajax/breeders/trial/${audio.field_id}/upload_additional_file`;

        const zip = new AdmZip(req.body);
        const zipEntries = zip.getEntries();

        if (zipEntries.length != 2) {
            return res.status(404).json({
                messageType: 'ERROR',
                message: 'Did not receive valid number of files',
            });
        }

        var zipEntry1 = zipEntries[0];
        var zipEntry2 = zipEntries[1];

        // Create a new FormData instance
        const formData1 = new FormData();
        formData1.append(
            'trial_upload_additional_file',
            zip.readFile(zipEntry1),
            `${zipEntry1.entryName}` //TO DO: have some naming convention for this
        );
        const response1 = await axios.post(URL, formData1, {
            headers: { Cookie: cookie, ...formData1.getHeaders() },
        });

        const formData2 = new FormData();
        formData2.append(
            'trial_upload_additional_file',
            zip.readFile(zipEntry2),
            `${zipEntry2.entryName}` //TO DO: have some naming convention for this
        );
        const response2 = await axios.post(URL, formData2, {
            headers: { Cookie: cookie, ...formData2.getHeaders() },
        });

        if (response1.data.success == 1 && response2.data.success == 1) {
            console.log(`Audio and log files uploaded to Breedbase`);

            await Audio.update(
                {
                    audiomimetype: req.headers['content-type'],
                    audiourl: `${process.env.BREEDBASE_HOST}breeders/phenotyping/download/${response1.data.file_id}`,
                    file_id: response1.data.file_id,
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
                log_url: `${process.env.BREEDBASE_HOST}breeders/phenotyping/download/${response2.data.file_id}`,
                field_id: audio.field_id,
                file_id: audio.file_id,
            };
            const job = await myQueue.add(`job${audio.file_id}`, jobData);

            console.log(`New job added to queue:`, job.name);
            console.log(job.data);

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
