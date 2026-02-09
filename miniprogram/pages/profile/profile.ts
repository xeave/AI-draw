Page({
  data: {
    isLoggedIn: false,
    userInfo: {
      nickName: '微信用户',
      avatarUrl: ''
    },
    myGallery: []
  },

  onLoad() {
    this.checkLoginStatus();
  },

  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo._openid) {
      this.setData({
        isLoggedIn: true,
        userInfo: userInfo
      });
      // onShow will handle getMyPosts() to avoid double fetch
    } else {
      // 尝试静默登录恢复会话
      this.performSilentLogin();
    }
  },

  performSilentLogin() {
    wx.cloud.callFunction({
      name: 'user_login',
      data: { }, // 不传 userInfo，仅获取数据库中已有信息
      success: (res: any) => {
        if (res.result.code === 0) {
          const dbUser = res.result.data;
          // 如果数据库中有用户信息，则恢复登录状态
          if (dbUser.userInfo && (dbUser.userInfo.avatarUrl || dbUser.userInfo.nickName)) {
            const finalUserInfo = {
              ...dbUser.userInfo,
              _openid: dbUser._openid
            };
            
            this.setData({
              isLoggedIn: true,
              userInfo: finalUserInfo
            });
            wx.setStorageSync('userInfo', finalUserInfo);
            this.getMyPosts();
          }
        }
      },
      fail: (err) => {
        console.log('Silent login failed', err);
      }
    });
  },

  onShow() {
    if (this.data.isLoggedIn && this.data.userInfo._openid) {
      this.getMyPosts();
    }
  },

  getMyPosts() {
    const db = wx.cloud.database();
    const openid = this.data.userInfo._openid;

    if (!openid) {
      console.log('No openid found, skip fetching posts');
      return;
    }

    // 查询当前用户
    db.collection('images')
      .where({
        _openid: openid
      })
      .orderBy('createTime', 'desc')
      .get()
      .then(async (res: any) => {
        console.log('获取到的我的作品:', res.data); 
        
        // 获取所有 fileID
        const fileList = res.data.map((item: any) => item.fileID);
        
        let tempFileMap: any = {};
        if (fileList.length > 0) {
           try {
             const tempRes = await wx.cloud.getTempFileURL({
               fileList: fileList
             });
             tempRes.fileList.forEach((file: any) => {
               tempFileMap[file.fileID] = file.tempFileURL;
             });
           } catch (err) {
             console.error('获取临时链接失败', err);
           }
        }

        const formattedData = res.data.map((item: any) => {
          return {
            ...item,
            id: item._id,
            image: tempFileMap[item.fileID] || item.fileID, // 优先使用 HTTP 链接
            desc: item.prompt,
            date: this.formatDate(item.createTime)
          };
        });
        
        this.setData({
          myGallery: formattedData
        });
      })
      .catch((err: any) => {
        // 如果集合不存在，说明还没有数据，当作空列表处理
        if (err.errCode === -502005) {
          console.log('Images collection not created yet, treating as empty.');
          this.setData({ myGallery: [] });
          return;
        }
        console.error('Fetch posts failed', err);
      });
  },

  formatDate(dateVal: any) {
    if (!dateVal) return '';
    const date = new Date(dateVal);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  },

  // 登录
  onLogin() {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        this.performLogin(res.userInfo);
      },
      fail: (err) => {
        console.log('用户拒绝获取头像昵称', err);
        // 用户拒绝，使用默认信息登录
        this.performLogin(this.data.userInfo);
      }
    });
  },

  performLogin(userInfo: any) {
    wx.showLoading({ title: '登录中...' });
    
    wx.cloud.callFunction({
      name: 'user_login',
      data: { userInfo }, 
      success: (res: any) => {
        wx.hideLoading();
        if (res.result.code === 0) {
          const dbUser = res.result.data;
          // 优先使用云端返回的最新数据（可能包含之前的头像），如果云端没有（新注册）则使用传入的
          // 确保保留 _openid
          const finalUserInfo = {
            ...userInfo,
            ...(dbUser.userInfo || {}),
            _openid: dbUser._openid
          };
          
          this.setData({
            isLoggedIn: true,
            userInfo: finalUserInfo
          });
          wx.setStorageSync('userInfo', finalUserInfo);
          this.getMyPosts(); // Fetch posts after login
          wx.showToast({ title: '登录成功', icon: 'success' });
        } else {
          wx.showToast({ title: '登录失败', icon: 'error' });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('Login failed', err);
        wx.showToast({ title: '网络错误', icon: 'error' });
      }
    });
  },

  // 预览图片
  onPreviewImage(e: any) {
    const current = e.currentTarget.dataset.url;
    const urls = this.data.myGallery.map((item: any) => item.image);
    wx.previewImage({
      current,
      urls
    });
  },

  // 开启创作
  onStartCreate() {
    wx.navigateTo({
      url: '/pages/generate/generate'
    });
  },

  // 更新头像
  onChooseAvatar(e: any) {
    const { avatarUrl } = e.detail;
    
    wx.showLoading({ title: '上传头像...' });
    
    // 上传图片到云存储
    const cloudPath = `avatars/${Date.now()}-${Math.floor(Math.random() * 1000)}.png`;
    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: avatarUrl,
      success: (res) => {
        const fileID = res.fileID;
        const userInfo = { ...this.data.userInfo, avatarUrl: fileID };
        
        this.setData({ userInfo });
        this.updateUserInfo(userInfo);
        wx.hideLoading();
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('Upload failed', err);
        wx.showToast({ title: '上传失败', icon: 'error' });
      }
    });
  },

  // 更新昵称
  onNicknameChange(e: any) {
    const nickName = e.detail.value;
    if (!nickName) return;
    
    const userInfo = { ...this.data.userInfo, nickName };
    this.setData({ userInfo });
    this.updateUserInfo(userInfo);
  },

  // 更新用户信息到数据库和本地缓存
  updateUserInfo(userInfo: any) {
    wx.setStorageSync('userInfo', userInfo);
    
    // 调用云函数更新或直接更新数据库（这里演示直接更新数据库，需权限）
    // 或者再次调用 user_login 更新
    wx.cloud.callFunction({
      name: 'user_login',
      data: { userInfo },
      success: () => {
        console.log('User info updated on cloud');
      }
    });
  }
});
