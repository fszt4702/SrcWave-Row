Component({
  data: {
    selected: 0,
    list: [
      { pagePath: '/pages/home/home', text: '首页', icon: 'home' },
      { pagePath: '/pages/calendar/calendar', text: '日历', icon: 'calendar' },
      { pagePath: '/pages/ai/ai', text: 'AI助手', icon: 'ai' },
      { pagePath: '/pages/profile/profile', text: '我的', icon: 'profile' }
    ]
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      wx.switchTab({ url });
    }
  }
})