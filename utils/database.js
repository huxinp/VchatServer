// 连接数据库
const mongoose = require('mongoose');
// 升级后必须带的，表示客户端去连接服务器
mongoose.connect('mongodb://127.0.0.1:27017/chat');
// { useMongoClient: true }
// node 里有 global 的全局变量， 让 mongoose 里默认的 Promise
// 使用 node 里的 Promise，让 mongoose 也能用 node 的语法
mongoose.Promise = global.Promise;

module.exports = mongoose;
