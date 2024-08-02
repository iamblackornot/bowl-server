### mySQL
`SET GLOBAL validate_password.policy = LOW;`

`CREATE USER 'bowlserver'@'localhost' IDENTIFIED BY 'pass';`
`GRANT ALL PRIVILEGES ON *.* TO 'bowlserver'@'localhost';`

### nginx
```
server {
    listen 80;
    server_name posterpresentations.ddns.net;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name posterpresentations.ddns.net;

    ssl_certificate /etc/letsencrypt/live/posterpresentations.ddns.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/posterpresentations.ddns.net/privkey.pem;

    root /apps/bowl-score/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

`sudo nano /etc/nginx/sites-available/bowl-score`
`sudo nano /etc/nginx/sites-enabled/bowl-score`

`sudo systemctl reload nginx`  - restart nginx service
`sudo ln -s  /etc/nginx/sites-available/bowl-score /etc/nginx/sites-enabled/` - link available config to enabled one (reflects available config)
`sudo nginx -t` - check config
`sudo tail -f /var/log/nginx/error.log` - check logs