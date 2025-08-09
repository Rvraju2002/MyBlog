VAGRANT TOOLS
Its a tool for writing automation script for create vm 

Manual VM mangement problem

1.OS installnation
2.Time consuming
3.Manul=> humar error
4.Tough to replicate mutiple vms
5.Need to document entire setup

Vagrant for VMS
1.NO OS installnation
VM images/box
Free box availble for vagrant cloud
2.vagrantfile
Manage vm settings in a file
VM changes in a vagrant file
Provisioning
Simple commands
Vagrant init boxname
Vagrant up --ON VM,
Vagrant SSH  -login vm
vagrant halt -- off vm
vagrant destroy -- delete vm

VAGRANT ARCHITECTURE
![](../../Images/Pasted%20image%2020250802170008.png)
![](../../Images/Pasted%20image%2020250802170406.png)


WANT TO KNOW PRESENT WORKING DIRECTORY
PWD --**COMMANDS**
mkdir /d/vagrant-vms  (create folder in d directort as vagrant-vms)

create two folder in vagrant-vms

1.Dowload centos image from vagrant cloud
https://portal.cloud.hashicorp.com/vagrant/discover/eurolinux-vagrant/centos-stream-9
2.search centos 9 and go to # eurolinux-vagrant/centos-stream-9 
3. using gitbash on the directory 
4.Vagrant.configure("2") do |config| config.vm.box = "eurolinux-vagrant/centos-stream-9" config.vm.box_version = "9.0.48" end

using termianl create vagrant file using init commad
**vagrant init eurolinux-vagrant/centos-stream-9**

**vagrant up** -- for up vm
if any issue occured realted to error:channel:Next initialize security context
vbox hardening it was antivirus you need to disable that same as if your're using corporate same issue will appear

**vagrant box list** -- **for show download images**
**vagrant status** -- for show vm staus
vagrant ssh -- it used for login into vm
**whoami** --it used to get username 
**sudo -i** --it is used to switch into root user
**exit** --it used to logout from vm(should not able to shutdown if you are in vm in termianl)
**vagrant halt** --power off vm(shutdonw)
**vagrant reload** --rebot the vm ( if any change applied in settings this commad need to use)
if you change box name then delete vm and create vm using that box name
**vagrant destroy** -- to delete vm
**vagrant box list** -- can see donwloaded box
**vagrant global-status** --to see all vm status
**vagrant global-status --prune**      --only show which is create via vagrant not directly from virtualbox 
**history** -- get all commands we entered in termial
**vagrant global-status** using this command you can get id of created vm and you can delete vagrant destort _id this used to delete that vm using id

**important: should poweroff vm before power of computer**

![](../../Images/Pasted%20image%2020250809104403.png)
