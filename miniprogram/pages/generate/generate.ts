Page({
  data: {
    prompt: '',
    negativePrompt: '',
    loading: false,
    tags: ['写实', '动漫', '电影感', '梦幻', '水彩', '赛博朋克'],
    isGenerating: false,
    generatedImage: ''
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
  
  // 生成图片
  async onGenerate() {
    if (!this.data.prompt) {
      wx.showToast({ title: '请输入描述', icon: 'none' });
      return;
    }
    
    // loading 控制按钮状态，isGenerating 控制结果区域显示
    this.setData({ loading: true, isGenerating: false, generatedImage: '' });
    
    try {
      console.log('开始调用云函数创建任务...');
      // 1. 创建任务
      const createRes: any = await wx.cloud.callFunction({
        name: 'generate_image',
        data: {
          type: 'create',
          payload: {
            prompt: this.data.prompt,
            negativePrompt: this.data.negativePrompt
          }
        }
      });
      
      console.log('创建任务结果:', createRes);

      if (createRes.result.code !== 0) {
        throw new Error(createRes.result.message || '创建任务失败');
      }
      
      const taskId = createRes.result.data.output.task_id;
      
      // 创建成功，按钮 loading 结束，进入生成状态
      this.setData({ loading: false, isGenerating: true });
      
      // 2. 轮询任务状态
      this.pollTaskStatus(taskId);
      
    } catch (err: any) {
      console.error('生成过程出错:', err);
      this.setData({ loading: false, isGenerating: false });
      wx.showToast({ 
        title: err.message || '生成失败，请重试', 
        icon: 'none',
        duration: 3000
      });
    }
  },
  
  // 轮询任务状态
  pollTaskStatus(taskId: string) {
    let pollCount = 0;
    const maxPollCount = 40; // 最大轮询次数，约 2 分钟

    const pollInterval = setInterval(async () => {
      pollCount++;
      if (pollCount > maxPollCount) {
        clearInterval(pollInterval);
        this.setData({ isGenerating: false });
        wx.showToast({ title: '生成超时，请稍后重试', icon: 'none' });
        return;
      }

      try {
        console.log(`第 ${pollCount} 次轮询任务状态...`);
        const queryRes: any = await wx.cloud.callFunction({
          name: 'generate_image',
          data: {
            type: 'query',
            payload: { taskId }
          }
        });
        
        console.log('轮询结果:', queryRes);

        if (queryRes.result.code !== 0) {
          clearInterval(pollInterval);
          throw new Error(queryRes.result.message || '查询任务失败');
        }
        
        const taskResult = queryRes.result.data.output;
        const status = taskResult.task_status;
        console.log(`当前任务状态: ${status}`);
        
        if (status === 'SUCCEEDED') {
          clearInterval(pollInterval);
          console.log('任务成功详细信息:', taskResult);
          
          // 获取生成的图片URL
          let imageUrl = '';
          if (taskResult.results && taskResult.results.length > 0) {
            imageUrl = taskResult.results[0].url;
          } else if (taskResult.choices && taskResult.choices.length > 0) {
            imageUrl = taskResult.choices[0].message.content[0].image;
          }

          if (imageUrl) {
            this.setData({ 
              isGenerating: false, 
              generatedImage: imageUrl 
            });

            // 跳转到详情页
            wx.navigateTo({
              url: `/pages/detail/detail?imageUrl=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(this.data.prompt)}`
            });
          } else {
             throw new Error('未找到生成的图片URL');
          }
        } else if (status === 'FAILED') {
          clearInterval(pollInterval);
          throw new Error(queryRes.result.data.output.message || '生成任务失败');
        } 
        // PENDING 或 RUNNING 状态继续轮询
        
      } catch (err: any) {
        clearInterval(pollInterval);
        console.error('轮询出错:', err);
        this.setData({ isGenerating: false });
        wx.showToast({ 
          title: err.message || '查询状态出错', 
          icon: 'none' 
        });
      }
    }, 3000); // 每3秒轮询一次
  },

  onBack() {
    wx.navigateBack();
  }
});
