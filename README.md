
---

# Localhost Live Cloud

**Localhost Live Cloud** is an open-source web hosting platform designed to transform spare computers into cloud infrastructure, enabling anyone to host their creations. This application relies heavily on Linux-based operating systems.

The platform uses **React** for the frontend and **Rust's Actix Web** for the backend. **Cloudflared** is used as the DNS provider, offering users a public domain free of cost. Each user gets their own container, similar to AWS, allowing multiple computers to work together as a distributed cloud.

## Project Goal

The aim of this project is to connect old, unused computers and create a collaborative cloud environment.

---
# How to use localhost cloud to deploy your projects
[![Watch the video](https://img.youtube.com/vi/YQoJC_bKgwY/0.jpg)](https://youtu.be/YQoJC_bKgwY)

----

# Contributors guide

### STEP 1: Install Linux Distribution

You can use any Linux distribution, but **Ubuntu** or **Debian** is recommended.

### STEP 2: Install Rust

Run the following command in your terminal to install Rust:
```bash
$ curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### STEP 3: Install Node.js and npm

Install Node.js and npm by running these commands:
```bash
$ sudo apt install node
$ sudo apt install npm
```

### STEP 4: Install Incus

#### For Ubuntu 22.04 LTS or older, and Debian:

1. Ensure the `/etc/apt/keyrings` directory exists and download the required key:
   ```bash
   sudo mkdir -p /etc/apt/keyrings
   wget -qO - https://pkgs.zabbly.com/key.asc | sudo tee /etc/apt/keyrings/zabbly.asc
   ```

   If `wget` is not installed:
   ```bash
   sudo apt install wget
   ```

2. Create the source file and edit it with Nano text editor:
   ```bash
   sudo nano /etc/apt/sources.list.d/zabbly-incus-stable.sources
   ```

   In the editor, paste the following:
   ```
   Enabled: yes
   Types: deb
   URIs: https://pkgs.zabbly.com/incus/stable
   Suites: jammy
   Components: main
   Architectures: amd64
   Signed-By: /etc/apt/keyrings/zabbly.asc
   ```

3. Update your APT repository:
   ```bash
   sudo apt update
   ```

4. Install Incus:
   ```bash
   sudo apt install incus
   ```

5. Allow the user to run `sudo incus` without a password:
   ```bash
   sudo visudo
   ```

   Add the following line, replacing `<your_username>` with your actual username:
   ```
   <your_username> ALL=(ALL) NOPASSWD: /usr/bin/incus
   ```

6. Grant sudo privileges for Incus:
   ```bash
   sudo gpasswd --add $USER incus-admin
   ```

#### For Ubuntu 24.04 or Debian 12:

Simply run:
```bash
$ sudo apt update
$ sudo apt install incus
```

### STEP 5: run command below and answer the questions to configure the daemon:

```bash
$ sudo sudo incus admin init
```


### STEP 6: create storage pool

```bash
$ sudo incus storage create server-storage dir
```


### STEP 7: create network pool

```bash
$ sudo incus network incus server-network
```

### STEP 8: Clone the GitHub Repository

```bash
$ git clone https://github.com/TheLocalhostLive/Localhost_Live_Cloud.git
```

### STEP 9: Run the Frontend

```bash
$ cd llc_frontend
$ npm run dev
```

### STEP 10: Run the Backend

```bash
$ cd llc_backend
$ cargo run
```

---
