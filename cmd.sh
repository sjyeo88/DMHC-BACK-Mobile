sudo npm install
sudo docker build --tag express-mobile .
sudo docker run -i -p 3001:3001 --name express-mobile --volume /var/dmhc/assets:/app/assets  --link db-vol express
