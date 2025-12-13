
Ec2 Provides web services api for provisioning, Managing and deprovisioning virtual servers inside amazon cloud

Ease In Scaling Up/Down
Pay only for what you user
Can be integrated into sevaral other services


ECE Pricing

1. On demand(Pay per hour or seconds)
2. Reserverd(Reserve Capacity (1 or 3 yrs for discounts))
3. Spot (Bid your price for unused ec2 capacity)
4. Dedicated Hosts(Physical Server Dedicated for you)

EC2 Componenets

AMI -- Amazon Machine image (AMI) provides the information required to launch an instance,
Which is a virtual server in the cloud.


Instance Type -- When you launch an instance, the instance type that you specify determines
the hardware of the host computer used for your instance

Elastic Block Store (EBS) -- Amazon Ec2 provides  you with flexible, cost effective and easy to use data storage options for your instances . EBS also is a virtual harddisk for (for linux 8gb and for windows 30gb) store our data 


TAGS -- Tag is a simple label consisting of a customer-defined key and an optional value
that can make it easier to manage, search for , and filter resources

Security Groups -- A security group acts as a virtual firewall that controls the traffic for one
or more instances

key pair -- Amazon EC2 uses public - key cryptography to encrypt and decrypt login information


Amazon EC2 --> choose an ami --> Instancetype ->Configuration Instance --> Adding Storage --> Adding Tags  ---> Configure Security Group -- Review


**EC2 -- CONGIRATION**

1. In aws VMS is called instances
2. Vagrant box  -- AMI(IN AWS)
3. security groups -- firewall
4. Elastic ips -- Reserved public ip attacged to instances


Amazon Linux Server -- Likely centos

1. Tags -- This is used to filter the vms 
2. Download Key pair pem for access vm via ssh
3. Advanced details  Userdata -- you can writte bash script



EC2 instance Creations( what are things need before create instance )

1. Requirement Gathering
2. Key pairs+
3. Security Groups
4. Instance Launch


Requirement Gathering

1.OS
    a. Centos
2. Size ==> Ram, CPU, Network etc
3. Storage size
4. Project
5. Services/Apps Running
        a. SSH,http,mysql etc
6. Environment(Dev, QA, Staging, Prod)
7. Login User/ Owner 
	

Security Groups:
    A security group acts as a virual firewall that controls the traffic for one or more instances
     You can add rules to each security group that allow traffic to or from its associated instances
     Security groups are statefull

we can use 1 security groups to mutiple instances

There two types of Traffic
 1. Inbound --Traffic coming from outside on the instance
 2. Outboud -- Traffic going from instance to outside

Inbound rules:
 Before hosting any service in vm don't do allow rules once setuped and then set rules
1. First give ssh -- 22 (source - myip) -only in company can access vm


Outbound -- Outboud rules we'don set any port because outbound network we have set any port internet will not be access so it should proxy


Elastic IP: Elastic ip address is used to give static public ip for instances

So the private ip and public ip and secruity group is attached to the network interface of the instances


**IMPORTANT CONCEPTS: ENI (ELASTIC NETWORK INTERFACE)**

ENI is used to communicate to VPC

**Instance Settings**

1. Change instance Type -- This is used to change Instance it micro --medium
2. Change termination Type -- If this was on accidently deletion will not be until off
3. Change stop protection -- same for above accidently not stop
4. Release Elastic ip address -- if you not use elastic ip address just release(Important)



