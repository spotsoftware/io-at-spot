import sys, os, argparse
import zerorpc
import time
import threading
import binascii
import atexit

sys.path.append(os.path.dirname(os.path.realpath(__file__)) + '/nfcpy')

from custom_snep_server import CustomSnepServer

from nfcpy import nfc
import nfc.snep

class NFCController(object):

    def peer_connected(self, llc):
        socket = nfc.llcp.Socket(llc, nfc.llcp.LOGICAL_DATA_LINK)
        
        print "STATUS: peer connected"
        if(not self.p2pInitiated):
            self.snep_client = nfc.snep.SnepClient(llc)               

            commThread = threading.Thread(target=self.send_signature, args=([socket]))
            commThread.start()                
        else:
            self.snep_server = CustomSnepServer(llc)
            self.snep_server.start()
        
        return True
    
    
    def send_signature(self, socket):
        print "STATUS: send data to peer"
        ndefRecord = nfc.ndef.Record('application/it.spot.io.doorkeeper', 'NDEF record', b'device digital signature MOCK')
        self.snep_client.put(nfc.ndef.Message(ndefRecord))     
        self.p2pInitiated = True
        print 'p2p --> initiated'
        time.sleep(1)
        socket.close()
        print 'socket closing'
        try:
            self.clf.close() #Need it to simulate new device tap for Android
        except Exception as e:
            print 'wait dude'
    
    def tag_read(self, tag):        
        
        if type(tag).__name__ == 'NTAG216':
            print "STATUS: read tag"
            uid = binascii.hexlify(tag.uid)
            
            signature = None
            
            '''
            print tag
            sig = tag.transceive("\x3C\x00", timeout=1)
            assert len(sig) == 32 or len(sig) == 34
            if len(sig) == 34 and nfc.tag.tt2.crca(sig, 32) == sig[32:34]:
                sig = sig[0:32]
            signature = binascii.hexlify(tag.sig)
            '''
            
            signature = binascii.hexlify(tag.signature)
            print uid
            print signature            
        
            c = zerorpc.Client()
            c.connect("tcp://127.0.0.1:4242")
            c.tag(uid, signature)
        
            time.sleep(3)

    
    def start(self):
        self.clf = nfc.ContactlessFrontend(self.device)
        interrupted = False
        
        while not interrupted:
            self.p2pInitiated = False
            while(not self.p2pInitiated and not interrupted):
                #status 0  
                print "STATUS: ready"
                try:
                    return_val = self.clf.connect(llcp=self.llcp_options, rdwr=self.rdwr_options)
                    interrupted = not return_val
                except Exception as e:
                    print 'wait'
                    #print e
                    

            if not interrupted:
                print "STATUS: waiting for peer data"
                #status 1

                self.clf = nfc.ContactlessFrontend(self.device)
                self.clf.connect(llcp=self.llcp_options)
                
                print "completed flow"
    
    def __init__(self, dev):
        
        self.p2pInitiated = False
        
        self.clf = None
        
        self.rdwr_options = {
            'on-connect': self.tag_read
        }
        
        self.llcp_options = {
            'on-connect': self.peer_connected,
            'role': 'initiator',
            'miu': 2175,
            'lto': 500,
            'agf': False,
            'symm-log': False
        }
        
        self.device = dev
        #device = 'tty:AMA0:pn53x'

            
ctrl = None

def goodbye():
    ctrl.clf.close()
    print 'Goodbye!'
 
if __name__ == '__main__':
    #sys.path.insert(1, os.path.split(sys.path[0])[0])    
    
    if len(sys.argv) > 1:    
        dev = str(sys.argv[1])
    else:
        dev = 'usb'

    atexit.register(goodbye)
    ctrl = NFCController(dev)    
    ctrl.start()

    print 'finish'
