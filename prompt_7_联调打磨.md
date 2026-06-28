对已有的 index.html 进行最终的联调打磨。请仔细检查并修复以下所有问题。

【1. 全局状态管理】
确保以下全局变量和函数正确声明且无冲突：
- currentPet：当前宠物信息
- healthData / shoppingListData / calendarData：各Tab的AI生成数据
- 各Tab的数据生成状态标记（是否已生成），避免重复调用AI

【2. Tab切换逻辑】
- 点击Tab时：切换active样式 + 显示对应内容区 + 隐藏其他内容区
- 首次进入某Tab时触发AI数据生成
- 已生成过的Tab直接显示缓存数据

【3. 错误处理】
- AI调用失败：显示友好提示 + "重新生成"按钮
- 网络断开：同上
- API Key未填写：在页面顶部显示黄色提示条"请先配置AI API Key"，并提供一个设置按钮，点击弹出模态框填写apiKey，保存到localStorage

【4. Loading状态】
- 每个Tab的AI生成过程都有独立的loading动画
- Loading文字根据Tab不同而不同：
  - 健康评估："AI正在分析毛球的健康状况..."
  - 采购清单："AI正在为毛球挑选必需品..."
  - 全年日历："AI正在规划毛球的全年健康计划..."

【5. 动画与过渡】
- 视图1→视图2切换：整体左滑消失+右滑出现
- Tab内容切换：淡入效果
- 所有卡片首次出现：从下方20px淡入上滑
- 按钮点击：scale(0.97)微缩回弹

【6. 响应式检查】
- 确保在375px宽度的手机上所有内容正常显示
- 表单在手机端全宽
- Tab栏在手机端可横向滚动
- 采购清单和使用指南在手机端单列

【7. localStorage完整功能】
- furball_pet：宠物档案
- furball_health / furball_shopping / furball_calendar：各Tab缓存数据（AI返回结果也存入，下次打开直接读取，除非用户点"重新生成"）
- furball_shopping_checked：已勾选的采购物品
- furball_calendar_done：已完成的日历事项
- furball_api_key：用户填写的API Key
- 页面加载时检查localStorage，有缓存数据则跳过录入页直接进入方案页

【8. 免责声明】
- 方案页底部固定显示免责声明
- 每个Tab内容区顶部也有一行小字提醒

【9. 代码清理】
- 删除所有console.log
- 确保无未使用的变量和函数
- HTML结构语义化（header/main/section/footer）
- 所有中文文案无错别字

请输出修改后的完整 index.html 文件。