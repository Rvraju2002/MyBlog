1. Multi Tier Web Application Stack
2. Setup on Laptop/ Desktop
3. Baseline for upcoming Projects
4. Helps you setup any project locally

If we have idea but its lack of confidence for deploy in Live server so we setup in local
but on local it get more time and not repatable maniual setyup is slow

so it should

Automated -->repeatable --> CODE(IAAC)
We cam R & D and implement in Production

TOOLS
1. Hypervisor --->ORACLE VM
2. Automation --> Vagrant
3. CLI--> GIT BASH
4. IDE -- SUBLIME,TEXT,VSCODE

OBJECTIVE
  VM AUTOMATION LOCALLY
  BASELINE FOR UPCOMING PROJECTS
  REAL WORLD PROJECTS SETUPN LOCALLY (FOR R & D)
ARCHIT

ARCHITECTURE OF PROJECT SERVICES

1. NGNIX
2. TOMCAT
3. RABBITMQ
4. MEMCACHED
5. MYSQL

ARCHITECTURE OF AUTOMATED SETUP

1. VAGRANT
2. VIRTUALBOX
3. GITBASH

PROJECT OVERVIEW

VPROFILE IS THE SOCAIL NETWORK WEBAPPLICATION

![[WhatsApp Image 2025-11-17 at 21.48.51.jpeg]]

FLOW OF EXECUTION
1. setup tools mentioned in Prerequisite Video
2. Clone source code
3. cd into the vagrant dir
4. Bring up Vm's
5. Validate
6. Setup all the servers
     a. Mysql
     b. Memcached
     c. RabbitMq
     d. Tomcat
     e. Ngnix
     f. App build & deploy

SETUP
1. clone https://github.com/hkhcoder/vprofile-project.git
2. checkout branch -- origin/local

NOTES:
   1.  When we call any vm with their name it search ip address if not they goes dns
   2. ping app01(vmname) c 4 -- it returns the status of by hitting the ip (if not workig jst just reload)
`vagrant-hostmanager` automatically updates the `/etc/hosts` file on the host and (optionally) on all VMs, adding hostname–IP mappings for every VM, so all machines (host and guests) can communicate with each other using hostnames instead of IPs.

### Your example (multiple VMs)

> “in Vagrantfile 3 IPs are listed with their hostname but each VM doesn't know IPs for others…”

Without hostmanager:

- VM1 only knows its own hostname/IP.
    
- VM2 only knows its own.
    
- VM3 only knows its own.
    
- If VM1 tries to ping `vm2.local`, it fails because there’s no entry for that hostname.
    

With **vagrant-hostmanager**:

- It reads all VMs’ IPs and hostnames from the Vagrantfile.
    
- Then it writes entries like this:
    

`192.168.56.10   vm1 vm1.local 192.168.56.11   vm2 vm2.local 192.168.56.12   vm3 vm3.local`

- On **your host OS** `/etc/hosts` → so you can `ping vm2` from your laptop.
    
- And (if enabled) **inside each VM** → so:
    
    - VM1 can reach VM2 using hostname
        
    - VM2 can reach VM3 using hostname
        
    - VM3 can reach VM1 using hostname
    -

notes: Whenever you create new just check everything uptodate
      may package name and service different check doumentation

MYSQL SETUP:
1. mysql -u root -p  -- it means  -- u  = username and p means password
2. grant all privileges on accounts.* TO 'admin'@'localhost' identified by 'admin123';  --it full acceess for account db to admin user only on local machine
3. grant all privileges on accounts.* TO 'admin'@'%' identified by 'admin123';  -- it give full access to admin for remote machine when user login with those credentials mentioned  % this is for remotely

STACK: multiple services working togther as single a unit
0.0.0.0 -- this for all network can connect

prefer prefer ip addresds that only can connect for test use this

Application.properties: it have configuration like credentials of alls /src/main/resources/application.properties

http:// when we use http it default port was taken 80 for https it was 443