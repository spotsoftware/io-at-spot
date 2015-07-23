package it.spot.io.android.activities;

import android.app.ProgressDialog;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.nfc.NfcAdapter;
import android.nfc.NfcManager;
import android.os.Bundle;
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

import it.spot.io.android.DoorKeeperApplication;
import it.spot.io.android.R;
import it.spot.io.android.lib.ProxyNotInitializedException;
import it.spot.io.android.lib.ProxyNotSupportedException;
import it.spot.io.android.lib.ble.BleDoorProxy;
import it.spot.io.android.lib.ble.IBleDoorProxy;
import it.spot.io.android.model.ILoggedUser;
import it.spot.io.android.model.LoggedUser;
import it.spot.io.android.proximity.nfc.INfcHelper;
import it.spot.io.android.proximity.nfc.INfcListener;
import it.spot.io.android.proximity.nfc.NfcHelper;

public class LoggedInActivity
        extends BaseActivity
        implements IBleDoorProxy.Listener, INfcListener {

    public static final String EXTRA_LOGGED_USER = "logged_user";
    private static final String LOGTAG = "LoggedInActivity";

    private IBleDoorProxy mDoorProxy;
    private INfcHelper mNfcHelper;
    private ILoggedUser mLoggedUser;
    private boolean mHandledNfcOnStartup;

    private Button mOpenButton;
    private CheckBox mMarkCheckbox;
    private ProgressDialog mProgressDialog;
    private TextView mNameTextView;

    // { BaseActivity methods overriding

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        this.setContentView(R.layout.activity_logged_in);

        this.mLoggedUser = this.retrieveLoggedUser();

        if (this.mLoggedUser.getToken().isEmpty()) {
            final Intent intent = new Intent(this, LogInActivity.class);
            this.startActivity(intent);
            this.finish();
            return;
        }

        this.mMarkCheckbox = (CheckBox) this.findViewById(R.id.chk_mark);
        this.mNameTextView = (TextView) this.findViewById(R.id.name);
        this.mNameTextView.setText(this.mLoggedUser.getName());

        NfcManager nfcManager = (NfcManager) this.getSystemService(NFC_SERVICE);
        this.mNfcHelper = new NfcHelper(this, this, nfcManager.getDefaultAdapter());

        //this.mHandledNfcOnStartup = this.handleNFCIntent(this.getIntent());

        //if (!this.mHandledNfcOnStartup) {
        // initializes bluetooth low energy helper
        this.mDoorProxy = BleDoorProxy.create(this, this);

        try {
            if (this.mDoorProxy.init()) {
                this.mDoorProxy.startScanningForDoorController();
            }
        } catch (ProxyNotSupportedException e) {
            e.printStackTrace();
        } catch (ProxyNotInitializedException e) {
            e.printStackTrace();
        }

        // otherwise not useful
        this.mOpenButton = (Button) this.findViewById(R.id.btn_open);
        this.mOpenButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                mDoorProxy.openDoor(mLoggedUser.getToken(), mMarkCheckbox.isChecked());
                showProgressDialog(R.string.prompt_email, R.string.prompt_password);
                mOpenButton.setEnabled(false);
            }
        });

        this.mProgressDialog = new ProgressDialog(this);
        this.mProgressDialog.setIndeterminate(true);
        this.mProgressDialog.setCancelable(false);
        //}
    }

    @Override
    protected void onResume() {
        super.onResume();

        // enables NFC if needed
        if (this.mNfcHelper.adapterIsOff()) {
            final Intent enableNfcIntent = new Intent(Settings.ACTION_NFC_SETTINGS);
            this.startActivity(enableNfcIntent);
            return;
        }

        // enables NFC peer-to-peer if needed
        if (this.mNfcHelper.isP2PDisabled()) {
            final Intent enableNfcIntent = new Intent(Settings.ACTION_NFCSHARING_SETTINGS);
            this.startActivity(enableNfcIntent);
            return;
        }

        handleNFCIntent(getIntent());

        this.mNfcHelper.resume();
        //}
    }

    @Override
    protected void onPause() {
        super.onPause();

        if (this.mProgressDialog != null) {
            this.mProgressDialog.dismiss();
        }

        if (this.mNfcHelper != null && this.mNfcHelper.isActive()) {
            this.mNfcHelper.pause();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        this.mDoorProxy.destroy();
    }

    @Override
    protected void onNewIntent(final Intent intent) {
        if (!this.handleNFCIntent(intent)) {
            super.onNewIntent(intent);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        try {
            if (this.mDoorProxy.init()) {
                this.mDoorProxy.startScanningForDoorController();
            }
        } catch (ProxyNotSupportedException e) {
            e.printStackTrace();
        } catch (ProxyNotInitializedException e) {
            e.printStackTrace();
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

    // region IBleDoorProxy.Listener implementation

    @Override
    public void onProxyReady() {
        this.mOpenButton.setEnabled(true);
    }

    @Override
    public void onDoorOpened() {
        this.hideProgressDialog();
        this.mOpenButton.setEnabled(true);
    }

//    TODO - notify ble error
//    @Override
//    public void onBLEError(String error) {
//        this.handleGenericError(error);
//    }

    // endregion

    // region INfcListener implementation

    @Override
    public void onSendTokenCompleted() {
        if (this.mHandledNfcOnStartup) {
            this.finish();
        }
    }

    // endregion

    // region  Private methods

    /**
     * If the intent comes from an NFC source this method tries to handle it,
     * otherwise it doesn't affect the intent and does nothing.
     *
     * @param intent the intent to handle
     * @return {@code true} if intent was handled, {@code false} otherwise
     */
    private boolean handleNFCIntent(final Intent intent) {
        if (NfcAdapter.ACTION_NDEF_DISCOVERED.equals(intent.getAction())) {

            if (!this.mNfcHelper.isP2PStarted()) {
                Log.w(LOGTAG, "Reading signature " + this.mNfcHelper.readSignature(intent));

                this.mNfcHelper.writeToken(this.mLoggedUser.getToken(), this.mMarkCheckbox.isChecked());
            } else {
                Log.w(LOGTAG, "Reading result");
                Toast.makeText(this, this.mNfcHelper.readAuthenticationResult(intent), Toast.LENGTH_LONG).show();
            }

            return true;
        }
        return false;
    }

    /**
     * Goes back to the LogInActivity and achieves the logout.
     */
    private void logout() {
        Intent intent = new Intent(this, LogInActivity.class);
        intent.putExtra("logout", true);
        this.startActivity(intent);
        this.finish();
    }

    /**
     * Tries to resolve the currently logged user.
     */
    private ILoggedUser retrieveLoggedUser() {

        final Bundle extras = getIntent().getExtras();
        if (extras != null && extras.containsKey(EXTRA_LOGGED_USER)) {
            // this means we are coming from other app activities
            return extras.getParcelable(EXTRA_LOGGED_USER);
        } else {
            // this means that the application has been awakened by NFC intent filter
            final SharedPreferences sharedPref = this.getSharedPreferences(DoorKeeperApplication.SHARED_PREFERENCE_NAME, Context.MODE_PRIVATE);
            return new LoggedUser(
                    sharedPref.getString(ILoggedUser.PREF_LOGGED_USER_ID, ""),
                    sharedPref.getString(ILoggedUser.PREF_LOGGED_USER_NAME, ""),
                    sharedPref.getString(ILoggedUser.PREF_LOGGED_USER_TOKEN, ""),
                    sharedPref.getString(ILoggedUser.PREF_LOGGED_USER_EMAIL, "")
            );
        }
    }

    // endregion
}
