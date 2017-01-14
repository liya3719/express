echo "=========进入目录========="
cd /data/nat_fe/app
echo "=========拉取分支========="
git pull origin master
echo "=========启动node========="
pm2 start dev.json
echo "=========重启node进程========="
pm2 restart dev.json