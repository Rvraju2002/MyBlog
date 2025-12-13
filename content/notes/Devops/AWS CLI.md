

installantion 

brew install awscli --macos

aws configure --it ask accesskey,secreat key, region and format

aws sts get-caller-identity

aws ec2 describe-instances -- it give the ec2 information which i created


# ⭐ **AWS Systems Manager (SSM) — Easy Explanation**

AWS Systems Manager is a **management and automation service** that helps you control EC2 instances, on-prem servers, and other AWS resources **from one place**.

It is mainly used for:

✔ Remote access  
✔ Automation  
✔ Patch updates  
✔ Inventory collection  
✔ Configuration management  
✔ Running commands without SSH

![[Pasted image 20251211211231.png]]



it used to we can do any execute commad in mutiple instances


SSM Connect Via IAM permission to instances


1..Create Role  -- AmazonSSMManagedInstanceCore
2.Attached this role on instances
3.Security--modify-role

Go to AWS SYSTEM Manager -> NodeTools--session manager