from flask import Flask, request, jsonify
import json
from openai import OpenAI
import os

app = Flask(__name__)

# --- 1. 大模型 API 配置 ---
client = OpenAI(
    api_key="",  # 确保这里填了你正确的 API Key
    base_url="https://api.deepseek.com/v1"  # 或 https://open.bigmodel.cn/api/paas/v4 等
)


# --- 2. 数据读取辅助函数 ---
def load_tasks():
    if not os.path.exists("tasks.json"):
        # 如果文件不存在，初始化一些默认数据
        initial_tasks = [
            {"id": 1, "time": "08:00-10:00", "title": "上午专业必修课", "status": "已完成", "color": "slate"},
            {"id": 2, "time": "14:00-16:30", "title": "图书馆自习刷题", "status": "待办", "color": "blue"},
            {"id": 3, "time": "19:00-20:00", "title": "部门临时例会", "status": "待办", "color": "orange"}
        ]
        save_tasks(initial_tasks)
        return initial_tasks
    with open("tasks.json", "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except:
            return []


def save_tasks(tasks):
    with open("tasks.json", "w", encoding="utf-8") as f:
        json.dump(tasks, f, ensure_ascii=False, indent=2)


# --- 3. 核心 System Prompt ---
SYSTEM_PROMPT = """你是一个时间管理智能体。
请根据用户的突发状况，动态调整他们当前的日程表。

【极度重要的数据格式警告】
你必须返回一个严格的 JSON 对象。
`updated_tasks` 数组必须保留原来的对象结构！不能省略字段！
必须包含: id(数字), time(字符串), title(字符串), status(字符串), color(字符串)。

输出JSON格式必须如下：
{
  "reply": "温暖的安慰和调整说明（50字内）",
  "updated_tasks": [
    {"id": 1, "time": "14:00-16:30", "title": "任务名", "status": "已推迟", "color": "slate"},
    ...
  ]
}
注意：只返回 JSON，不要带任何 markdown 标记如 ```json！
"""


@app.route('/api/adjust', methods=['POST'])
def adjust_schedule():
    data = request.json
    user_text = data.get('text', '')

    current_tasks = load_tasks()

    # 构建发给大模型的对话
    prompt_content = f"当前日程表:\n{json.dumps(current_tasks, ensure_ascii=False)}\n\n用户突发状况:\n\"{user_text}\"\n\n请修改日程状态或时间并返回严格JSON。"

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",  # 请根据你用的平台修改模型名称 (如 glm-4-flash)
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt_content}
            ],
            temperature=0.1
        )

        result_text = response.choices[0].message.content.strip()

        # 兜底清洗：防止大模型手贱加上 ```json 前缀
        if result_text.startswith("```"):
            result_text = result_text.split("\n", 1)[1]
            if result_text.endswith("```"):
                result_text = result_text.rsplit("\n", 1)[0]

        # 解析 JSON
        parsed_data = json.loads(result_text)

        # 【双保险容错机制】：只有在真正包含 updated_tasks 且是列表时，才更新保存！
        if "updated_tasks" in parsed_data and isinstance(parsed_data["updated_tasks"], list):
            save_tasks(parsed_data["updated_tasks"])
            return jsonify({
                "reply": parsed_data.get("reply", "我已经帮你调整了日程。"),
                "updated_tasks": parsed_data["updated_tasks"]
            })
        else:
            raise ValueError("大模型未返回 updated_tasks 字段")

    except Exception as e:
        print(f"大模型解析失败: {e}")
        # 如果大模型抽风了，不要让前端数据消失，原样返回老数据，但给一句安慰的话
        return jsonify({
            "reply": "抱歉，我的大脑刚刚走神了... 不过不管发生什么，建议你先休息一下！",
            "updated_tasks": current_tasks
        })


if __name__ == '__main__':
    # 允许局域网内的所有设备访问
    app.run(host='0.0.0.0', port=5000)
