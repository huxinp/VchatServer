// const db = require('../utils/database');
const { Users, AccountBase } = require('./baseList');
const crypto = require('crypto');
const fs = require('fs');
// const path = require('path');

const md5 = pass => { // 避免多次调用 MD5 报错
  let md5 = crypto.createHash('md5');
  return md5.update(pass).digest('hex');
};
// 测试
const getUser = (callback) => {
  Users.find().then(r => {
    callback(r);
  })
};
// 登录
const login = (params, callback) => {
  Users
    .find({
      $or: [{'name': params.name}, {'code': params.name}]
    })
    .then(r => {
      if (r.length) {
        let pass = md5(params.pass);
        if (r[0]['pass'] === pass) {
          Users.update({ name: params.name }, { lastLoginTime: Date.now() })
            .then(raw => {
              console.log(raw);
            });
          callback({ code: 0, data: { name: r[0].name, photo: r[0].photo }});
        } else {
          callback({ code: -1 });
        }
      } else {
        callback({ code: -1 });
      }
    })
}
// 修改个人信息、主题等
const upUserInfo = (userName, params, callback) => {
  let pr = {};
  if (params.unlink) {
    for (let k in params) {
      if (k !== 'unlink') {
        pr[k] = params[k];
      }
    }
    if (params.unlink.indexOf('/uploads') > -1) {
      fs.unlink('./public' + params.unlink, err => {
        if (err) {
          console.log(err);
          return false;
        }
        console.log('删除文件成功');
      })
    }
  } else {
    pr = params;
  }
  Users.update({ name: userName }, pr).then(raw => {
    if (raw.nModified > 0) {
      callback({ code: 0 });
    } else {
      callback({ code: -1 });
    }
  })
}
// 注册
const signUp = (params, callback) => {
  Users.find({ name: params.name }).then(r => {
    if (r.length) {
      callback({ code: 1 });
    } else {
      function createfun(code) { // 写入数据
        let pass = md5(params.pass);
        Users.create({
          name: params.name,
          pass, code,
          nickname: 'vChat' + (Date.now() + '').slice(6)
        }).then(r => {
          if (r['_id']) {
            callback({ code: 0, data: code });
          } else {
            callback({ code: -1 });
          }
        })
      }
      function findOneAccountBase(createfun) { // 查找 code
        let rand = Math.random();
        AccountBase.findOneAndUpdate({type: '1', status: '0', random: { $gte: rand }}, {status: '1'}, (err, doc) => {
            if (err) {
              console.log(err);
            } else {
              if (!doc) {
                AccountBase.findOneAndUpdate({type: '1', status: '0', random: { $lt: rand }}, {status: '1'}, (err, doc) => {
                    if (err) {
                      console.log(err);
                    } else {
                      if (doc) {
                        createfun(doc.code);
                      }
                    }
                  }
                )
              } else {
                createfun(doc.code);
              }
            }
          }
        );
      }
      findOneAccountBase(createfun);
    }
  })
}
// 获取登录用户或好友信息
const getUserInfo = (params, callback) => {
  if (params.id) {
    Users.find({ _id: params.key }).then(r => {
      if (r.length) {
        const { name, photo, nickname, signature, code, cover, sex, province, city, town } = r[0];
        const response = { name, photo, nickname, signature, code, cover, sex, province, city, town };
        callback({ code: 0, data: response });
      } else {
        callback({ code: -1 });
      }
    })
  } else {
    Users.find({ name: params.key }).then(r => {
      if (r.length) {
        const {
          name, photo, bubble, chatTheme, projectTheme, wallpaper, nickname, signature,
          id, conversationsList, code, emoji, chatColor, province, city, town, bgOpa
        } = r[0];
        const response = {
          name, photo, bubble, chatTheme, projectTheme, wallpaper, nickname, signature,
          id, conversationsList, code, emoji, chatColor, province, city, town, bgOpa
        };
        callback({ code: 0, data: response });        
      } else {
        callback({ code: -1 });
      }
    })
  }
}
// 获取vchat官方账号信息
const getVchatInfo = (callback) => {
  Users.find({ name: 'Vchat' }).then(r => {
    if (r.length) {
      const { name, photo, nickname, signature, _id } = r[0];
      const response = { name, photo, nickname, signature, id: _id };
      callback({ code: 0, data: response });
    } else {
      callback({ code: -1 });
    }
  })
}
// 获取登录用户详细信息
const getUserDetail = (userName, callback) => {
  Users.find({ name: userName }).then(r => {
    if (r.length) {
      const { nickname, signature, sex, phone, email, province, city, town } = r[0];
      const response = { nickname, signature, sex, phone, email, province, city, town };
      callback({ code: 0, data: response });
    } else {
      callback({ code: -1 });
    }
  })
}
// 添加会话
const addConversitionList = (userName, params, callback) => {
  Users.update({name: userName}, {$push: {conversationsList: params}}).then(raw => {
    if (raw.nModified > 0) {
      callback({ code: 0 });
    } else {
      callback({ code: -1 });
    }
  })
}
// 删除会话
const removeConversitionList = (userName, params, callback) => {
  Users.update({name: userName}, {$pull: {conversationsList: {id: params.id}}}).then(raw => {
    if (raw.nModified > 0) {
      callback({ code: 0 });
    } else {
      callback({ code: -1 });
    }
  })
}
// 获取登录用户详细信息
const huntFriends = (params, callback) => {
  let key = new RegExp(params.key);
  let arr = [];
  params.type === '2' ? arr = [{'nickname': {'$regex': key, $options: '$i'}}] : arr = [{
    'code': {
      '$regex': key,
      $options: '$i'
    }
  }];
  Users.count(
    { $or: arr },
    (err, count) => {
      if (count > 0) {
        Users
          .find({$or: arr, name: {'$ne': 'Vchat'}}, {nickname: 1, photo: 1, signature: 1})
          .skip((params.offset - 1) * params.limit)
          .limit(params.limit)
          .sort({ name: 1})
          .then(r => {callback({ code: 0, data: r, count })})
          .catch(err => callback({ code: -1 }));
      } else {
        callback({ code: 0, data: [], count: 0 });
      }
    }
  )
}

module.exports = {
  getUser,
  login,
  upUserInfo,
  signUp,
  getUserInfo,
  getVchatInfo,
  getUserDetail,
  addConversitionList,
  removeConversitionList,
  huntFriends,
}