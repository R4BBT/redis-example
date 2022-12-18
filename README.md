# Redis Example

Basic showcase of how to use redis on wsl

1. install redis on linux

   ```
   sudo apt-get update
   sudo apt-get upgrade
   sudo apt-get install redis-server
   ```

2. Change redis configuration file

   ```
   sudo nano /etc/redis/redis.conf
   ```

   Find supervised no line and change to supervised systemd since Ubuntu uses the systemd init system.
   (This is near the beginning of the conf file)

3. Start redis server

   ```
   sudo service redis-server start
   ```

   Redis listens on port 6379 by default

4. Interact with redis through the [redis-cli](https://redis.io/docs/manual/cli) commandline tool

   ```
   redis-cli
   ```

5. Install redis in app
   ```
   npm install redis
   ```
