Page({
  data: {
    imageUrl: '',
    prompt: '',
    saving: false
  },
  onLoad(options: any) {
    if (options.imageUrl) {
      this.setData({
        imageUrl: decodeURIComponent(options.imageUrl)
      });
    }
    
    if (options.prompt) {
      this.setData({
        prompt: decodeURIComponent(options.prompt)
      });
    }
  },
  async onSave() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      // Optionally navigate to profile to login
      return;
    }

    this.setData({ saving: true });
    
    try {
      const { imageUrl, prompt } = this.data;
      
      const res: any = await wx.cloud.callFunction({
        name: 'publish_post',
        data: {
          imageUrl,
          prompt,
          userInfo
        }
      });

      if (res.result.code === 0) {
        wx.showToast({ title: '发布成功', icon: 'success' });
        // Navigate to profile
        setTimeout(() => {
            wx.redirectTo({ url: '/pages/profile/profile' });
        }, 1500);
      } else {
        // Check for collection not exist error
        if (res.result.message && res.result.message.includes('-502005')) {
          throw new Error('请先在云开发控制台创建 images 集合');
        }
        throw new Error(res.result.message);
      }

    } catch (err: any) {
      console.error('Publish failed', err);
      wx.showToast({ 
        title: err.message || '发布失败', 
        icon: 'none' 
      });
    } finally {
      this.setData({ saving: false });
    }
  },
  onRegenerate() {
    wx.navigateBack();
  },
  onBack() {
    wx.navigateBack();
  }
});
