'use strict';

const express = require('express');
const morgan = require('morgan');  //The 'morgan' module is a middleware function for logging HTTP requests and responses in Node.js applications.
const { check, validationResult, oneOf } = require('express-validator'); // validation middleware
const cors = require('cors'); // CORS is a node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.

const modelDao = require('./dao-models'); // module for accessing the models table in the DB
const accesDao = require('./dao-accessories'); // module for accessing the user table in the DB
const userDao = require('./dao-users'); // module for accessing the user table in the DB
const configDao = require('./dao-conf'); // module for accessing the configurations table in the DB
const { initAuthentication, isLoggedIn } = require("./auth");
const passport = require("passport");
const db = require('./db');


const jsonwebtoken = require('jsonwebtoken');
const jwtSecret = '47e5edcecab2e23c8545f66fca6f3aec8796aee5d830567cc362bb7fb31adafc';
const expireTime = 10; //seconds

// init express
const app = new express();
app.use(morgan('dev'));
app.use(express.json());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

initAuthentication(app,db);



// This function is used to format express-validator errors as strings
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${location}[${param}]: ${msg}`;
};


/*** db APIs ***/

// 1- get all models
app.get('/api/models',
    async(req, res) => {
      modelDao.getModels()
          .then((models) => res.status(200).json(models))
          .catch((err) => res.status(500).json(err));
    }
);

// 2- get all accessories
app.get('/api/accessories',
    async (req, res) => {
      accesDao.getListAccessories()
          .then((accessories) => res.status(200).json(accessories))
          .catch((err) => res.status(500).json(err));
    }
);

// 3- get current user configurations
app.get('/api/configuration/', isLoggedIn,
    async (req, res) => {
      try{
        const user_id = req.user.user_id;
        const result = await configDao.getConfiguration(user_id);
        res.status(200).json(result);
      }catch(err){
        res.status(501).json({error: "Error getting configuration"});
      }
    }
);


const isConfigurationValid = async (configuration) => {
  // configuration is an object with modelId, accessories
  if (!configuration.model_id || !configuration.accessories)
    return false;
  if (!Number.isInteger(configuration.model_id))
    return false;



  const model_id = configuration.model_id;
  const accessories = configuration.accessories;


  const model = await modelDao.getModelById(model_id);
  if(model.model_id === undefined) // the model does not exist
    return false;
  if (accessories.length > model.maxAcc) // too many accessories
    return false;

  const duplicateIds = new Set();  // check for duplicate accessories
  for (const accessory of accessories) {
    if(!Number.isInteger(accessory))
      return false;
    if (duplicateIds.has(accessory)) {
      return false;
    }
    duplicateIds.add(accessory);
  }

  const allAccessories = await accesDao.getListAccessories(); //accessories not in the db
  for (const accessory of accessories) {
    if (!allAccessories.some(item => item.accessory_id === accessory)) {
      return false;
    }
  }
  /************* check dependencies */
  for (const accessory_id of accessories) {

    const needed = await accesDao.getNeededAccessories(accessory_id);
    if (needed.needed_id) { // check dependency
      if (!accessories.includes(needed.needed_id)) {
        return false;
      }
    }
    const incompatible = await accesDao.getIncompatibleAccessories(accessory_id);
    if (incompatible.incompatible_id) { // check incompatibility
      if (accessories.includes(incompatible.incompatible_id)) {

        return false;
      }
    }
  }

  return true;

}

// 4- create a new configuration, when there is no configuration for the user
app.post('/api/configuration/', isLoggedIn,
    [
      //check('user_id').isInt({ min: 1 }),
      check('model_id').isInt({ min: 1 }),
      check('accessories').isArray(),
      check('accessories.*').isInt({ min: 1 })
    ],
    async (req, res) => {

    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors });
    }

    try{
        if(!req.user) // double check
            return res.status(401).json({error: 'Not authenticated'});

        const currentConf = await configDao.getConfiguration(req.user.user_id);
        if (currentConf.model_id)
            return res.status(400).json({error: 'Configuration already exists'});

        const valid = await isConfigurationValid(req.body);
        if (!valid)
            return res.status(400).json({ error: 'Invalid configuration' });

        const configuration = {
            user_id: req.user.user_id,
            model_id: req.body.model_id,
            accessories: req.body.accessories
        }
        const allAccessories = await accesDao.getListAccessories();
        for(const accessory of allAccessories){
            if(configuration.accessories.includes(accessory.accessory_id) && accessory.quantity === 0)
                return res.status(400).json({error: 'Accessory not available'});
        }

        await updateAvailableAccessories(configuration, 1);
        await configDao.createConfiguration(configuration);
        res.status(201).json(configuration);
    } catch (err ){
            res.status(500).json({error: "Error creating configuration"});
    }

})

// 5- update accessories in a configuration
app.put('/api/configuration/',isLoggedIn, [
    check('model_id').isInt({ min: 1 }),
    check('accessories').isArray(),
    check('accessories.*').isInt({ min: 1 })
    ],
    async (req, res) => {
      const errors = validationResult(req).formatWith(errorFormatter);
      if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors});
      }

    try {
        if (!req.user) // this is not necessary (isLoggedIn) but it is a double check
            return res.status(401).json({error: 'Not authenticated'});

        const currentConf = await configDao.getConfiguration(req.user.user_id);
        if (!currentConf.model_id)
            return res.status(400).json({error: 'Configuration does not exist'}); // use the POST method

        const valid = await isConfigurationValid(req.body);
        if (!valid)
            return res.status(400).json({error: 'Invalid configuration'});

        const configuration = {
            user_id: req.user.user_id,
            model_id: req.body.model_id,
            accessories: req.body.accessories
        };
        if (currentConf.model_id !== configuration.model_id)
            return res.status(400).json({error: 'If you want to change model, you have to delete the current configurations'})


        const allAccessories = await accesDao.getListAccessories();
        for (const accessory of allAccessories) {
            if (!currentConf.accessories.includes(accessory.accessory_id)) // if the accessory is not in the current configuration
                if (configuration.accessories.includes(accessory.accessory_id) && accessory.quantity === 0) // and it is in the new configuration and it is not available
                    return res.status(400).json({error: 'Accessory not available'});
        }


        const accessoriesChanged = configuration.accessories.length !== currentConf.accessories.length
            || !configuration.accessories.every(accessory => currentConf.accessories.includes(accessory));
        if (!accessoriesChanged) {
            return res.status(400).json({error: 'No changes to save'});
        }


        await updateAvailableAccessories(currentConf, 0); // update after remove the old accessories
        await configDao.deleteConfiguration(req.user.user_id); // delete the old configuration
        await updateAvailableAccessories(configuration, 1); // update after add the new accessories
        await configDao.createConfiguration(configuration); // create the new configuration
        res.status(200).json(configuration);
    } catch (err) {
          res.status(500).json({error: "Error updating configuration"});
      }

})


// 6- delete a configuration
app.delete('/api/configuration/', isLoggedIn,
    async (req, res) => {

      const currentConf = await configDao.getConfiguration(req.user.user_id);
      if (!currentConf.model_id){
        res.status(400).json({error: 'Configuration does not exists'});
      }else {
        try {
          await configDao.deleteConfiguration(req.user.user_id);
          await updateAvailableAccessories(currentConf, 0);
          res.status(204).end()
        } catch (err) {
          res.status(500).json({error:"Error deleting configuration"});
        }
      }
    }
);

const updateAvailableAccessories = async (configuration, action) => {
  const accessories = configuration.accessories;
  const allAccessories = await accesDao.getListAccessories();

  const updatePromises = [];

  try {
  if (action === 1) {  // add accessories --> decrease available accessories
    for (const accessory of allAccessories) {
      if (accessories.includes(accessory.accessory_id)){
        updatePromises.push(accesDao.updateAccessoryQuantity(accessory.accessory_id, accessory.quantity - 1));
      }
    }

  } else { // remove accessories --> increase available accessories
    for (const accessory of allAccessories) {
      if (accessories.includes(accessory.accessory_id)){
        updatePromises.push(accesDao.updateAccessoryQuantity(accessory.accessory_id, accessory.quantity + 1));}
    }
  }
}catch(err){
    throw err;
    }

}

/*** Users APIs ***/

// 7- POST /api/sessions
// This route is used for performing login.
app.post('/api/sessions',
    [
        check("username").isString(),
        check("password").isString()
       // check("username").isEmail()
    ],
    function(req, res, next) {

  const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json({ error: info});
    }
    // success, perform the login and extablish a login session
    req.login(user, (err) => {
      if (err)
        return next(err);
      // req.user contains the authenticated user, we send all the user info back
      // this is coming from userDao.getUser() in LocalStratecy Verify Fn
      return res.json(req.user);
    });
  })(req, res, next);
});


// 8- GET /api/sessions/current
// This route checks whether the user is logged in or not.
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
  else
    res.status(401).json({error: 'Not authenticated'});
});

// 9- DELETE /api/session/current
// This route is used for loggin out the current user.
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.status(200).json({});
  });
});


/*** 10 - Token ***/
/**
 * Get token
 */
app.get('/api/auth-token', isLoggedIn, (req, res) => {
  const fullTime = req.user.good;

  const payloadToSign = { good: req.user.good, user_id: req.user.user_id };
  const jwtToken = jsonwebtoken.sign(payloadToSign, jwtSecret, {expiresIn: expireTime});
  //console.log(jwtToken);
  res.json({token: jwtToken});
});



// activate the server
const port = 3001;
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});


