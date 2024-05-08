const express = require("express");
const app = express()
const path = require("path")
const {sequelize} = require('./models')
const RootRouters = require('./routers')
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const fs = require("fs")
const YAML = require('yaml')
require('dotenv').config()
var useragent = require('express-useragent');
app.use(useragent.express());

// setup app using json
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

// set up router
app.use('/api/anotepad',RootRouters)

const publicPathhDirectory = path.join(__dirname,"./public")
app.use("/public",express.static(publicPathhDirectory))

// set up swagger 
const file  = fs.readFileSync('./swagger.yaml', 'utf8')
const swaggerDocument = YAML.parse(file)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


const port = process.env.PORT || 4000;
app.listen(port,async ()=>{
    console.log(`App listen on port localhost ${port}`);
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }
})


