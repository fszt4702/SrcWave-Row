const app = getApp();
Page({
  data: {
    statusBarHeight: 44,
    userInfo: {}
  },
  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ 
      statusBarHeight: sysInfo.statusBarHeight || 44,
      userInfo: app.globalData.userInfo 
    });
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
  }
})