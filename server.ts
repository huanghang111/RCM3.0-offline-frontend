const express = require('express');
const path = require('path');
const expressApp = express();
const port = process.env.PORT || 4200;

expressApp.use(express.static('./dist'));
expressApp.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '/dist/index.html'));
});

expressApp.listen(port, () => console.log(`RCM App listening on port ${port}`));
