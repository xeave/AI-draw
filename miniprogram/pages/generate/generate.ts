Page({
  data: {
    prompt: '',
    negativePrompt: '',
    loading: false,
    tags: ['写实', '动漫', '电影感', '梦幻', '水彩', '赛博朋克']
  },
  onInputChange(e: any) {
    this.setData({ prompt: e.detail.value });
  },
  onNegativeInputChange(e: any) {
    this.setData({ negativePrompt: e.detail.value });
  },
  onTagClick(e: any) {
    const tag = e.currentTarget.dataset.tag;
    const currentPrompt = this.data.prompt;
    const newPrompt = currentPrompt ? `${currentPrompt}, ${tag}` : tag;
    this.setData({ prompt: newPrompt });
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
