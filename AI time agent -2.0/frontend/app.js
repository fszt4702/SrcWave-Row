App({
  globalData: {
    tasks: [
      { id: 1, title: '上午专业必修课', time: '08:00-10:00', status: '已完成', color: 'slate' },
      { id: 2, title: '图书馆自习刷题', time: '14:00-16:30', status: '进行中', color: 'blue' },
      { id: 3, title: '部门临时例会', time: '19:00-20:00', status: '待开始', color: 'orange' }
    ],
    userInfo: {
      nickname: '灵动用户',
      tag: '大学生时间管理实践者'
    }
  },
  updateTaskTime(taskId, newTime) {
    const tasks = this.globalData.tasks;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.time = newTime;
    }
  }
})