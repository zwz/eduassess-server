/**
 * Created by SiuWongLi on 17/3/17.
 */
// more routes for our users will happen here

var express = require('express'), assert = require('assert');
var router = express.Router();
var userManage = require("./../models/user");
var co = require('co');
var ObjectID = require('mongodb').ObjectID;
var ResponseEntity = require('./../models/resp');
var Valid = require("./../utils/valid");
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
//router.post('/infos', function (req, res) {
router.get('', function (req, res) {
    var resp = new ResponseEntity();
    co(function*() {
        var {uid,type,name,cls,pro} = req.query;
        //default to get all users
        var query = {};
        if (uid) {
            if (ObjectID.isValid(uid)) {
                var objectId = new ObjectID(uid);
                query = {_id: objectId};
                if (uid && type) {  //按用户类型查询所有用户
                    query = {_id: objectId, type: type};
                } else if (uid && name && type) { //按类别，姓名查询用户
                    query = {_id: objectId, name: name, type: type};
                } else if (uid && cls && type) {  //按类别，班级查询用户
                    query = {_id: objectId, cls: cls, type: type};
                } else if (uid && pro && type) { //按类别，专业查询用户
                    query = {_id: objectId, pro: pro, type: type}
                } else if (uid && pro && cls && type) { // 按类别，专业，班级查询用户
                    query = {_id: objectId, pro: pro, type: type, cls: cls};
                }
            } else {
                resp.setStatusCode(1);
                resp.setMessage("uid格式不正确");
                res.json(resp);
                return;
            }
        }
        var result = yield userManage.find(query);
        resp.setData(result);
        resp.setStatusCode(0);
        res.json(resp);
    }).catch((err)=>{
        resp.setMessage(err);
        resp.setStatusCode(1);
        res.json(resp);
    });
});
router.put('', function (req, res) {
    //update user infomation
    var resp = new ResponseEntity();
    co(function *() {
        var {uid,type} = req.body;
        if (ObjectID.isValid(uid) && type) {
            if (type == 'student') {
                //学生信息修改
                var {uid,cls,name,sex,stuid,pro} = req.body;
                var user = {uid: uid, cls: cls, name: name, sex: sex, stuid: stuid, pro};
                userManage.update({_id: new ObjectID(id)}, user);
            } else if (type == 'teacher') {
                //教师信息修改
            } else if (type == 'instruct') {
                //教学管理者修改
            }
            resp.setStatusCode(0);
        } else {
            resp.setStatusCode(1);
            resp.setMessage("uid格式不正确或没有提供用户类型");
        }
        res.json(resp);
    }).catch((err)=>{
        resp.setMessage(err);
        resp.setStatusCode(1);
        res.json(resp);
    });
});
router.post('', function (req, res) {
    //register user
    var resp = new ResponseEntity();
    co(function *() {
        var {username,password,type,email} = req.body;
        if (Valid.validEmail(email)) {
            var person = {username: username, password: password, type: type, email: email};
            userManage.add(person, function (inserted) {
                if (inserted.err) {
                    resp.setMessage(inserted.err);
                    resp.setStatusCode(1);
                } else {
                    resp.setStatusCode(0)
                    resp.setData(inserted.id);
                }
                res.json(resp);
            });
        } else {
            resp.setStatusCode(1);
            resp.setMessage("邮箱格式不正确");
            res.json(resp);
        }
    }).catch((err)=>{
        resp.setMessage(err);
        resp.setStatusCode(1);
        res.json(resp);
    });
});
router.delete('', function (req, res) {
    //delete user
})
router.post('/login',multipartMiddleware, function (req, res) {
    var resp = new ResponseEntity();
    co(function *() {
        //var uid = req.body.uid;
        //var pw = req.body.pw;
        //var type = req.body.type;
        var {uid,pw,type} = req.body;
        if (uid && pw && type) {
            var query = {username: uid, password: pw, type: type};
            var result = yield userManage.find(query);
            if (result.length>0) { // 登录成功
                resp.setStatusCode(0);
                resp.setMessage('登录成功');
            } else {
                resp.setMessage('用户名或密码错误');
                resp.setStatusCode(1);
            }
        } else {
            resp.setMessage("用户名,密码,用户类型不能为空");
            resp.setStatusCode(1);
        }
        res.json(resp);
    }).catch((err)=>{
        resp.setMessage(err);
        resp.setStatusCode(1);
        res.json(resp);
    });
})
module.exports = router;
