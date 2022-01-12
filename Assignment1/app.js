// Michael Reilly 10439198
// I pledge my honor that I have abided by the Stevens Honor System.

const express = require('express');
const app = express();
const configRoutes = require('./routes');

app.use(express.json());

configRoutes(app);

app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log("Routes are running on http://localhost:3000");
});