#!/usr/bin/python
# -*- coding: utf-8 -*-

import sys, os, argparse

sys.path.insert(1, os.path.split(sys.path[0])[0])
from cli import CommandLineInterface

import nfc
import nfc.snep

class SnepEchoServer(nfc.snep.SnepServer):
    def __init__(self, llc):
        nfc.snep.SnepServer.__init__(self, llc, "urn:nfc:sn:snep")
        self.snep_client = nfc.snep.SnepClient(llc)

    def put(self, ndef_message):
        print "received NDEF message"
        print ndef_message.pretty()
        self.snep_client.connect("urn:nfc:sn:snep")
        self.snep_client.put(nfc.ndef.Message(nfc.ndef.SmartPosterRecord('http://nfcpy.org')))
        self.snep_client.put(nfc.ndef.Message(nfc.ndef.SmartPosterRecord('http://google.com')))
        self.snep_client.close()
        return nfc.snep.Success

class Main(CommandLineInterface):
    def __init__(self):
        parser = argparse.ArgumentParser()
        super(Main, self).__init__(
            parser, groups="llcp dbg clf")

    def on_llcp_startup(self, clf, llc):
        self.snep_server = SnepEchoServer(llc)
        return llc

    def on_llcp_connect(self, llc):
        self.snep_server.start()
        return True
if __name__ == '__main__':
    Main().run()
