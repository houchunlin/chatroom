var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json([
    {username: "James Bond", used: false},
    {username: "007", used: false}
  ]);
});

module.exports = router;
