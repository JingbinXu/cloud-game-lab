#!/bin/bash
# 首次部署脚本 - 在服务器上执行一次即可
# 用法: ssh ubuntu@122.51.188.168 'bash -s' < setup-server.sh

set -e

APP_DIR="/home/ubuntu/resume-mvp"
BACKEND_DIR="$APP_DIR/backend"

echo "=== 1. 创建目录 ==="
sudo mkdir -p /var/www/resume-mvp
sudo chown ubuntu:ubuntu /var/www/resume-mvp

echo "=== 2. 安装 nginx 配置 ==="
sudo cp "$APP_DIR/deploy/nginx-resume-mvp.conf" /etc/nginx/sites-enabled/resume-mvp
sudo nginx -t && sudo systemctl reload nginx

echo "=== 3. 创建 Python 虚拟环境 ==="
cd "$BACKEND_DIR"
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

echo "=== 4. 配置 systemd 服务 ==="
sudo cp "$APP_DIR/deploy/resume-mvp-backend.service" /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable resume-mvp-backend
sudo systemctl start resume-mvp-backend

echo "=== 5. 配置防火墙（开放 8888 端口）==="
sudo ufw allow 8888/tcp 2>/dev/null || true

echo "=== 部署完成 ==="
echo "前端: http://122.51.188.168:8888"
echo "后端: http://122.51.188.168:8888/api/"
echo ""
echo "别忘了配置 .env 文件:"
echo "  nano $BACKEND_DIR/.env"
