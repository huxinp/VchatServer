const apiModel = require('../model/apiModel');

const getUser = (req, res) => {
  apiModel.getUser(r => {
    res.json({
      code: 0,
      data: r
    })
  })
};

const login = (req, res) => {
  let params = req.body;
  apiModel.login(params, r => {
    if (r.code === 0) {
      req.session.login = r.data.name;
      res.json({
        code: 0,
        data: r,
        msg: '登录成功'
      })
    } else {
      res.json({
        code: -1,
        data: '账号不存在或密码错误'
      })
    }
  });
};

module.exports = {
  getUser,
  login,
}