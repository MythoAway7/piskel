@echo off
setlocal
echo The NodeJS server requires an IP to run. Clients can connect to this IP with a specified port and you can collorborate.
PAUSE
echo You need your LOCAL IP, not your public one. It should start with 192.168... An example is 192.168.3.901 
echo If you do not know your IP search "ip" in the windows search bar. Click on the ethernet (or wireless) result. Click on ethernet(or wireless) again. Scroll to the bottom of the page. The IP you want is labled as IPv4 Address
TIMEOUT /T 15
echo The server also needs a port number to run. If you are on a school/corporate network this may cause issues. Some firewalls may interfere. The default is 3000
echo If you have any questions let me know at one of the links in links.txt You can also read the FAQ.txt file.
set /P id=Enter your local IP address:
set /P port=Enter a port. If you do not know which to use type 3000: 
echo IP: %id% , Port: %port%
echo If these change or are incorrect you can change them by clicking on this file at any time. The data is stored in src/socket.io/serverinfo.txt
TIMEOUT /T 10 /NOBREAK
exit   
