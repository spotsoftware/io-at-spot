#!/usr/bin/python
# -*- coding: latin-1 -*-

import sys, os, argparse
import zerorpc
import time
import threading
import custom_snep_server

sys.path.insert(1, os.path.split(sys.path[0])[0])
sys.path.append('/home/pi/nfcpy')
sys.path.append('/home/pi/nfcpy/examples')
from custom_snep_server import CustomSnepServer

#import cli
#from cli import CommandLineInterface
 
import nfc
import nfc.snep

class NFCController(object):
    clf = None
    #sem = threading.Semaphore(0)
    messageSent = False
    
    options = {
        'device' : 'tty:AMA0:pn53x',
        'mode' : 'initiator',
        'role' : 'initiator',
        'miu' : 2175,
        'lto' : 500,
        'no_aggregation' : True,
        'nolog_symm' : True
    }
    
    def poll(self, on_connect_callback):
        self.clf = nfc.ContactlessFrontend(self.options['device'])
                    
        llcp_options = {
            'on-connect': on_connect_callback,
            'role': self.options['role'],
            'miu': self.options['miu'],
            'lto': self.options['lto'],
            'agf': not self.options['no_aggregation'],
            'symm-log': not self.options['nolog_symm']
        }
        
        try: 
            while not self.clf.connect(llcp=llcp_options):
               pass
        except:
            pass
        
        print "connected"
        #self.sem.acquire()
        
    
    def __init__(self):
        
        while True:
            self.messageSent = False
            
            while(not self.messageSent):
                #status 0        
                self.poll(self.client_connected)
            
            print "status 1"
            #status 1
            self.poll(self.server_connected)
            
            print "completed flow"
        

    def server_connected(self, llc):
        self.snep_server = CustomSnepServer(llc)
        self.snep_server.start()
        
        print "server started"
        return True
        
       
    def client_connected(self, llc):

        self.snep_client = nfc.snep.SnepClient(llc)                
        print "phone detected"
        commThread = threading.Thread(target=self.put_to_client, args=())
        commThread.start()                
        return True
    
    
    def put_to_client(self):
        print "sending first msg" 
        ndefRecord = nfc.ndef.Record('application/it.spot.io.doorkeeper', 'raspberry record', b'First ndef message from raspberry(public key)')
        self.snep_client.put(nfc.ndef.Message(ndefRecord))   
        #self.sem.release()   
        self.messageSent = True
        self.clf.close()
 
if __name__ == '__main__':
    NFCController()