import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI

app = Flask(__name__)
CORS(app)

# ====== AI 客户端配置 ======
# 请换回你刚刚测试成功的可用 API_KEY 和 base_url
client = OpenAI(
    api_key="   ",
    base_url="https://api.deepseek.com"
)

SYSTEM_PROMPT = """你是一个拥有极高同理心的AI时间管理智能体。你的任务是接收用户反馈的突发状况或情绪状态，并根据当前日程表(JSON格式)，做出人性化的动态调整。

【调整原则】
1. 如果用户极度疲惫或生病，请果断推迟“高强度”任务（状态改为“已推迟”或替换为“休息”）。
2. 保持时间合理性，不要重叠。
3. 必须在 hardware_cmd 中给出：'FOCUS' (专注蓝灯), 'RELAX' (舒缓黄灯), 'SLEEP' (休眠灭灯)。

【输出要求】仅返回严格的JSON对象，不得有markdown标记：
{
  "reply": "温暖的安慰话及调整理由...",
  "hardware_cmd": "FOCUS" 或 "RELAX" 或 "SLEEP",
  "updated_tasks": [ 调整后的完整列表 ]
}"""


def load_tasks():
    if not os.path.exists("tasks.json"): return []
    with open("tasks.json", "r", encoding="utf-8") as f: return json.load(f)


def save_tasks(tasks):
    with open("tasks.json", "w", encoding="utf-8") as f: json.dump(tasks, f, ensure_ascii=False, indent=2)


@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    return jsonify(load_tasks())


# ====== 新增：添加自定义日程 ======
@app.route('/api/task/add', methods=['POST'])
def add_task():
    new_task = request.json
    tasks = load_tasks()
    # 自动生成递增 ID
    new_id = max([t.get('id', 0) for t in tasks] + [0]) + 1
    new_task['id'] = new_id
    new_task['status'] = '待办'
    tasks.append(new_task)

    # 按照时间字符串做个简单的排序 (如 "08:00")
    tasks.sort(key=lambda x: x.get('time', '99:99'))
    save_tasks(tasks)
    return jsonify({"message": "success", "tasks": tasks})


# ====== 新增：删除日程 ======
@app.route('/api/task/delete', methods=['POST'])
def delete_task():
    task_id = request.json.get("id")
    tasks = load_tasks()
    tasks = [t for t in tasks if t.get('id') != task_id]
    save_tasks(tasks)
    return jsonify({"message": "success", "tasks": tasks})


@app.route('/api/adjust', methods=['POST'])
def adjust_schedule():
    data = request.json
    user_input = data.get("input", "")
    current_tasks = load_tasks()

    prompt_content = f"当前日程表:\n{json.dumps(current_tasks, ensure_ascii=False)}\n\n用户状况:\n\"{user_input}\""
    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt_content}
            ],
            temperature=0.2
        )
        result_text = response.choices[0].message.content.strip()
        if result_text.startswith("```"):
            result_text = result_text.split("\n", 1)[1].rsplit("\n", 1)[0]

        res_data = json.loads(result_text)
        save_tasks(res_data["updated_tasks"])
        return jsonify(res_data)
    except Exception as e:
        print(f"Agent Error: {e}")
        return jsonify({
            "reply": f"大脑连接稍微有点延迟。先深呼吸休息一下吧！",
            "hardware_cmd": "RELAX",
            "updated_tasks": current_tasks
        }), 500


@app.route('/api/reset', methods=['POST'])
def reset_tasks():
    initial_tasks = [
        {"id": 1, "time": "19:00-20:30", "name": "高强度文献阅读与算法推导", "status": "待办", "tag": "硬核学习"},
        {"id": 2, "time": "20:30-22:00", "name": "软件工程项目核心代码编写", "status": "待办", "tag": "代码开发"},
        {"id": 3, "time": "22:00-22:30", "name": "团队日常进度同步会议", "status": "待办", "tag": "团队协作"}
    ]
    save_tasks(initial_tasks)
    return jsonify({"message": "Reset success", "tasks": initial_tasks})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
