# What is this

This is a project demo website builder. It specializes in demonstraing a software developer's past and current projects, and probably there's nothing else it can do.

For a software developer, this is extremely easy to use --- what you need to do is to only modify `static/projects.json`. The difficult part is on setting up the server.

Demo: https://habemusne.com

# Usage

- First of all, have your own domain and your server ready. In my case, I bought the domain from GoDaddy.com and then I use AWS Route53 to setup the routing. There are plenty of articles on how to do it so I will not mention the procedure here. For example you may visit [this article](https://blog.vizuri.com/setting-up-godaddy-and-route53-with-ghost-blogger) for the procedure.

- Then setup your server. I have my memo on the setup process at the end of this README. But it's just for my own case: I use a t2.nano instance with CentOS/RDHL Fedora on AWS. Make sure you make proper adjustments if you use a different setup.

- Run the following commands

```
cd little-website
npm i
npm i pm2 -g
npm run build

# -s is to run spa mode
# If you have concerns about browser incompatibility,
#   you may want to remove this flag in order to use ssr.
# Keep in mind that pm2 is resource demanding.
# My t2.nano could not afford it so I opened up a screen and ran npm start -s instead.
# If you have a good machine you may use pm2,
#   so that you can alleviate the worry of random failing of the running process
pm2 start npm --name "website" -- start -s
```

- Finally, modify `static/projects.json` to have your own projects

# My server's setup script

```
sudo yum install git -y

# Add virtual memory
sudo /bin/dd if=/dev/zero of=/var/swap.1 bs=1M count=2048
sudo /sbin/mkswap /var/swap.1
sudo chmod 600 /var/swap.1
sudo /sbin/swapon /var/swap.1

# Install NPM
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh | bash
. /home/ec2-user/.bashrc
nvm install 9.2.1

# Install nginx and https
# Please know that the code below is specifically for CentOS/RDHL Fedora.
# The certbot doesn't have updated installation doc for this distribution,
#   and this is what I figured out myself.
# In other distributions, I believe certbot has more integrated solution.
sudo yum instal nginx
edit /etc/nginx/nginx.conf to have my domain
sudo chmod -R 777 /var/log/nginx/
sudo wget https://dl.eff.org/certbot-auto
sudo chmod a+x certbot-auto
sudo mv certbot-auto /usr/bin
sudo /usr/bin/certbot-auto --nginx

# cronjob for updating https certificate
sudo crontab -e : 15 3 * * * /usr/bin/certbot-auto renew --quiet
```

