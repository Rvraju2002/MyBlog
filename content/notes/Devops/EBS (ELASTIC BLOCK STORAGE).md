
1. EBS is birtual hard disk
2. Snapshot --back up of ebs volume


It used to run OS and which stores operating system
Run ec2 OS, store data from db, file data , etc

Placed in specific AZ(Avaialblity zone) automatically replicated within the AZ to protect
from failure

EBS volume data is automatically replicated within the availability zone, and this is so you can protect

EBS volume only create where ec2 volume is created it means same zone

**EBS TYPES**

1. General purposes(SSD) Solid state drive
      Most Work Loads(Example webserives hosted) -- it mostly used for it
2. Provisioned IOPS(Higher InputOutput per second) 
     Large databases
3. Throughtput optmised HDD -- Hard disk drivers
     Big data & Data warehouse
4. Gold HDD
     File servers(It very low cost)
5. Magnetic
     Backups & Archives(Slowest and it recommed for only backups)


fdisk -l -- this show connected ebs /dev/xvda -- folder ebs there

df -h

except /dev/xvda128 /bot/efi except this allevda store in /dev/xvda1 partion

Requirment Gathering

1. OS
2. SIZE => Ram, CPU , network etc
   a. Min
3. Storage size
     a. 5 gigs for webserver images

I hosted website which showed in images I need to store alone ebs 

When create ebs should know above requirments

1. Should Avaialability zone of EC2
2. Encrypt the volume
3. GB : 5( based on requirement )
4. KMS key are cost and default key is free 


Once create EBS volume attached to instance using action

1. SSH into vm
2. fdisk -l -- this another ebs connected
3. fdisk /dev/sdf -- that ebs path
4. n -- for create new parition
5. click enter
6. click enter for full space ocupied for that ebs
7. w -- for write
8. p -- for print recently created parition

mkfs -- it show format names (hit double enter ) 
mkfs.ext4 --general purpose
mkfs.xfs -- it show large things

We need to format our parition based on extension

mkfs.ext4 /dev/sdf  

We need to mount images which is stored in another directory
after vm restart mount was undetouched

vi /etc/fstab -- in this file we need to add those path

/dev/xvdf1  tab and space /var/www/html/images ext4 defaults 0 0  ---(0 is fsk and 0 dump)

