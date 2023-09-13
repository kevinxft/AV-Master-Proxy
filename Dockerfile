# 使用官方 Node.js 镜像的 Alpine 版本作为基础镜像
FROM node:18

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json 文件
COPY package*.json ./

# 安装项目依赖
RUN npm install

# 复制应用程序代码到镜像中
COPY . .

# 暴露应用程序需要的端口
EXPOSE 7777

# 启动应用程序
CMD ["npm", "start"]
