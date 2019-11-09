let express = require('express');
let path = require('path');
let utils = require('./utils/utils');
let logger = require('morgan');
let cookieParser = require('cookie-parser'); // cookie
let bodyParser = require('body-parser');     // post请求需要的中间件
let session = require('express-session');    // session
let proxy = require('http-proxy-middleware');
let compression = require('compression');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);

const api = require('./routes/api');
const user = require('./routes/user');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
let options = {
  setHeaders: function (res, path, stat) {
    res.set('Access-Control-Allow-Origin', '*')
  }
};
app.use(express.static(path.join(__dirname, 'public'), options)); // 静态资源中间件
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}));
// 后端解决跨域的方式， 现选择前端代理
// app.all('*', function(req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'X-Requested-With');
//   res.header('Access-Control-Allow-Headers', 'Content-Type');
//   next();
// });

app.use('^/api*', proxy({ // 配置代理转发
  target: 'http://api.budejie.com',
  changeOrigin: true,
}));
app.use('^/touch*', proxy({
  target: "https://3g.163.com",
  changeOrigin: true,
}));

app.use('/v*', (req, res, next) => {
  if(req.session.login) {
    next();
  } else {
    if (['/v/user/login', '/v/user/signUp'].contains(req.originalUrl)) {
      next();
    } else {
      res.json({
        status: 0
      });
    }
  }
})
app.use('/v/api', api);
app.use('/v/user', user);

app.get('/', (req, res) => {
  res.sendfile(__dirname + '/index.html');
});

app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

server.listen(9988, () => {
  console.log('服务器在9988启动');
});