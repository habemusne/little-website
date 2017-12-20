# What is this

This is a project demo website builder. It specializes in demonstraing a software developer's past and current projects, and probably there's nothing else it can do.

For a software developer, this is extremely easy to use --- what you need to do is to only modify `static/projects.json`. The difficult part is on setting up the server.

Demo: https://habemusne.com/projects

# Usage

I personally use the AWS EC2 server. If you choose other server providers like DigitalOcean and Heroku, you may skip Step 1, Step 2, and Step 4.

- Step 1: First of all, have your own domain and your server ready. In my case, I bought the domain from GoDaddy.com and then I use AWS Route53 to setup the routing. There are plenty of articles on how to do it so I will not mention the procedure here. For example you may visit [this article](https://blog.vizuri.com/setting-up-godaddy-and-route53-with-ghost-blogger) for the procedure.

- Step 2: Then setup your server. I have my memo on the setup process at the end of this README. But it's just for my own case: I use a t2.small instance with ubuntu on AWS. Make sure you make proper adjustments if you use a different setup.

- Step 3: Run the following commands

```
cd little-website
npm i # this is very slow. you can use npm set progress=false to speed up
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

- Step 4:

Make sure you can access your website through your server's IP address. Then run
```
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

- Step 5:

Finally, `cp static/projects_template.json static/projects.json`, and then modify `static/projects.json` to have your own projects

# My server's setup script

```
sudo apt-get install git -y

# Add virtual memory
sudo /bin/dd if=/dev/zero of=/var/swap.1 bs=1M count=2048
sudo /sbin/mkswap /var/swap.1
sudo chmod 600 /var/swap.1
sudo /sbin/swapon /var/swap.1

# Install NPM
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh | bash
. /home/ubuntu/.bashrc
nvm install 9.2.1

# Install nginx and https
# The following steps are from this article: https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-16-04
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install python-certbot-nginx

# In the following step, please modify the file to contain the following lines:
# server {
#   ...
#   server_name  yourdomain.com www.yourdomain.com;
#   location / {
#       proxy_pass http://127.0.0.1:3000;
#   }
#   ...
# }
sudo vim /etc/nginx/sites-available/default

# And then check if your nginx file looks good. If it's not, please keep modifying the above file until it says ok
sudo nginx -t

sudo systemctl reload nginx
sudo ufw allow 'Nginx Full'
sudo ufw delete allow 'Nginx HTTP'
sudo ufw allow 'OpenSSH'
sudo ufw enable
```
