export const DEMO_SCAN_NAME = 'DEMO: Sample lab network scan';

export const DEMO_NMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<nmaprun scanner="nmap" args="nmap -sV -oX demo.xml 198.51.100.0/29" start="1767225600" startstr="2026-01-01 00:00:00" version="7.94" xmloutputversion="1.05">
<scaninfo type="syn" protocol="tcp" numservices="1000" services="1,3-4,6-7"/>
<host><status state="up" reason="syn-ack"/><address addr="198.51.100.10" addrtype="ipv4"/><hostnames><hostname name="gateway.demo.example" type="PTR"/></hostnames>
<ports><port protocol="tcp" portid="22"><state state="open" reason="syn-ack"/><service name="ssh" product="OpenSSH" version="8.9p1" extrainfo="Ubuntu 3ubuntu0.6" method="probed" conf="10"/></port>
<port protocol="tcp" portid="443"><state state="open" reason="syn-ack"/><service name="https" product="nginx" version="1.18.0" method="probed" conf="10"/></port></ports>
<os><osmatch name="Linux 5.4 - 5.15" accuracy="96"/></os></host>
<host><status state="up" reason="arp-response"/><address addr="198.51.100.21" addrtype="ipv4"/>
<ports><port protocol="tcp" portid="80"><state state="open" reason="syn-ack"/><service name="http" product="Apache httpd" version="2.4.52" method="probed" conf="10"/></port>
<port protocol="tcp" portid="3306"><state state="open" reason="syn-ack"/><service name="mysql" product="MySQL" version="8.0.36" method="probed" conf="10"/></port></ports></host>
<host><status state="up" reason="arp-response"/><address addr="198.51.100.34" addrtype="ipv4"/><hostnames><hostname name="files.demo.example" type="PTR"/></hostnames>
<ports><port protocol="tcp" portid="21"><state state="open" reason="syn-ack"/><service name="ftp" product="vsftpd" version="3.0.3" method="probed" conf="10"/></port>
<port protocol="tcp" portid="445"><state state="open" reason="syn-ack"/><service name="microsoft-ds" method="table" conf="3"/></port>
<port protocol="tcp" portid="8080"><state state="filtered" reason="no-response"/><service name="http-proxy" method="table" conf="3"/></port></ports>
<os><osmatch name="Windows Server 2019" accuracy="90"/></os></host>
<host><status state="down" reason="no-response"/><address addr="198.51.100.41" addrtype="ipv4"/></host>
<runstats><finished time="1767225660" timestr="Thu Jan  1 00:01:00 2026" elapsed="60.00" summary="Nmap done at Thu Jan  1 00:01:00 2026; 8 IP addresses (3 hosts up) scanned in 60.00 seconds" exit="success"/><hosts up="3" down="5" total="8"/></runstats>
</nmaprun>
`;
