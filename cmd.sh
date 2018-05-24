sudo  docker stop express-mobile
sudo  docker rm express-mobile
sudo npm install
sudo docker build --tag express-mobile .
sudo docker run -p 3001:3001 --name express-mobile --volume /var/dmhc/assets:/app/assets  --link db-vol express-mobile
