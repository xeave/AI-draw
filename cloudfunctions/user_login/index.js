// cloudfunctions/user_login/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const usersCollection = db.collection('users')

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext
  const { userInfo } = event

  try {
    // 查询用户是否存在
    const checkUser = await usersCollection.where({
      _openid: OPENID
    }).get()

    if (checkUser.data.length > 0) {
      // 用户存在，更新最后登录时间
      const userId = checkUser.data[0]._id
      const updateData = {
        lastLoginTime: db.serverDate()
      }
      
      // 只有当传入了 userInfo 时才更新用户信息
      if (userInfo) {
        updateData.userInfo = userInfo
      }

      await usersCollection.doc(userId).update({
        data: updateData
      })
      return {
        code: 0,
        message: 'login success',
        data: {
          ...checkUser.data[0],
          // 如果传入了新的 userInfo，返回新的；否则返回数据库中已有的
          userInfo: userInfo || checkUser.data[0].userInfo
        }
      }
    } else {
      // 用户不存在，创建新用户
      const newUser = {
        _openid: OPENID,
        userInfo: userInfo,
        createTime: db.serverDate(),
        lastLoginTime: db.serverDate()
      }
      const addResult = await usersCollection.add({
        data: newUser
      })
      return {
        code: 0,
        message: 'register success',
        data: {
          ...newUser,
          _id: addResult._id
        }
      }
    }
  } catch (err) {
    console.error(err)
    return {
      code: -1,
      message: 'login failed',
      error: err
    }
  }
}
