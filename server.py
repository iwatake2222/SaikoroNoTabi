import cgi
import BaseHTTPServer,CGIHTTPServer
BaseHTTPServer.HTTPServer(( '192.168.11.3', 8080 ), CGIHTTPServer.CGIHTTPRequestHandler ).serve_forever()


