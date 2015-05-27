import sys, os, argparse
import zerorpc
import time
import threading
import binascii

sys.path.append(os.path.dirname(os.path.realpath(__file__)) + '/nfcpy')
from custom_snep_server import CustomSnepServer

#import cli
#from cli import CommandLineInterface
 
import nfc
import nfc.snep

class NFCController(object):
    clf = None
    p2pInitiated = False
       
    def peer_connected(self, llc):

        if(not self.p2pInitiated):
            self.snep_client = nfc.snep.SnepClient(llc)                
            print "STATUS: peer connected"
            commThread = threading.Thread(target=self.send_signature, args=())
            commThread.start()                
        else:
            self.snep_server = CustomSnepServer(llc)
            self.snep_server.start()
        
        return True
    
    
    def send_signature(self):
        print "STATUS: send data to peer" 
        ndefRecord = nfc.ndef.Record('application/it.spot.io.doorkeeper', 'NDEF record', b'device digital signature MOCK')
        self.snep_client.put(nfc.ndef.Message(ndefRecord))     
        self.p2pInitiated = True
        time.sleep(1)
        self.clf.close() #Need it to simulate new device tap for Android
    
    def tag_read(self, tag):
        print "STATUS: read tag"
        uid = binascii.hexlify(tag.uid)
        signature = None
        try:
            print tag
            sig = tag.transceive("\x3C\x00", timeout=1)
            assert len(sig) == 32 or len(sig) == 34
            if len(sig) == 34 and nfc.tag.tt2.crca(sig, 32) == sig[32:34]:
                sig = sig[0:32]
            signature = binascii.hexlify(sig)
            print uid
            print signature            
            c = zerorpc.Client()
            c.connect("tcp://127.0.0.1:4242")
            c.tag(uid, signature)
            time.sleep(3)
        except:
            pass
    
    
    def __init__(self):
        
        rdwr_options = {
            'on-connect': self.tag_read
        }
        
        llcp_options = {
            'on-connect': self.peer_connected,
            'role': 'initiator',
            'miu': 2175,
            'lto': 500,
            'agf': False,
            'symm-log': False
        }
        
        device = 'tty:AMA0:pn53x'
        
        while True:
            self.p2pInitiated = False
            while(not self.p2pInitiated):
                #status 0  
                print "STATUS: ready"
                
                try: 
                    self.clf = nfc.ContactlessFrontend(device)
                    while not self.clf.connect(llcp=llcp_options, rdwr=rdwr_options):
                        pass
                except Exception, e:
                    print e
                    pass
            
            print "STATUS: waiting for peer data"
            #status 1
            
            try: 
                self.clf = nfc.ContactlessFrontend(device)
                self.clf.connect(llcp=llcp_options)
            except:
                pass
            
            print "completed flow"
        
 
if __name__ == '__main__':
    NFCController()