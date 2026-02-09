Page({
  data: {
    gallery: [
      { id: 1, image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400', user: 'Alice', desc: '一只可爱的白色小猫...' },
      { id: 2, image: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?q=80&w=400', user: 'Bob', desc: '未来赛博朋克城市...' },
      { id: 3, image: 'https://images.unsplash.com/photo-1472457897821-70d3819a0e24?q=80&w=400', user: 'Charlie', desc: '宁静的湖边小屋...' },
      { id: 4, image: 'https://images.unsplash.com/photo-1570018144715-43110363d70a?q=80&w=400', user: 'David', desc: '宇航员漫步火星...' },
      { id: 5, image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=400', user: 'Eve', desc: '水彩画风格的花园...' },
      { id: 6, image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?q=80&w=400', user: 'Frank', desc: '抽象艺术...' }
    ]
  },
  onFabClick() {
    wx.navigateTo({ url: '/pages/generate/generate' });
  }
});
