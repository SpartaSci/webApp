'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const cors = require('cors');

const { body, validationResult } = require("express-validator");

const { expressjwt: jwt } = require('express-jwt');
const jwtSecret = '47e5edcecab2e23c8545f66fca6f3aec8796aee5d830567cc362bb7fb31adafc';


// init express
const app = express();
const port = 3002;

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json()); // To automatically decode incoming json

// Check token validity
app.use(jwt({
      secret: jwtSecret,
      algorithms: ["HS256"],
      // token from HTTP Authorization: header
    })
);

app.use( function (err, req, res, next) {
    console.log("err: ",err);
    if (err.name === 'UnauthorizedError') {
        // Example of err content:  {"code":"invalid_token","status":401,"name":"UnauthorizedError","inner":{"name":"TokenExpiredError","message":"jwt expired","expiredAt":"2024-05-23T19:23:58.000Z"}}
        res.status(401).json({ errors: [{  'param': 'Server', 'msg': 'Authorization error', 'path': err.code }] });
    } else {
        next();
    }
} );


// GET /api/protected

app.post('/api/estimation',
    [
        body('accessories').isArray(),
        body('accessories.*').isString()
    ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors});
    }
    let totaleCaratteri = 0;

     req.body.accessories.forEach(stringa => {
        totaleCaratteri += stringa.replace(" ", '').length;
        });
    // res.status(200).json({ time: totaleCaratteri});
     let tot = totaleCaratteri * 3 + Math.round(Math.random() * 90) + 1;
     const isGoodUser= req.auth.good;
     let divisor = isGoodUser ?  Math.floor(Math.random()*3)+2 : 1;

     res.status(200).json({ time: Math.round(tot/divisor) });

});



// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
