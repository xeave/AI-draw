Component({
  properties: {
    value: {
      type: String,
      value: 'home'
    }
  },
  methods: {
    onChange(e: any) {
      const value = e.detail.value;
      if (value === this.data.value) return;
      
      if (value === 'home') {
        wx.redirectTo({ url: '/pages/home/home' });
      } else if (value === 'profile') {
        wx.redirectTo({ url: '/pages/profile/profile' });
      }
    }
  }
});
