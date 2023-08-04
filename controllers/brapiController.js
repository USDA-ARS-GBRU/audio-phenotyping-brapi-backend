const fs = require('fs');
const Image = require('../models/imageModel');
const Audio = require('../models/audioModel');

exports.createImage = async (req, res, next) => {
    try {
        if (req.body.additionalInfo.media == 'audio') {
            data = {
                audio_file_name: req.body.imageFileName,
                audiomimetype: req.body.mimeType,
                audiourl: req.body.imageURL,
                time_stamp: req.body.imageTimeStamp,
            };
            const audio = await Audio.create(data);
            res.status(201).json({
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
            res.status(201).json({
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
            status: 'fail',
            message: err.message,
        });
    }
};

exports.imageContentPUT = async function (req, res, next) {
    try {
        console.log(req.headers);
        // console.log(typeof req.params.imageDbId);
        const id = parseInt(req.params.imageDbId);
        // console.log(typeof id);
        let audio = await Audio.findByPk(id);

        if (!audio)
            res.status(404).json({
                status: 'fail',
                message: 'Audio does not exist',
            });
        else {
            const path = `./uploads/${audio.audio_file_name}`;
            fs.writeFile(path, req.body, async (err) => {
                if (err) {
                    console.error('Error writing file:', err);
                    res.status(400).json({ result: 'Unsuccessful' });
                } else {
                    console.log('File saved successfully!');
                    console.log(id);
                    console.log(path);
                    console.log(req.headers['content-type']);
                    await Audio.update(
                        {
                            audiomimetype: req.headers['content-type'],
                            audiourl: path,
                        },
                        {
                            where: {
                                id: id,
                            },
                        }
                    );
                    // console.log(audio);
                    res.status(201).json({
                        status: [
                            {
                                message:
                                    'Request accepted, response successful',
                                messageType: 'INFO',
                            },
                        ],
                        result: {
                            data: [audio],
                        },
                    });
                }
            });
        }
    } catch (err) {
        res.status(400).json({
            status: 'fail',
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
                    status: 'fail',
                    message: 'Audio does not exist',
                });
            await Audio.update(data, {
                where: {
                    id: id,
                },
            });
            return res.status(201).json({
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
            status: 'fail',
            message: 'Incorrect request format',
        });
    } catch (err) {
        res.status(400).json({
            status: 'Fail',
            message: err.message,
        });
    }
};

exports.serverInfo = async function (req, res, next) {
    res.status(200).json({
        '@context': ['https://brapi.org/jsonld/context/metadata.jsonld'],
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
