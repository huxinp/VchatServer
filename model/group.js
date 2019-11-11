const db = require('../utils/database');
const { Users, AccountBase } = require('./baseList');

const Groups = db.model('Groups', {
  title: String,
  desc: String,
  img: String,
  code: String,
  userNum: Number, // 群成员数量，避免某些情况需要多次联表查找，如搜索；所以每次加入一人，数量加一
  createDate: { type: Date, default: Date.now() },
  grades: { type: String, default: 'V1' },
  holderName: String // 群主账号
});

const GroupUserSchema = new db.Schema({
  groupId: {
    type: db.Schema.ObjectId,
    ref: 'groups'
  },
  userId: {
    type: db.Schema.ObjectId,
    ref: 'users'
  },
  userName: { type: String },
  manager: { type: Number, default: 0 },
  holder: { type: Number, default: 0 },
  card: String // 群名片
});
GroupUserSchema.statics = {
  // 通过用户名查找所在群聊列表
  findGroupByUserName: function(userName, callback) {
    return this
      .findGroupByUserName({ userName: userName })
      .populate('groupId') // 关联查询
      .exec(callback)
  },
  // 通过群id查找用户信息
  findGroupUsersByGroupId: function(groupId, callback) {
    return this
      .find({ groupId: groupId })
      .populate({ path: 'userId', select: 'signature photo nickname'})
      .exec(callback);
  }
}

const GroupUser = db.model('GroupUser', GroupUserSchema); // groupUser model
// 新建群
const createGroup = (params, callback) => {
  function createFn(code) {
    Groups.create({
      title: params.groupName,
      desc: params.groupDesc,
      img: params.groupImage,
      code: code,
      userNum: 1,
      holderName: params.userName
    }).then(r => {
      if (r['_id']) {
        Users.find({ name: params.userName }).then(rs => {
          if (rs.length) {
            GroupUser.create({
              userName: params.userName,
              userId: rs[0]._id,
              manager: 0,
              holder: 1,
              groupId: r['_id']
            }).then(res => {
              if (res['_id']) {
                callback({ code: 0, data: r });
              } else {
                Groups.remove({ '_id': r['_id']}, 1);
                callback({ code: -1 });
              }
            })
          } else {
            Groups.remove({ '_id': r['_id'] }, 1);
            callback({ code: -1 });
          }
        })
      } else {
        callback({ code: -1 })
      }
    })
  }
  function findOneAccountBase(createFn) {
    const rand = Math.random();
    AccountBase.findOneAndUpdate({type: '2', status: '0', random: {$gte: rand}}, {status: '1'}, (err, doc) => {
      if (err) {
        console.log(err);
      } else {
        if (!doc) {
          AccountBase.findOneAndUpdate({type: '1', status: '0', random: {$lt: rand}}, {status: '1'}, (err, doc) => {
            if (err) {
              console.log(err);
            } else {
              if (doc) {
                createFn(doc.code);
              }
            }
          })
        } else {
          createFn(doc.code);
        }
      }
    })
  }
  findOneAccountBase(createFn);
}

module.exports = {
  createGroup,
}