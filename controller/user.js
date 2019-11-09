const apiModel = require('../model/apiModel');

// 获取用户
// 0成功 -1失败
const getUser = (req, res) => {
  apiModel.getUser(r => {
    res.json({
      code: 0,
      data: r
    })
  })
};
// 登录
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
// 修改个人信息、主题等
const upUserInfo = (req, res) => {
  let params = req.body;
  let userName = req.session.login;
  apiModel.upUserInfo(userName, params, r => {
    if (r.code === 0) {
      res.json({
        code: 0,
        data: '设置成功'
      })
    } else {
      res.json({
        code: -1,
        data: '设置失败'
      })
    }
  })
}
// 注册
const signUp = (req, res) => {
  let params = req.body;
  apiModel.signUp(params, r => {
    if (r.code === 1) {
      res.json({
        code: 1,
        data: '账号已存在'
      })
    } else if (r.code === 0) {
      res.json({
        code: 0,
        data: r.data
      })
    } else {
      res.json({
        code: -1,
        data: '注册失败'
      })
    }
  })
}
// 登出
const loginOut = (req, res) => {
  req.session.destroy();
  res.json({
    code: 0,
    data: '退出成功'
  })
}
// 获取登录用户信息
const getUserInfo = (req, res) => {
  let params = req.body;
  let key = {};
  if (params.id) {
    key = Object.assign({key: params.id}, params);
  } else {
    key = { key: req.session.login };
  }
  apiModel.getUserInfo(key, r => {
    if (r.code === 0) {
      res.json({
        code: 0,
        data: r.data
      })
    } else {
      res.json({
        code: -1,
        data: ''
      })
    }
  })
}
// 获取vchat官方账号信息
const getVchatInfo = (req, res) => {
  apiModel.getVchatInfo(r => {
    if (r.code === 0) {
      res.json({
        code: 0,
        data: r.data
      })
    } else {
      res.json({
        code: -1,
        data: ''
      })
    }
  })
}
// 获取登录用户详细信息
const getUserDetail = (req, res) => {
  apiModel.getUserDetail(req.session.login, r => {
    if (r.code === 0) {
      res.json({
        code: 0,
        data: r.data
      })
    } else {
      res.json({
        code: -1,
        data: ''
      })
    }
  })
}
// 添加会话
const addConversitionList = (req, res) => {
  let params = req.body;
  apiModel.addConversitionList(req.session.login, params, r => {
    if (r.code === 0) {
      res.json({
        code: 0,
        data: '添加成功'
      })
    } else {
      res.json({
        code: -1,
        data: '添加失败'
      })
    }
  })
}

const ServeraddConversitionList = (userName, params, callback=function(){}) => {
  apiModel.addConversitionList(userName, params, callback);
}

// 删除会话
const removeConversitionList = (req, res) => {
  let params = req.body;
  apiModel.removeConversitionList(req.session.login, params, r => {
    if (r.code === 0) {
      res.json({
        code: 0,
        data: '移除成功'
      })
    } else {
      res.json({
        code: -1,
        data: '移除失败'
      })
    }
  })
}
// 搜索好友（名称/code）
const huntFriends = (req, res) => {
  let params = req.body;
  apiModel.huntFriends(params, r => {
    if (r.code === 0) {
      res.json({
        code: 0,
        data: r.data,
        count: r.count
      })
    } else {
      res.json({
        code: -1,
        data: '查询失败'
      })
    }
  })
}
module.exports = {
  getUser,
  login,
  upUserInfo,
  signUp,
  loginOut,
  getUserInfo,
  getVchatInfo,
  getUserDetail,
  addConversitionList,
  ServeraddConversitionList,
  removeConversitionList,
  huntFriends,
};
