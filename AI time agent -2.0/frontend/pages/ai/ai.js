const app = getApp();

Page({
  data: {
    statusBarHeight: 44,
    messages: [
      { role: 'ai', content: '我在呢～有什么日程想安排、调整都可以跟我说😊' }
    ],
    inputValue: '',
    scrollToMessage: ''
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 44 });
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
  },

  onInput(e) {
    this.setData({ inputValue: e.detail.value });
  },

  quickAction(e) {
    const text = e.currentTarget.dataset.text;
    this.setData({ inputValue: text });
    this.sendMessage();
  },

  sendMessage() {
    const text = this.data.inputValue.trim();
    if (!text) return;

    const msgs = this.data.messages;
    msgs.push({ role: 'user', content: text });
    this.setData({ messages: msgs, inputValue: '' });
    this.scrollToBottom();

    wx.showLoading({ title: 'Agent思考中...' });

    // 这里调用你的 Python Flask 后端
    wx.request({
      url: 'http://127.0.0.1:5000/api/adjust', // 真机调试时请换成本地网络IP (例如10.30.xxx.xxx:5000)
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: { text: text },
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200 && res.data) {
          const newMsgs = this.data.messages;
          newMsgs.push({ role: 'ai', content: res.data.reply });
          this.setData({ messages: newMsgs });
          this.scrollToBottom();
          
          if(res.data.updated_tasks) {
            getApp().globalData.tasks = res.data.updated_tasks;
            wx.showToast({ title: '日程已自动更新', icon: 'success' });
          }
        } else {
          wx.showToast({ title: '系统连接异常', icon: 'error' });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({ title: 'AI 暂时失联了', icon: 'none' });
        console.error("请求失败", err);
      }
    });
  },

  scrollToBottom() {
    setTimeout(() => {
      const len = this.data.messages.length;
      if (len > 0) {
        this.setData({ scrollToMessage: 'msg-' + (len - 1) });
      }
    }, 100);
  }
})