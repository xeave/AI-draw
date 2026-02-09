Page({
  data: {
    gallery: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false
  },

  onLoad() {
    this.getPosts(true);
  },

  onPullDownRefresh() {
    this.getPosts(true);
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.getPosts(false);
    }
  },

  onShow() {
    // 每次显示页面时刷新第一页，保证看到最新内容
    // 如果体验不好（滚动位置丢失），可以去掉这里，只保留 onLoad 和 下拉刷新
    this.getPosts(true);
  },

  // 获取作品列表
  async getPosts(reset = false) {
    if (this.data.loading && !reset) return;

    this.setData({ loading: true });

    let currentPage = this.data.page;
    if (reset) {
      currentPage = 1;
      this.setData({ 
        page: 1, 
        hasMore: true,
        // 如果是下拉刷新，不立即清空 gallery 以防闪烁，等数据回来再替换
        // 但为了逻辑简单，这里先不清空，后续替换
      });
    }

    const db = wx.cloud.database();
    const skip = (currentPage - 1) * this.data.pageSize;

    try {
      const res: any = await db.collection('images')
        .orderBy('createTime', 'desc')
        .skip(skip)
        .limit(this.data.pageSize)
        .get();

      console.log(`获取第${currentPage}页作品:`, res.data);

      // 获取所有 fileID（包括图片和头像）
      const fileList: string[] = [];
      res.data.forEach((item: any) => {
        if (item.fileID) fileList.push(item.fileID);
        if (item.userInfo && item.userInfo.avatarUrl && item.userInfo.avatarUrl.startsWith('cloud://')) {
          fileList.push(item.userInfo.avatarUrl);
        }
      });

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
        let avatarUrl = '';
        if (item.userInfo && item.userInfo.avatarUrl) {
          avatarUrl = tempFileMap[item.userInfo.avatarUrl] || item.userInfo.avatarUrl;
        }

        return {
          id: item._id,
          image: tempFileMap[item.fileID] || item.fileID,
          user: (item.userInfo && item.userInfo.nickName) || '匿名用户',
          avatar: avatarUrl,
          desc: item.prompt
        };
      });

      this.setData({
        gallery: reset ? formattedData : this.data.gallery.concat(formattedData),
        page: currentPage + 1,
        hasMore: formattedData.length === this.data.pageSize,
        loading: false
      });

      wx.stopPullDownRefresh();

    } catch (err: any) {
      console.error('Fetch posts failed', err);
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
      
      if (err.errCode === -502005) {
        this.setData({ gallery: [], hasMore: false });
      }
    }
  },

  onPreviewImage(e: any) {
    const current = e.currentTarget.dataset.src;
    const urls = this.data.gallery.map((item: any) => item.image);
    
    wx.previewImage({
      current,
      urls
    });
  },

  onFabClick() {
    wx.navigateTo({ url: '/pages/generate/generate' });
  }
});
