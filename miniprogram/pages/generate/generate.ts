Page({
  data: {
    prompt: '',
    loading: false
  },
  onInputChange(e: any) {
    this.setData({ prompt: e.detail.value });
  },
  onGenerate() {
    if (!this.data.prompt) return;
    this.setData({ loading: true });
    // Simulate API call
    setTimeout(() => {
      this.setData({ loading: false });
      wx.navigateTo({
        url: `/pages/detail/detail?prompt=${encodeURIComponent(this.data.prompt)}`
      });
    }, 2000);
  },
  onBack() {
    wx.navigateBack();
  }
});
