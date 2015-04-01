package it.spot.io.doorkeeper.activities;

import android.app.ProgressDialog;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothManager;
import android.content.Intent;
import android.nfc.NfcAdapter;
import android.nfc.NfcManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.provider.Settings;
import android.util.Log;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.TextView;
import android.widget.Toast;

import it.spot.io.doorkeeper.DoorKeeperApplication;
import it.spot.io.doorkeeper.R;
import it.spot.io.doorkeeper.proximity.ble.IBleHelper;
import it.spot.io.doorkeeper.proximity.nfc.INfcHelper;
import it.spot.io.doorkeeper.proximity.ble.BleHelper;
import it.spot.io.doorkeeper.proximity.ble.IBleListener;
import it.spot.io.doorkeeper.proximity.nfc.INfcListener;
import it.spot.io.doorkeeper.proximity.nfc.NfcHelper;
import it.spot.io.doorkeeper.model.ILoggedUser;
import it.spot.io.doorkeeper.model.LoggedUser;

public class LoggedInActivity extends BaseActivity implements IBleListener, INfcListener {

    private static final String TAG = "LoggedInActivity";

    private IBleHelper mBLEHelper;
    private INfcHelper mNfcHelper;

    private ILoggedUser mLoggedUser;

    private Button mOpenButton;
    private CheckBox mMarkCheckbox;
    private ProgressDialog mProgressDialog;
    private TextView mNameTextView;

    // { BaseActivity methods overriding

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        this.setContentView(R.layout.activity_logged_in);

        this.mOpenButton = (Button) this.findViewById(R.id.btn_open);
        this.mOpenButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                mBLEHelper.readSignature();
                mOpenButton.setEnabled(false);
            }
        });
        this.mMarkCheckbox = (CheckBox) this.findViewById(R.id.chk_mark);

        this.mNameTextView = (TextView) this.findViewById(R.id.name);

        /*
         * Bluetooth in Android 4.3 is accessed via the BluetoothManager, rather than
         * the old static BluetoothAdapter.getInstance()
         */
        BluetoothManager btManager = (BluetoothManager) this.getSystemService(BLUETOOTH_SERVICE);
        this.mBLEHelper = new BleHelper(this, btManager.getAdapter(), this, this.mMessageHandler);


        NfcManager nfcManager = (NfcManager) this.getSystemService(NFC_SERVICE);
        this.mNfcHelper = new NfcHelper(this, this, nfcManager.getDefaultAdapter());

        this.mProgressDialog = new ProgressDialog(this);
        this.mProgressDialog.setIndeterminate(true);
        this.mProgressDialog.setCancelable(false);

        this.getUser();
    }

    @Override
    protected void onResume() {
        super.onResume();

        /*
         * We need to enforce that Bluetooth is first enabled, and take the
         * user to settings to enable it if they have not done so.
         */
        if (this.mBLEHelper.adapterIsOff()) {
            //Bluetooth is disabled
            final Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            this.startActivity(enableBtIntent);
            return;
        }

        this.mBLEHelper.resume();

        if (this.mNfcHelper.adapterIsOff()) {
            final Intent enableNfcIntent = new Intent(Settings.ACTION_NFC_SETTINGS);
            this.startActivity(enableNfcIntent);
            return;
        }

        if (this.mNfcHelper.isP2PDisabled()) {
            final Intent enableNfcIntent = new Intent(Settings.ACTION_NFCSHARING_SETTINGS);
            this.startActivity(enableNfcIntent);
            return;
        }

        this.mNfcHelper.resume();
    }

    @Override
    protected void onPause() {
        super.onPause();

        this.mProgressDialog.dismiss();

        if (this.mBLEHelper.isActive()) {
            this.mBLEHelper.pause();
        }

        if (this.mNfcHelper.isActive()) {
            this.mNfcHelper.pause();
        }
    }

    @Override
    protected void onStop() {
        super.onStop();

        this.mBLEHelper.stop();
    }

    @Override
    protected void onNewIntent(final Intent intent) {
        if (NfcAdapter.ACTION_NDEF_DISCOVERED.equals(intent.getAction())) {
            if (!this.mNfcHelper.isP2PStarted()) {
                Log.w(TAG, "Reading signature" + this.mNfcHelper.readSignature(intent));

                this.mNfcHelper.writeToken(this.mLoggedUser.getToken(), this.mMarkCheckbox.isChecked());
            } else {
                Log.w(TAG, "Reading result");
                Toast.makeText(this, this.mNfcHelper.readAuthenticationResult(intent), Toast.LENGTH_LONG).show();
            }
        }
    }

    @Override
    public boolean onCreateOptionsMenu(final Menu menu) {
        final MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.logged_menu, menu);

        return super.onCreateOptionsMenu(menu);
    }

    @Override
    public boolean onOptionsItemSelected(final MenuItem item) {
        switch (item.getItemId()) {
            case R.id.settings:
                break;
            case R.id.logout:
                this.logout();
                break;
        }
        return true;
    }

    // }

    // { IBleListener implementation

    @Override
    public void onBLEDeviceReady() {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                mOpenButton.setEnabled(true);
            }
        });
    }

    @Override
    public void onBLEReadSignatureCompleted(byte[] result) {
        //TODO: Check for signature
        this.mBLEHelper.writeToken(this.mLoggedUser.getToken(), this.mMarkCheckbox.isChecked());
    }

    @Override
    public void onBLEWriteTokenCompleted(int result) {
        Log.w(TAG, result + "");
    }

    @Override
    public void onBLEError(String error) {
        this.handleGenericError(error);
    }

    // }

    // { Private methods

    private void logout() {
        Intent intent = new Intent(LoggedInActivity.this, LogInActivity.class);
        intent.putExtra("logout", true);
        startActivity(intent);
        finish();
    }

    private void getUser() {
        final Bundle extras = getIntent().getExtras();
        if (extras != null) {
            final String id = extras.getString("id");
            final String token = extras.getString("token");
            final String email = extras.getString("email");
            final String name = extras.getString("name");

            this.mLoggedUser = new LoggedUser(id, name, token, email);
            this.mNameTextView.setText(name);
        }
    }

    // }

    // { Private classes

    /*
     * We have a Handler to process event results on the main thread
     */
    private Handler mMessageHandler = new Handler() {

        @Override
        public void handleMessage(Message msg) {
            switch (msg.what) {
                case DoorKeeperApplication.MessageConstants.MSG_PROGRESS:
                    mProgressDialog.setMessage((String) msg.obj);
                    if (!mProgressDialog.isShowing()) {
                        mProgressDialog.show();
                    }
                    break;
                case DoorKeeperApplication.MessageConstants.MSG_DISMISS:
                    mProgressDialog.dismiss();
                    break;
            }
        }
    };

    @Override
    public void onSendTokenCompleted() {
        Log.i(TAG, "send completed");
    }

    // }

}
