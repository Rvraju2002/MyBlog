

AWS REGIOSN AND ZONE(One Zone have mutiple data center)
In one Region aws have mutiple zone in one region minium two zone and mazimum 6 zone avaialble 


AWS GLOBAL INFRASTURCTURE

1. The AWS global Clound infracture is the most secure extensive and reliable cloud platform, Offering over 175 fully featured services from data centers globally

Cross-Region Replication (CRR) 
   By default, **S3 does NOT automatically copy your data to another region**.  
You must enable a feature called **Cross-Region Replication (CRR)**.

When you upload a file to **Bucket A (Mumbai)**  
AWS automatically copies it to **Bucket B (Singapore)**.

So the data exists in **two different regions**.

If one region gets destroyed, your data still exists in the other region.

regions -- needed for fast and reliable

Speed  -- if we host our application near everyone access it easilt
cost   -- if we host in some place it may have larger cost
leagl and policies  -- some datas should be restricted and stay in that country only
Backup   -- if one fails we can use another -- IF CRR enabled

High availability Through Mutiple Availability Zones
Improving Continuity With Replication Between Regions
Meeting Compliance and data Residency Requirements
Geographic exapansion


Availabity Zone

When you launch an instance, you can select an availability Zone or let us choose one for you
if you distribute your instances across mutiple availability Zones and one instances fails, you can 
so that an instance in another availablity Zone can handle requests


# 🆚 **Elastic Beanstalk vs EC2**

|Feature|Elastic Beanstalk|EC2|
|---|---|---|
|Deployment|Automatic|Manual|
|Scaling|Auto|Manual|
|Infra Management|AWS|You|
|Best For|Developers|SysOps/DevOps|

**Elastic Beanstalk = A service that automatically deploys and manages your web application.**


# 🟦 **1. Amazon S3 (Simple Storage Service)**

### **What it is:**

A **highly scalable object storage** service.  
You store **files like photos, videos, documents, logs, backups**.

### **Key points:**

- Stores data as **objects** inside **buckets**
    
- Accessed using HTTP (URL-like access)
    
- Very cheap
    
- Durable (99.999999999% durability)
    
- Used for backups, websites, application data
    

### **Examples:**

- Uploading images for a website
    
- Storing automation logs
    
- Backup files
    
- Hosting static websites
    

---

# 🟧 **2. Amazon EFS (Elastic File System)**

### **What it is:**

A **shared file system** like NFS.  
Multiple EC2 instances can access the same files **at the same time**.

### **Key points:**

- File storage with POSIX permissions
    
- Multiple servers can read/write simultaneously
    
- Automatically scales
    
- More expensive than S3
    
- Used when apps need a shared filesystem
    

### **Examples:**

- Two EC2 servers need same folder
    
- Hosting WordPress where media folder is shared
    
- Big data processing systems
    

**Think of EFS = like a shared Linux folder mounted across EC2s.**

---

# 🟩 **3. Amazon S3 Glacier**

### **What it is:**

A **very low-cost archival storage** for data you **rarely access**.

### **Key points:**

- Cheapest AWS storage option
    
- But **slow retrieval** (minutes to hours)
    
- Designed for backups & long-term storage
    
- Not used for daily access
    

### **Examples:**

- 7-year financial documents
    
- Old logs
    
- Backup archives
    
- Compliance storage
    

**Think of Glacier = cold storage (like putting files in a deep freezer).**

**Route 53 = AWS’s DNS (Domain Name System) service.**

DNS means:  
It converts **domain names → IP addresses**.
Route 53 = Domain + DNS + Traffic Routing + Health Checks
## 🛠️ **What Route 53 Does?**

### ✔ 1. **Register Domains**

You can buy domain names like:

- mywebsite.com
    
- vigneshawslearning.in
    

### ✔ 2. **DNS Routing**

Route 53 routes traffic to:

- EC2
    
- Load Balancer
    
- S3 static website
    
- CloudFront
    
- API Gateway
    

### ✔ 3. **Health Checks**

It checks if your server is healthy.  
If one region fails → it sends users to another region.

### ✔ 4. **Routing Policies**

Route 53 decides **how** traffic flo



