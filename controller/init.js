const initModel = require('../model/init.js');   // 初始化数据库表
const account = require('../utils/accountBase'); // 初始化数据库表

let db = {
  initUser() {
    initModel.initUser();
  },
  initEmoji() {
    initModel.initEmoji('./public/expression');
  },
  initAccount() {
    account.initAccount();
  },
  init() {
    this.initUser();
    this.initEmoji();
    this.initAccount();
  }
}

module.exports = db;