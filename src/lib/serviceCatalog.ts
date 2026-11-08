export interface ServiceReference {
  label: string;
  group: 'Remote access' | 'Web' | 'Database' | 'File sharing' | 'Email' | 'Directory' | 'Infrastructure';
  summary: string;
  implication: string;
}

export const SERVICE_REFERENCE: Record<string, ServiceReference> = {
  ssh: {
    label: 'Secure Shell (SSH)',
    group: 'Remote access',
    summary: 'Lets administrators log in and run commands on the machine remotely.',
    implication: 'Anyone who can reach this port can attempt logins. Weak passwords or outdated versions are common entry points.',
  },
  telnet: {
    label: 'Telnet',
    group: 'Remote access',
    summary: 'An older remote login protocol that sends everything, including passwords, without encryption.',
    implication: 'Traffic can be read by anyone on the same network path. Confirm whether this service is still required.',
  },
  ftp: {
    label: 'File Transfer (FTP)',
    group: 'File sharing',
    summary: 'Transfers files between machines. Standard FTP does not encrypt credentials or file contents.',
    implication: 'Check whether anonymous access is allowed and whether logins are sent in clear text.',
  },
  smtp: {
    label: 'Mail sending (SMTP)',
    group: 'Email',
    summary: 'The port mail servers use to accept and forward outgoing email.',
    implication: 'Open relays or unauthenticated submission can be abused to send spam.',
  },
  domain: {
    label: 'DNS',
    group: 'Infrastructure',
    summary: 'Translates names such as example.com into network addresses.',
    implication: 'Servers that answer recursive queries for anyone can be used in amplification attacks.',
  },
  http: {
    label: 'Web (HTTP)',
    group: 'Web',
    summary: 'Serves web pages and web applications without encryption.',
    implication: 'Web applications on this port should be reviewed for their own weaknesses. Traffic is not encrypted.',
  },
  'http-proxy': {
    label: 'Web proxy (HTTP)',
    group: 'Web',
    summary: 'A web proxy or alternate web service, often used for admin consoles or development servers.',
    implication: 'Administrative interfaces exposed on alternate web ports are frequently overlooked.',
  },
  https: {
    label: 'Secure Web (HTTPS)',
    group: 'Web',
    summary: 'Serves web content over an encrypted connection.',
    implication: 'Check the certificate and TLS configuration, and review the web application itself.',
  },
  pop3: {
    label: 'Mail retrieval (POP3)',
    group: 'Email',
    summary: 'Lets clients download mail from a server.',
    implication: 'Confirm that logins use encrypted connections.',
  },
  imap: {
    label: 'Mail access (IMAP)',
    group: 'Email',
    summary: 'Lets clients read and manage mail stored on a server.',
    implication: 'Confirm that logins use encrypted connections and strong authentication.',
  },
  'microsoft-ds': {
    label: 'Windows file sharing (SMB)',
    group: 'File sharing',
    summary: 'Shares files and printers on Windows networks.',
    implication: 'SMB is a frequent target. Confirm access controls and patch level.',
  },
  'netbios-ssn': {
    label: 'NetBIOS session service',
    group: 'File sharing',
    summary: 'Legacy Windows networking used for file and printer sharing.',
    implication: 'Legacy name services can reveal host and share information on the local network.',
  },
  'ms-wbt-server': {
    label: 'Remote Desktop (RDP)',
    group: 'Remote access',
    summary: 'Graphical remote desktop access to Windows machines.',
    implication: 'Remote desktop is a common entry point. Confirm network-level authentication and restricted access.',
  },
  vnc: {
    label: 'Remote desktop (VNC)',
    group: 'Remote access',
    summary: 'Graphical remote control of a desktop.',
    implication: 'Some VNC servers accept weak or no passwords. Confirm authentication is enforced.',
  },
  mysql: {
    label: 'MySQL database',
    group: 'Database',
    summary: 'A relational database service that stores application data.',
    implication: 'Databases should not normally be reachable from untrusted networks.',
  },
  postgresql: {
    label: 'PostgreSQL database',
    group: 'Database',
    summary: 'A relational database service that stores application data.',
    implication: 'Databases should not normally be reachable from untrusted networks.',
  },
  'ms-sql-s': {
    label: 'Microsoft SQL Server',
    group: 'Database',
    summary: 'A database server commonly used with Windows applications.',
    implication: 'Databases should not normally be reachable from untrusted networks.',
  },
  mongodb: {
    label: 'MongoDB database',
    group: 'Database',
    summary: 'A document database service.',
    implication: 'Confirm that authentication is required before any data is accessed.',
  },
  redis: {
    label: 'Redis cache',
    group: 'Database',
    summary: 'An in-memory data store often used for caching and sessions.',
    implication: 'Confirm that it requires authentication and is not reachable from untrusted networks.',
  },
  ldap: {
    label: 'Directory (LDAP)',
    group: 'Directory',
    summary: 'Provides directory lookups for users and groups.',
    implication: 'Directory services hold account information. Confirm access is restricted.',
  },
  kerberos: {
    label: 'Kerberos authentication',
    group: 'Directory',
    summary: 'Handles ticket-based authentication in Windows and Active Directory environments.',
    implication: 'Domain controllers should be reachable only from internal networks.',
  },
  snmp: {
    label: 'Network management (SNMP)',
    group: 'Infrastructure',
    summary: 'Lets monitoring tools query and sometimes configure network devices.',
    implication: 'Default community strings can expose device details. Confirm they are changed and restricted.',
  },
  nfs: {
    label: 'Network file system (NFS)',
    group: 'File sharing',
    summary: 'Shares directories between Unix-like systems.',
    implication: 'Confirm exports are restricted to the hosts that need them.',
  },
};

export function getServiceReference(serviceName: string | null): ServiceReference | null {
  if (!serviceName) return null;
  return SERVICE_REFERENCE[serviceName.toLowerCase()] ?? null;
}
