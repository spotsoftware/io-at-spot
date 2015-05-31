import sys, os, argparse
import zerorpc

sys.path.append(os.path.dirname(os.path.realpath(__file__)) + '/nfcpy')

import threading
import nfc
import nfc.snep

class CustomSnepServer(nfc.snep.SnepServer):
    def __init__(self, llc):
        print "starting server"
        nfc.snep.SnepServer.__init__(self, llc, "urn:nfc:sn:snep")
        #it also has to be a client to push message
        self.snep_client = nfc.snep.SnepClient(llc)
  
    #method invoked in a separate thread
    def send_result(self, token, mark):
        
        #call node.js to validate token
        
        c = zerorpc.Client()
        c.connect("tcp://127.0.0.1:4242")
        response = c.token(token, mark)
        
        #response = {
        #    'message': 'ok'
        #}
        
        print "STATUS: sending result to peer"
        #connect to peer (as client) and sends the response
        self.snep_client.connect("urn:nfc:sn:snep")
        ndefRecord = nfc.ndef.Record('application/it.spot.io.doorkeeper', 'NDEF record', response['message'].encode( "utf-8" ))
        self.snep_client.put(nfc.ndef.Message(ndefRecord))

        self.snep_client.close()
 
    #method called when peer push an ndef message
    def put(self, ndef_message):
        print "STATUS: received data from peer"        
        print ndef_message
        #everything in the first record
        markRecord = ndef_message.pop()
        tokenRecord = ndef_message.pop()
        
        #TODO: last char
        thread = threading.Thread(target=self.send_result, args=([tokenRecord.data, markRecord.data]))
        thread.start()
        
        return nfc.snep.Success
