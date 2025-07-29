
**INSTALLNATON TOOLS**

1.ORACLE VM VIRTUALBOX
2.GIT BASH
3.VAGRANT
4.CHOCOLATE/BREW
5.JDK8
6.VSCODE
7.SUBLIME TEXT EDITOR
8.AWS CLI

Virtual machine prerequest
**Enable virtualization in bios**)(F10 while start computer)
- VTX
- Secure Virtual machine
- Virtualization

**Disable other windows virtualization**(Turn windows features on or off) once done just restar
- Microsoft hyperv
- Windows hypervisor platform
- Windows subsytem for linux
- Docker Desktop
- Virtual machine platform

ORACLE VIRTUALBOX
https://mirror.stream.centos.org/9-stream/BaseOS/x86_64/iso/
1.Create Centumos vm
2.Download centoos 9 iso file from chrome
3.attach that iso file in centos vm in oracle virtualbox
      Settings-->Storage-->ControllerIDE--Click on optical driver button--choose disk file--attach ISO downloaded file--check live cv/dvd

VM network adapted connect wifi via phyiscal network adapated

Example : If user enable wifi and connect to wifi route just laptop enable ip address and add that ip address in that router same like when we create virtual machine that machine also havve network adapter but we can access wifi route via bridge conecpt that means we can via physical adapter which we install this vm

GET IP ADDRESS OF WIFI
1. ipconfig
    Connection-specific DNS Suffix  . :
   Link-local IPv6 Address . . . . . : fe80::52a6:96f7:7b5a:f1b%16
   IPv4 Address. . . . . . . . . . . : 192.168.0.141
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.0.1  --- ROUTER IP ADDRESS
2.Go to settings in centos vm --> network -->Adapter 1(don't change it default NAT) --> Adapter 2( Enable Network adapter) and choose how via you receive network example wifi,ether)

if you doubt what i user just go control panel and click on network and internet
![[Pasted image 20250726120522.png]]

3. Go to system click on pointing device click on usb tablet( this will useful for won't use mouse in vnm)

DONE THINGS:
 We created vm and attach iso
 Bridge adapter
 Changed mouse settings
ONCE VM ON 3 THINGS NEED TO DONE
1.Installantion Destnation--choose DISK file and click done
2.Click on network and host
  you see two option one was you mac address and another was router connected address

Username:vraju
password:Vignesh@2002
Once vm setup completed rebort system show don't click that instead go to oracle write click centovm and hover stop click acpi shutdown and then go settinsg -->storange --remove disk because when rebot it again reinstall so we should remove and click on okay and start

Once centos install and in home page click on termianl
ip addr show

USERNAME:vraju@centosvm
ipaddrss:192.168.0.171/24 brd 192.168.0.255

SETUP SSH 

open gitbash 
type ssh username@ipaddress
and yes and enter password

type hostname and verify it centosvm which your vmname

setup for ubunu
1.https://releases.ubuntu.com/jammy/ visit this url and download server install image

UBUTU IP: 192.168.0.177/24

ONLY INSTALL SH GIVE SPACE BAR ALL OTHER JUST DONE
hostname:raju  --ubuntu
hostname:centumos

