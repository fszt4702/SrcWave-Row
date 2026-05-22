// 注意替换成你的本地 IP
const API_HOST = "http://127.0.0.1:5000"; 

Page({
  data: {
    tasks: [],
    ai_reply: "欢迎使用！你可以点击下方按钮向我反馈突发状况，或点击右上角手动增删日程。",
    hw_status: "FOCUS", 
    status_text: "专注模式 (蓝光)",
    inputValue: "",
    
    // 自定义日程表单数据
    showAddModal: false,
    newTaskTime: "",
    newTaskName: "",
    newTaskTag: ""
  },

  onLoad() {
    this.fetchTasks();
  },

  fetchTasks() {
    wx.request({
      url: `${API_HOST}/api/tasks`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) this.setData({ tasks: res.data });
      }
    });
  },

  // ===== 自定义日程：新增 =====
  openAddModal() {
    this.setData({ showAddModal: true, newTaskTime: "", newTaskName: "", newTaskTag: "" });
  },

  closeAddModal() {
    this.setData({ showAddModal: false });
  },

  submitNewTask() {
    const { newTaskTime, newTaskName, newTaskTag } = this.data;
    if (!newTaskTime || !newTaskName) {
      wx.showToast({ title: '时间和名称必填哦', icon: 'none' });
      return;
    }
    
    wx.showLoading({ title: '添加中...' });
    wx.request({
      url: `${API_HOST}/api/task/add`,
      method: 'POST',
      data: { time: newTaskTime, name: newTaskName, tag: newTaskTag || "日常" },
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({ tasks: res.data.tasks, showAddModal: false });
          wx.showToast({ title: '添加成功', icon: 'success' });
        }
      },
      complete: () => wx.hideLoading()
    });
  },

  // ===== 自定义日程：删除 =====
  onDeleteTask(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除确认',
      content: '确定要移除这项日程吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `${API_HOST}/api/task/delete`,
            method: 'POST',
            data: { id: id },
            success: (apiRes) => {
              if (apiRes.statusCode === 200) this.setData({ tasks: apiRes.data.tasks });
            }
          });
        }
      }
    });
  },

  // ===== 原有 AI 交互逻辑保持不变 =====
  onShortcut(e) {
    this.sendToAgent(e.currentTarget.dataset.text);
  },

  onSend(e) {
    const text = e.detail.value;
    if (!text.trim()) return;
    this.sendToAgent(text);
    this.setData({ inputValue: "" });
  },

  onReset() {
    wx.showLoading({ title: '重置中...' });
    wx.request({
      url: `${API_HOST}/api/reset`,
      method: 'POST',
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({
            tasks: res.data.tasks,
            ai_reply: "日程已重置！", hw_status: "FOCUS", status_text: "专注模式 (蓝光)"
          });
        }
      },
      complete: () => wx.hideLoading()
    });
  },

  sendToAgent(userInput) {
    wx.showLoading({ title: '大脑运算中...' });
    wx.request({
      url: `${API_HOST}/api/adjust`,
      method: 'POST',
      data: { input: userInput },
      success: (res) => {
        if (res.statusCode === 200) {
          const data = res.data;
          let statusText = "专注模式 (蓝光)";
          if (data.hardware_cmd === "RELAX") statusText = "舒缓模式 (黄光)";
          if (data.hardware_cmd === "SLEEP") statusText = "休眠模式 (微光)";
          this.setData({
            ai_reply: data.reply, tasks: data.updated_tasks,
            hw_status: data.hardware_cmd, status_text: statusText
          });
        }
      },
      complete: () => wx.hideLoading()
    });
  }
});