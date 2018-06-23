const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const keys = require('../../config/keys')
const uuid = require('uuid/v1');

// @config S3 aws settings
const s3 = new AWS.S3({
        accessKeyId: keys.accessKeyId,
        secretAccessKey: keys.secretAccessKey,
        signatureVersion: 'v4',
        ACL: 'private'
    })
    // ACL: 'public-read'

// @route   GET /uploads
// @desc    Get signed url to upload a new image 
// @access  Public
router.get('/', (req, res) => {

    const key = `image-${Date.now()}.jpg`;
    const params = {
        Bucket: 'bucketham',
        ContentType: 'image/jpeg',
        Key: key,
    }

    s3.getSignedUrl('putObject', params, (err, url) => res.send({
        key,
        PostURL: url,
        getURL: url.split("?")[0]
    }))

});

// @route   GET /uploads
// @desc    Get to this route to DELETE an image
// @access  Public
router.get('/delete', (req, res) => {

    const params = {
        Bucket: 'bucketham',
        Key: 'i5c677d10-6de3-11e8-97d3-9f6c4eb5d96c.jpeg'
    }

    s3.deleteObject(params, (err, data) => {
        return res.send({
            data
        })
    });

});


router.get('/list', (req, res) => {

    const params = {
        Bucket: 'bucketham',
    }

    // s3.deleteObject(params, (err, data) => {
    //     return res.send({
    //         data
    //     })
    // });

    s3.listObjects(params, (err, data) => {
        // var bucketContents = data.Contents;
        return res.send({
            data
        })

        // for (var i = 0; i < bucketContents.length; i++) {

        //     var urlParams = { Bucket: 'myBucket', Key: bucketContents[i].Key };

        //     s3.getSignedUrl('getObject', urlParams, function(err, url) {
        //         console.log('the url of the image is', url);
        //     });
        // }
    });

});

module.exports = router;