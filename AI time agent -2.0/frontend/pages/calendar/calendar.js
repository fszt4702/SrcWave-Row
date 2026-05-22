const app = getApp();
Page({
  data: {
    statusBarHeight: 44,
    days: ['一', '二', '三', '四', '五', '六', '日'],
    dates: [23, 24, 25, 26, 27, 28, 29],
    selectedDate: 24,
    tasks: []
  },
  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 44 });
  },
  onShow() {
    this.setData({ tasks: app.globalData.tasks });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
  },
  selectDate(e) {
    this.setData({ selectedDate: e.currentTarget.dataset.date });
  }
})