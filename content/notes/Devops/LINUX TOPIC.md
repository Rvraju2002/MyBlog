
![](../../Images/Pasted%20image%2020250803183507.png)

IMPORTANT
1.commands 
2.files
3.softwares
4.Servers
![](../../Images/Pasted%20image%2020250803184221.png)
![](../../Images/Pasted%20image%2020250803184347.png)
![](../../Images/Pasted%20image%2020250803184522.png)
![](../../Images/Pasted%20image%2020250803184722.png)
![](../../Images/Pasted%20image%2020250803184928.png)
![](../../Images/Pasted%20image%2020250803185130.png)

DIFFERENCE BETWEEN BOTH

RHEL: RED HAT ENTERPRISES - we can't able to install softwares from outside red hat like apple. for secuirty we choose red hat 
But can't install latest packages asap(BECAUSE IT TEST THROUGHLY AND THEN RELEASE) for **server purposes**

Debian:  Debian is the opensource free software we can donwload whatever we need compared to red hat it secure less

PATHS
![](../../Images/Pasted%20image%2020250803190048.png)

## ✅ You Already Configured DNS for `api.yourdomain.com`

That means:

1. **Your domain** (like `api.yourdomain.com`) is pointing to your **EC2 instance's public IP or load balancer**.
    
2. So whenever your **frontend code** makes this call:
    
    js
    
    CopyEdit
    
    `fetch("https://api.yourdomain.com/products")`
    
    it **doesn't go to S3**, it goes to **your EC2 backend** because DNS tells the browser:
    
    > "Hey, this domain (`api.yourdomain.com`) is actually served by this EC2 machine."
    

---

## 🔗 How It All Flows:

### When a user opens your website:

|Action|Happens Where?|What It Does|
|---|---|---|
|Browser loads site|From `yourdomain.com` (served via CloudFront/S3)|Gets the frontend (HTML/JS/CSS)|
|JS in browser sends request|`fetch("https://api.yourdomain.com/products")`|DNS resolves `api.yourdomain.com` to EC2 IP|
|EC2 handles request|Your backend code in EC2|Sends response (e.g., JSON data)|
|EC2 → MongoDB Atlas (optional)|Backend makes DB query|Retrieves or stores data|

---

## 🧠 DNS → EC2 Behind the Scenes

When you configured DNS for `api.yourdomain.com`, you:

- Added a **DNS "A" record** in Route 53 (or another DNS provider)
    
- That record points to your **EC2 public IP** (or a load balancer)
    

So now, **any browser** anywhere in the world knows:

txt

CopyEdit

`api.yourdomain.com --> 3.123.45.67 (EC2 IP)`

And **all frontend fetch requests go there**.

---

### ✅ Summary

> Yes — your fetch requests go to EC2 **because the DNS for `api.yourdomain.com` is mapped to EC2**.  
> That's why there's **no need for frontend to know the IP**, it just uses the domain — and DNS + AWS does the rest.

Let me know if you want help:

- Setting up Route 53 records
    
- Adding HTTPS via SSL/TLS
    
- Separating `www.yourdomain.com` (frontend) and `api.yourdomain.com` (backend)
    

I'm happy to guide step-by-step!

##### You said:

Give entire flow which I already asked question for put ref

###### ChatGPT said:

Absolutely! Here’s a complete **end-to-end architecture flow** based on **all your questions**, including how frontend (S3), backend (EC2), MongoDB Atlas, CDN, domain (DNS), and AWS/Azure VMs communicate — with a clear explanation and reference points.

---

## 🧩 FULL FLOW: Hosting a Web Application Using AWS (S3 + EC2 + MongoDB Atlas)

---

### 1. 🧑‍💻 **Frontend Code (React, HTML, JS, CSS)**

- You upload your frontend build (e.g., React’s `build/` folder) to **Amazon S3**.
    
- You optionally enable **CloudFront CDN** to deliver content faster worldwide.
    

**User accesses your site via:**

arduino

CopyEdit

`https://yourdomain.com`

🔁 **Browser ↔ S3/CloudFront**:  
Downloads static files (HTML, JS, CSS, images)

---

### 2. 🌍 **Domain + DNS Configuration**

- You buy a domain (e.g., `yourdomain.com`)
    
- You configure **DNS in Route 53** (or GoDaddy, Namecheap, etc.)
    
- You create subdomains like:
    
    - `yourdomain.com` → S3/CloudFront
        
    - `api.yourdomain.com` → EC2 (backend)
        

✅ DNS tells the browser:

pgsql

CopyEdit

`api.yourdomain.com ➝ 3.124.56.78 (your EC2 public IP or Load Balancer)`

---

### 3. 🔗 **Frontend Calls Backend APIs**

- Frontend code makes calls like:
    

js

CopyEdit

`fetch("https://api.yourdomain.com/products")`

- The browser uses DNS to resolve `api.yourdomain.com` and sends the request to your EC2 instance.
    

---

### 4. 🖥️ **Backend Server on EC2 (e.g., Node.js/Express)**

- EC2 runs your backend code (e.g., Node.js, Django, Spring Boot).
    
- It listens on port 80 or 443 via a web server (like **Nginx** or **Apache**).
    
- Nginx forwards requests to your app running on `localhost:3000`.
    

**Flow:**

scss

CopyEdit

`User → DNS (api.yourdomain.com) → EC2 (Nginx) → Backend App (Node.js)`

---

### 5. 🗃️ **MongoDB Atlas (Cloud DB)**

- Your backend connects to **MongoDB Atlas** using a secure URI:
    

pgsql

CopyEdit

`mongodb+srv://<user>:<password>@cluster.mongodb.net/mydb`

- EC2 can access it over the internet (or private VPC Peering for security).
    

**Flow:**

java

CopyEdit

`EC2 backend ↔ MongoDB Atlas (cloud database)`

---

### 6. 🧊 **Optional: CDN (CloudFront)**

- Speeds up content delivery from S3
    
- Reduces latency by caching files at edge locations
    
- Communicates directly with browser (not EC2)
    

---

### 7. ⚙️ **Security & Scalability**

#### a. SSL/TLS (HTTPS)

- You attach an **SSL certificate** to CloudFront or Load Balancer or EC2 (via Nginx).
    
- So traffic is encrypted: `https://yourdomain.com`
    

#### b. Scalability

- If many users visit:
    
    - **S3 + CDN** handles static files easily (scalable by default)
        
    - EC2 may be behind an **Auto Scaling Group + Load Balancer**
        
    - MongoDB Atlas auto-scales based on your plan
        

---

## 🔁 WHO TALKS TO WHOM?

|From|To|Purpose|
|---|---|---|
|Browser|S3/CDN|Download frontend (HTML/CSS/JS)|
|Browser|EC2 (via DNS)|API Requests|
|EC2|MongoDB Atlas|Query & store app data|
|EC2|S3 (optional)|Upload/download media/files|
|Frontend (JS)|`api.domain.com`|AJAX requests to backend|

---

## 🧪 Example Flow: User Loads Product List

1. User visits `https://yourdomain.com`
    
2. Browser downloads frontend from S3
    
3. Frontend JavaScript makes:
    
    js
    
    CopyEdit
    
    `fetch("https://api.yourdomain.com/products")`
    
4. DNS resolves `api.yourdomain.com` → EC2 IP
    
5. EC2 receives request (via Nginx) and hits your backend code
    
6. Backend queries MongoDB Atlas
    
7. Response (`JSON`) sent back to browser
    

---

## 🌐 Bonus: Hosting Without AWS or Azure

If you're hosting **locally**:

- You can run your backend on your computer (`localhost:3000`)
    
- Expose it to public with tools like:
    
    - **Ngrok** (for testing)
        
    - **Port forwarding** via your WiFi router (not secure)
        
    - **Public IP + Domain + Router NAT + SSL** setup (advanced)
        

But for production, use **cloud providers like AWS, Azure, or DigitalOcean**.

---

## ✅ Summary

| Component      | Hosted On            | Purpose                      |
| -------------- | -------------------- | ---------------------------- |
| Frontend       | S3 + CloudFront      | Serve static website         |
| Backend        | EC2 (Ubuntu/Red Hat) | Handle APIs, business logic  |
| DB             | MongoDB Atlas        | Data storage                 |
| DNS            | Route 53 / GoDaddy   | Domain name mapping          |
| CDN (optional) | CloudFront           | Speed & cache static content |
| Web Server     | Nginx/Apache         | Route traffic to app on EC2  |


**LINUX COMMANDS**
   1.ls -- show file in that folder
2. cd foldername -- go that folder
3. cat foler -- open that folder
4. mkdir foldername -- create folder
5. mkdir folder1 foldername 2 --create multiple folder
6. touch filetext1.text --create empty
7. touch devopsfile{1..10}.text -- create 10 file with 1 to 10 with prefix of devops
8. cp -- it used to copy from source and paste in destination(example useage: cp devopsfile.ext dev/)
9. cd ~ --go to homedirectory
10. cp -r dev backupdir/  -- copy director and paste directory
11. mv  source and destination -- it used move file from source to destination
12. mv devops1.text devops22.text -- it rename as well
13. mv  '*.text textdir' -- it mean it move all text to text dir
14. rm filename ---remove filename and can remove director but use  -r
15. rm -rf -- forecefull delte

**VIM EDITOR**

1.command mode
2.insert mode
3.extend command mode
1.Need to install vim editor
sudo yum install vim -y

vim file1.text -- create file with editor mode
click i -- it used for edit file
once edited click on escape for back to command
:w for save the file
escape
:q -- go back to termianl

:wq save and quit
:q!  -- forcefull quit without changes reflect


![](../../Images/Pasted%20image%2020250809192459.png)
dd --delete the entire line
ndd -- to delete no.of line from curosr position(5dd)
/netwotk  -- To search a word in the file on the network you need specify which word you need to find


1. i -- instert text
2. :w --save the text
3. :q --quit the editor
4. :wq -- save and quit the editor
5. esc -- back to command
6. :se nu -- if more line of code each line number will set
7. shift + g -- it goes to last of line code
8. shif + g g -- it goes to first line of code9
9. yy -- when you are any line giving this command it copy that line
10. p -- pase the copy line
11. P - captial p paste of which line you're
12. 4yy --it means which line you're from that line 4 line you copy
13. dd -- delete the line
14. u -- undo the delete line
15. 5dd --delete 5 line   -- dd means cut the line so can we use for p for paste

![](../../Images/Pasted%20image%2020250810101943.png)

File in linux
ls -l it give more information about files
file filename -- this give how file are it waa text file script file like thT

--  if hypen is before text it meanss it was text file
d -- this means directory
c -- this was characterstic file example keyboard
b -- this for hard disk(block file)
l -- link file (shortcuts)
example : mkdir /opt/dev/ops/devops/text -when creating it thrown an cannot create directort
mkdir - p  /opt/dev/ops/devops/text it create
vim  /opt/dev/ops/devops/text/commands.text --just add anything
ls -n  /opt/dev/ops/devops/text  cmds -- it links cmds with that path
you can access that using only cat cmds don't need absolute path

ls -lt   -- it show sort based on timestamp
ls -ltr   --it show in reverse sort based on timestamp


4.Filter & IO redirection command
GREP

1. grep textname filename -- it get that text show in output and linux is casesensitive
2. grep -i textname filename --it gets all of result i commad is used to remove casesentive
3. grep -i firewall *  -- it get firewall text entire file in that directory(but it ignore dirctory if available it means folder)
4. grep -iR firewall *   -it show results including directory
5. grep -vi firewall filename --it show all results except text firewall 
6. less filename -- we can read and using /text we search
7. more filename --using enter we can go to next line
8. head -2 filename -- first two line will show on that file
9. tail --filename --it show last 10 lines (tail -2 ) we ca use like that also
10. tail -f filename -- it show the file with updating version example we use for logs it keep on updating
11. cut -d: f2 filename -- example in username:no:rollno like this using this  we can only print rollno
12. awk  - it can use regular expression
13. awk -F':' ' {print $1}' filename
14. %s/textname/changetext/g --- textname text appeard in file and change text replace textname it chnage text globall in that file
15. sed '/s/textname/replacename/g' *  it find textname in that directory in all file change into replacename
16. sed -i '/s/textname/replacename/g' 

I/0 direction
1. ls > /tmp/systeminfo.text --- this command store ls what they file currenty in that text file
2. cat etc/passwd >> /tmp/systeminfo.text   - double greathn is used to it doesn't overwrite it just append
3. uptime-- show system stroange
4. free -m it show details information storage
5. df -h --it show detail folder which consume more storage
6. wc -l /etc/passwd --count number of line
7.  ls | wc -l -- it used to show how many files
8. grep -- it used to search name from files or folder
9. ls | grep textname 
10. ls -l | head
👉 Here’s what it does:

ls -l → lists files in the current directory in long format (with details like permissions, owner, size, timestamp).

The pipe | sends that output to the next command.

head → shows the first 10 lines by default.

So this will show the first 10 entries of your directory lis

11. find /etc name host*


USERS & GROUPS

useradd -m test -- this add user(add user with home directory)

id test - this show id of user 

gropadd devops   -- this create like folder

open vim editor on devops add after: test and save
now test in devops groups

lsof -u vagrant -- its used to what are file used vagrant
lsof -u aws --it used to aws user logged in 
userdel - vicky ---delete user
 rm -rf /home/vicky --delyter hoem director folder



     
