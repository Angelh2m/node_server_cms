const express = require('express');
const router = express.Router();

var http = require('http');
var https = require('https');
var request = require('request');
// in order to write to the filesystem we need the `fs` lib
var fs = require('fs');
// import the lib
var sharp = require('sharp');

// @route   GET api/profile/test
// @desc    Tests profile route
// @access  Public
// Import both http & https for handling different uris


var imageUri = 'https://c2.staticflickr.com/2/1723/27650518707_a230a7ccfa_c.jpg';


// router.get('/:size', (req, res) => {

//     var readableStream = request(imageUri);
//     var transformer = sharp()
//         .resize(Number(req.params.size))
//         .on('info', function (info) {
//             console.log('Image height is ' + info.height);
//         });

//     readableStream.pipe(transformer).pipe(res);

//     // var inputStream = request(imageUri);
//     // var transformer = sharp().resize(Number(req.params.size));
//     // inputStream.pipe(transformer).pipe(res);

// });

router.get('/:size', (req, res) => {
    res.set('Content-Type', 'image/jpg');

    var readableStream = request(imageUri);

    var requestSettings = {
        url: imageUri,
        method: 'GET',
        encoding: null
    };

    request(requestSettings, function (error, response, body) {
        res.set('Content-Type', 'image/png');
        res.send(body);
    });

    // res.send(readableStream)
    // var transformer = sharp()
    //     .resize(Number(req.params.size))
    //     .on('info', function (info) {
    //         console.log('Image height is ' + info.height);
    //     });

    // readableStream.pipe(transformer).pipe(res);

    // var inputStream = request(imageUri);
    // var transformer = sharp().resize(Number(req.params.size));
    // inputStream.pipe(transformer).pipe(res);

});



module.exports = router;