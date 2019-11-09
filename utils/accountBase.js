// 生成随机号码池，项目初次启动时运行

const db = require('./database');

let accountBase = db.model('accountBase', {
  code: String,
  status: String, // 1 已使用 0 未使用
  special: String,
  type: String, // 1 用户 2 群聊
  random: Number // （随机数索引，用于随机查找一条）
});

let initAccount = () => {
  let index = 0;
  for (let i = 10000001; i <= 10001000; i++) { // 首批用户默认账号 8位
    // 通过 new Model1() 创建的文档 doc1, 必须通过 save() 方法，才能将创建的文档保存到数据库的集合中
    let account = new accountBase({
      code: i,
      status: '0',
      type: '1',
      random: Math.random()
    });
    account.save(function(error, newAccount) {
      // 回调函数是可选项， 第一个参数为 err，第二个参数为保存的文档对象
      if (error) {
        console.log(`插入 ${account} 错误：${error}`)
      } else {
        console.log(`已成功插入 ${newAccount}`);
      }
    });
  }
  for (let i = 100001; i <= 100999; i++) { // 首批群聊默认账号 6位
    let account = new accountBase({
      code: i,
      status: '0',
      type: '2',
      random: Math.random()
    });
    account.save(function(error, newAccount) {
      index = i;
      if (error) {
        console.log(`插入 ${account} 错误：${error}`)
      } else {
        console.log(`已成功插入 ${newAccount}`);
      }
    })
  }
  if (index === 100999) {
    setInterval(_ => {
      process.exit(); // 退出进程
      // 初始化操作后自动退出命令行
    }, 1000)
  }
}

module.exports = {
  initAccount
}