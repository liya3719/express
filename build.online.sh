echo "========= 进入目录 ========="
cd /data/nat_fe/
echo "========= 拉取分支 ========="
git pull origin online
echo "========= 执行gulp构建 ========="
npm run build:pro
echo "========= 进入到app目录 =========="
cd app/
echo $PWD
echo "========= pm2 start node ========="
pm2 start online.json
echo "========= 重启node进程 ========="
pm2 restart online.json