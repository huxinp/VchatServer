
const api = require('../controller/apiList');

const express = require('express');
const router = express.Router();

router.get('/getUser', api.getUser); // 获取用户， 测试接口
router.post('/login', api.login); // 登录

module.exports = router;
