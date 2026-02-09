Page({
  data: {
    imageUrl: '',
    prompt: '',
    saving: false
  },
  onLoad(options: any) {
    this.setData({
      prompt: decodeURIComponent(options.prompt || ''),
      // Use a random image or a fixed one for demo
      imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=800'
    });
  },
  onSave() {
    this.setData({ saving: true });
    // Simulate save
    setTimeout(() => {
      this.setData({ saving: false });
      wx.showToast({ title: '已保存到相册', icon: 'success' });
    }, 1000);
  },
  onRegenerate() {
    wx.navigateBack();
  },
  onBack() {
    wx.navigateBack();
  }
});
