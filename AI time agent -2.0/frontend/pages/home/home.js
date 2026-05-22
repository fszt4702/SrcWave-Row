const app = getApp();

Page({
  data: {
    tasks: [],
    statusBarHeight: 44,
    showAddTask: false,
    newTaskTitle: '',
    newTaskTime: ''
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 44 });
  },

  onShow() {
    this.setData({ tasks: app.globalData.tasks });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
  },

  // 唤起新增弹窗
  showAddTask() {
    this.setData({ 
      showAddTask: true, 
      newTaskTitle: '', 
      newTaskTime: '' 
    });
  },

  // 隐藏新增弹窗
  hideAddTask() {
    this.setData({ showAddTask: false });
  },

  // 监听输入
  onTitleInput(e) { this.setData({ newTaskTitle: e.detail.value }); },
  onTimeInput(e) { this.setData({ newTaskTime: e.detail.value }); },

  // 确认添加日程
  confirmAddTask() {
    const title = this.data.newTaskTitle.trim();
    const time = this.data.newTaskTime.trim();
    
    if(!title || !time) {
      wx.showToast({ title: '请填写完整名称和时间', icon: 'none' });
      return;
    }

    const tasks = this.data.tasks;
    // 生成新的ID
    const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    
    const newTask = {
      id: newId,
      title: title,
      time: time,
      status: '待办',
      color: 'blue' // 默认给个蓝色标签
    };

    tasks.push(newTask);
    app.globalData.tasks = tasks; // 同步给全局，让AI也能读取到

    this.setData({ tasks, showAddTask: false });
    wx.showToast({ title: '添加成功', icon: 'success' });
  },

  // 删除日程
  deleteTask(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除日程',
      content: '确定要删除这项日程吗？',
      confirmColor: '#ef4444',
      success: (res) => {
        if (res.confirm) {
          const tasks = this.data.tasks.filter(t => t.id !== id);
          app.globalData.tasks = tasks; // 同步给全局
          this.setData({ tasks });
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  }
})