import sys, os, atexit, binascii, thread

sys.path.append('/home/pi/nfcpy')

import nfc

reader = None

def connected(tag):
    uid = binascii.hexlify(tag.uid)
    print uid

@atexit.register
def clean():
    if reader:
        reader.close()

reader = nfc.ContactlessFrontend(sys.argv[1])
reader.connect(rdwr={'on-connect': connected})