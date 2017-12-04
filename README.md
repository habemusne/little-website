# hehe

> Nuxt.js project

## Build Setup

``` bash
# install dependencies
$ npm install # Or yarn install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, checkout the [Nuxt.js docs](https://github.com/nuxt/nuxt.js).

# New server setup (AWS EC2 CentOS/RDHL Fedora)
sudo yum install git
sudo /bin/dd if=/dev/zero of=/var/swap.1 bs=1M count=2048
sudo /sbin/mkswap /var/swap.1
sudo chmod 600 /var/swap.1
sudo /sbin/swapon /var/swap.1
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh | bash
. /home/ec2-user/.bashrc
nvm install 6.9.5

cd little-website
npm i
npm i nuxt -g
screen -S and then nuxt

sudo yum instal nginx
edit /etc/nginx/nginx.conf to have my domain
sudo chmod -R 777 /var/log/nginx/

sudo wget https://dl.eff.org/certbot-auto
sudo chmod a+x certbot-auto
sudo mv certbot-auto /usr/bin
sudo /usr/bin/certbot-auto --nginx

sudo crontab -e : 15 3 * * * /usr/bin/certbot-auto renew --quiet


