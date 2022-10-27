/**
 * Copyright 2022 Justin Randall, Cisco Systems Inc. All Rights Reserved.
 * 
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU
 * General Public License as published by the Free Software Foundation, either version 3 of the License, or 
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without 
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 * See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along with this program. If not, 
 * see <https://www.gnu.org/licenses/>.
 */

const handler = require('./handler');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Parse HTTP request body.
app.use(bodyParser.json()); // application/json
app.use(bodyParser.urlencoded({ extended: true })); // application/x-www-form-urlencoded

// Handle HTTP POST / request.
app.post('/', async (req, res) => {
    await handler.handleFulfillment(req, res);
});

// Create server socket and listen for requests.
const listenPort = parseInt(process.env.PORT) || 8080;
app.listen(listenPort, () => {
    console.log(`cctsa-wxccdemobot-fulfillment: listening on port ${listenPort}`);
});

module.exports = app;
