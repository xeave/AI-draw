文生图 小程序


提示词

样式：
使用 HTML + Tailwind CSS（或 Bootstrap）开发所有原型界面。并且使用TDesgin的设计风格
代码结构：
每个界面以独立 HTML 文件形式存储，例如 home.html、profile.html、settings.html 等。
index.html 作为主入口，不直接包含所有界面的完整代码，而是通过 <iframe> 嵌入各界面文件，并在 index 页面中平铺展示所有页
面，避免使用链接跳转。
真实感增强：
界面尺寸需模拟iPhone 15 Pro的屏幕规格，并应用圆角设计，以贴近真实移动设备的外观。


1. 请你参考
image.html
前端页面
create-image.html|
<>
generated-image.html
home.html
profile-not-logged.html
• prd.md
@prototype
下的所有页面，包括 @create-image.html
@generated-
@home.html
@profile-logged.html @profile-not-logged.html 完成小程序的
2. 文档参考
@prd.md
3. 全部使用TDeisgn的组件库



完成真实的用户登录注册功能，基于云开发的方式。云开的envld



根据该文档，帮我完成后端文生图的接入：
1. 帮我编写对应的调用阿里云生成文生图的云函数，采用wanx2.1-t2i-plus模型，APL_KEY对应的是环
境变量里面的DASHSCOPE_APL_KEY
2. 帮我编写小程序调用对应的云函数的逻辑，实现文生图的接入工作。云函数采用不同的name字段来实
现不同的请求逻辑。只创建一个云函数来实现这个需求
3. 只完成创建和结果查看就好，以及重新生成的逻辑。不需要写写发布功能的逻辑



帮我完成作品发布功能，要求：
1.编写一个云函数，前端上传对应的生成的图片和提示词，云函数中需要获取图片链接并且保存到我们的
云存储中，放在目录/images
2. 将云存储返回的图片地址，提示词，用户的相关信息，放到我们的数据集images/下
3. 在【我的】页面，获取用户发布的真实的数据



帮我完成首页数据的接入工作，要求：
1.编辑一个云函数，能够获取到所有用户发布的图片，并且需要在底部显示用户的头像和用户名
2. 获取到的图片，根据发布时间倒序
3. 能够实现滚动加载的逻辑