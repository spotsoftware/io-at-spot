package it.spot.io.lib.proxies.nfc;

import android.app.Activity;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.IntentFilter;
import android.nfc.NdefMessage;
import android.nfc.NdefRecord;
import android.nfc.NfcAdapter;
import android.nfc.NfcEvent;
import android.os.Handler;
import android.os.Parcelable;
import android.util.Log;

import java.nio.charset.Charset;

/**
 * Created by andreacorzani on 18/10/14.
 */
public class NfcHelper implements INfcHelper, NfcAdapter.OnNdefPushCompleteCallback{

    private String TAG = "NfcHelper";

    private NfcAdapter mNfcAdapter;
    private IntentFilter[] intentFiltersArray;
    private PendingIntent mPendingIntent;

    private boolean mIsActive;

    private int status = 0;

    private Activity mActivity;
    private INfcListener mListener;

    // { Construction

    public NfcHelper(INfcListener listener, Activity activity, NfcAdapter adapter) {
        super();

        this.mIsActive = false;

        this.mNfcAdapter = adapter;
        this.mListener = listener;
        this.mActivity = activity;

        mPendingIntent = PendingIntent.getActivity(activity, 0, new Intent(activity, activity.getClass()).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP), 0);
        IntentFilter ndefIntentFilter = new IntentFilter(NfcAdapter.ACTION_NDEF_DISCOVERED);
        try {
            ndefIntentFilter.addDataType("application/it.spot.io.doorkeeper");
        } catch (IntentFilter.MalformedMimeTypeException e) {
            throw new RuntimeException("fail", e);
        }
        intentFiltersArray = new IntentFilter[]{
                ndefIntentFilter
        };

        mNfcAdapter.setOnNdefPushCompleteCallback(this, this.mActivity);
    }

    // }


    /**
     * Parses the NDEF Message from the intent and prints to the TextView
     */
    private String processNdefMessage(Intent intent) {
        final Parcelable[] rawMessages = intent.getParcelableArrayExtra(
                NfcAdapter.EXTRA_NDEF_MESSAGES);

        NdefMessage msg = (NdefMessage) rawMessages[0];

        //TODO
        return new String(msg.getRecords()[0].getPayload());

    }

    private NdefRecord createTextRecord(String payload) {
        Charset utfEncoding = Charset.forName("UTF-8");
        byte[] textBytes = payload.getBytes(utfEncoding);
        NdefRecord record = new NdefRecord(NdefRecord.TNF_WELL_KNOWN,
                NdefRecord.RTD_TEXT, new byte[0], textBytes);
        return record;
    }

    /**
     * Implementation for the CreateNdefMessageCallback interface
     */
    private NdefMessage createNdefMessage(String text, boolean mark) {
        NdefMessage msg = new NdefMessage(
                new NdefRecord[]{
                        createTextRecord(text),
                        createTextRecord(mark ? "true" : "false")
                });
        return msg;
    }

    @Override
    public boolean adapterIsOff() {
        return this.mNfcAdapter == null || !this.mNfcAdapter.isEnabled();
    }

    @Override
    public void stop() {

    }

    @Override
    public boolean isActive() {
        return this.mIsActive;
    }

    @Override
    public void pause() {
        this.mIsActive = false;
        this.mNfcAdapter.disableForegroundDispatch(mActivity);
    }

    @Override
    public void resume() {
        this.mIsActive = true;
        this.mNfcAdapter.enableForegroundDispatch(mActivity, mPendingIntent, intentFiltersArray, null);
    }

    @Override
    public String readSignature(Intent ndefIntent) {
        return processNdefMessage(ndefIntent);
    }

    @Override
    public void writeToken(final String token, final boolean mark) {
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                mNfcAdapter.setNdefPushMessage(createNdefMessage(token, mark), mActivity);
            }
        }, 200);
    }

    @Override
    public String readAuthenticationResult(Intent ndefIntent) {
        this.status = 0;
        return processNdefMessage(ndefIntent);
    }

    @Override
    public boolean isP2PStarted() {
        return this.status == 1;
    }

    @Override
    public boolean isP2PDisabled() {
        return this.mNfcAdapter == null || !this.mNfcAdapter.isNdefPushEnabled();
    }

    @Override
    public void onNdefPushComplete(NfcEvent nfcEvent) {

        Log.w(TAG, "send completed");
        this.mListener.onSendTokenCompleted();
        this.status = 1;
    }
}
