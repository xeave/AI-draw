Page({
  data: {
    isLoggedIn: false,
    userInfo: {
      nickName: '未登录',
      avatarUrl: ''
    },
    myGallery: [
      { id: 101, image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=400', user: 'Me', desc: 'My first generation', date: '2023-10-20' },
      { id: 102, image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400', user: 'Me', desc: 'Cat', date: '2023-10-21' },
      { id: 103, image: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?q=80&w=400', user: 'Me', desc: 'Cyberpunk', date: '2023-10-22' },
      { id: 104, image: 'https://images.unsplash.com/photo-1472457897821-70d3819a0e24?q=80&w=400', user: 'Me', desc: 'Lake', date: '2023-10-23' }
    ]
  },
  onLogin() {
    // Simulate WeChat login or use wx.getUserProfile if available
    // Since this is a prototype, we'll just mock the success state
    this.setData({
      isLoggedIn: true,
      userInfo: {
        nickName: '微信用户',
        avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
      }
    });
  }
});
