1. **Vagrant IP, RAM AND CPU**

    Vagrant global-status may show status of vm incorrect so mostly get status from under vm directory
    Vagrant global-status  --prune(Provide crt information) but recommed under directory


Vagrant automation using Vscode

1. Make gitbash as default terminal for vscode(ctrl+shift+p) --> Termianl select defaulyt profile --> gitbash (for macOs no need anything)


VM CREATED CheckList

ip addr show -- it show private and public network
cat /proc/cpuinfor  -- it show information about cpus

2. **VAGRANT SYNC-DIRECTORIES**(IMPORTANT CONCEPTS)

**HOST MACHINES** 
host machines nothing but laptop& cpu
**GUEST MACHINES**
Guest was vm

We Sync directories between VM and Local Folder Using below commad
  # config.vm.synced_folder "../data", "/vagrant_data"

3. **PROVISIONING**  (In general Bootstraping)
    executing command after when os comesup after the boot firstup time boot
    EXAMPLE: INSTALL REQUIRED PACKAGES FOR VM. install python like that

When vagrant up first it do what are things defined in provisioning not all time if you want to add something in provisionig use vagrant reload --provisioning like that then it donwload that

**WE CAN HOST WEBISTE BELOW THE DOC FOR HOW THAT WORK**

Here’s how it works step by step 👇

1. **Vagrant creates a VM** — When you run `vagrant up`, it launches a virtual machine using the box you defined (like CentOS or Ubuntu).
    
2. **Private network is configured** —  
    The line in your `Vagrantfile`:
    
    `config.vm.network "private_network", ip: "192.168.56.10"`
    
    tells Vagrant to create a _host-only network_.  
    This gives the VM its own IP (`192.168.56.10`), accessible only from your host system (not public internet).
    
3. **Apache (httpd) starts serving** —  
    The commands:
    
    `systemctl start httpd systemctl enable httpd`
    
    start the Apache web server and ensure it auto-starts after reboot. Apache listens for HTTP requests on **port 80**.
    
4. **Firewall is disabled** —
    
    `systemctl stop firewalld systemctl disable firewalld`
    
    This allows external connections (like from your host) to reach Apache without being blocked by the VM’s firewall.
    
5. **Host accesses VM’s web server** —  
    When you open `http://192.168.56.10` on your host’s browser, the request travels through the private network adapter (created by VirtualBox/Vagrant) into the VM.
    
6. **Apache responds** —  
    Apache receives the HTTP request, looks for files in `/var/www/html`, and sends the web page (like the “It works!” page or your custom `index.html`) back to your browser.


SERVER MANGEMENT

1. Centos => Httpd
2. Ubuntu => LAMP apache, Mysql, php and word template

SETUP

1.Create new folder
2.get available image vagrant box list
3.copy image under folder create file using   vagrant init  --image
4.set private network and un comment both private and public network
5.change hostname once vm created
6.sudo -i -- go to root user
7.vi /etc/hostname  --this used to termianl prefix was changed
8.hostname finance
9.exit
10.yum install httpd wget vim unzip zip -y


Multivm setup


**Apache tomcat**
## 🧱 1. What they are

### 🔹 Apache HTTP Server (often just called _Apache_)

- **Type:** Web server
    
- **Main use:** Serves **static content** and simple dynamic pages (via PHP, CGI, etc.)
    
- **Examples of what it serves:**
    
    - HTML files
        
    - CSS, JS
        
    - Images, PDFs
        
    - PHP pages (with PHP module)
        

Think of Apache as:

> “I give you files over HTTP when the browser asks.”

---

### 🔹 Apache Tomcat

- **Type:** Application server / Servlet container
    
- **Main use:** Runs **Java web applications**
    
- **Supports:**
    
    - Servlets
        
    - JSP (JavaServer Pages)
        
    - Java web frameworks (Spring MVC, JSF, etc.)
        

Think of Tomcat as:

> “I run your **Java code** and generate responses dynamically.”

---

## ⚙️ 2. Technology focus

- **Apache HTTP Server**
    
    - Not Java-specific
        
    - Works with **PHP, Python (CGI), static sites**, etc.
        
    - Good for normal websites, blogs, static content, WordPress, etc.
        
- **Tomcat**
    
    - **Java-focused only**
        
    - Designed to handle requests mapped to servlets/JSP
        
    - Used in enterprise apps, backend APIs written in Java
        

---

## 🌐 3. Typical architecture (used together)

Many production setups use **both**:

- **Apache HTTP Server in front** (as reverse proxy)
    
    - Handles static files
        
    - SSL termination (HTTPS)
        
    - Load balancing
        
- **Tomcat at the back**
    
    - Handles dynamic Java requests: `/app`, `/api`, etc.
        

Flow:  
👉 Browser → Apache → Tomcat → Apache → Browser

---

## 🚀 4. When to use what?

### Use **Apache HTTP Server** when:

- You host:
    
    - Static websites
        
    - PHP apps (WordPress, Laravel, etc.)
        
- You need:
    
    - High-performance static file serving
        
    - Basic reverse proxying / load balancing
        

### Use **Tomcat** when:

- You host:
    
    - Java web apps (WAR files)
        
    - Java-based APIs (Spring Boot deployed as WAR)
        
- You need:
    
    - Servlet/JSP support
        

---

## 📝 Quick comparison table

|Feature|Apache HTTP Server|Apache Tomcat|
|---|---|---|
|Type|Web server|Java app server / servlet container|
|Language focus|Generic (PHP, CGI, etc.)|Java (Servlets, JSP)|
|Static files|✅ Excellent|✅ Can, but not ideal|
|Java support|❌ No (by default)|✅ Designed for it|
|Common use|Websites, blogs, reverse proxy|Java enterprise apps, APIs|


NEED CENTOS 
1. Check this is centos -- cat /etc/os-release
2. dnf install httpd
3. ls /usr/lib/systemd/system/   -- it show all files inculde httpd.service
4. cat /user/lib/systemd/system/httpd.service-- it run the httpd when we start this ExecStart=/usr/sbin/httpd $OPTIONS -DFOREGROUND -- this was execute
5. ls /etc/httpd --configuration files here
6. ls /var/log/httpd -- logs show here
7. dnf install wget
8. wget https://dlcdn.apache.org/tomcat/tomcat-10/v10.1.49/bin/apache-tomcat-10.1.49.tar.gz 
9. tar xzvf apache-tomcat
10. cd aapche/bin  -- this folder have start.sh file for run tomcat
11. ps -ef | grep tomcat -- this show tomcat was running
12. ip addr show -- get ipaddress ip:8080  -- this website

when ever app was reboot tomcat should start default we need to start manully same as for stop so we need script for that we assign new user for that

useradd --home-dir /opt/tomcat --shell /sbin/nologin tomcat -- it add user and set homedirectory
cp -r apache/*  /opt/tomcat --it copy all folder and put tomcat
chown -R tomcat.tomcat /opt/tomcat  -- this user add no need permission to access tomcat  give ownership to tomcat for access