package it.spot.io.app.home;

import android.app.ProgressDialog;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.nfc.NfcAdapter;
import android.nfc.NfcManager;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Log;
import android.util.TypedValue;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.widget.CompoundButton;
import android.widget.ImageView;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import it.spot.io.android.BaseActivity;
import it.spot.io.android.R;
import it.spot.io.app.DoorKeeperApplication;
import it.spot.io.app.login.LogInActivity;
import it.spot.io.app.login.auth.model.ILoggedUser;
import it.spot.io.app.login.auth.model.LoggedUser;
import it.spot.io.lib.proxies.ProxyNotInitializedException;
import it.spot.io.lib.proxies.ProxyNotSupportedException;
import it.spot.io.lib.proxies.ble.BleDoorProxy;
import it.spot.io.lib.proxies.ble.IBleDoorProxy;
import it.spot.io.lib.proxies.nfc.INfcHelper;
import it.spot.io.lib.proxies.nfc.INfcListener;
import it.spot.io.lib.proxies.nfc.NfcHelper;

public class LoggedInActivity
        extends BaseActivity
        implements IBleDoorProxy.Listener, INfcListener {

    public static final String EXTRA_LOGGED_USER = "logged_user";
    private static final String LOGTAG = "LoggedInActivity";

    private IBleDoorProxy mDoorProxy;
    private INfcHelper mNfcHelper;
    private ILoggedUser mLoggedUser;
    private boolean mHandledNfcOnStartup;

    private Switch mMarkSwitch;
    private View mOpenButton;
    private View mMarkButton;
    private View mOpenAndMarkButton;
    private ProgressDialog mProgressDialog;
    private ImageView mMarkStatus;

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

        this.mMarkStatus = (ImageView) this.findViewById(R.id.mark_status);

        this.mMarkSwitch = (Switch) this.findViewById(R.id.mark_switch);
        this.mMarkSwitch.setChecked(true);
        this.mMarkSwitch.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                if (isChecked) {
                    mMarkStatus.setImageDrawable(getResources().getDrawable(R.drawable.ic_mark));
                } else {
                    mMarkStatus.setImageDrawable(getResources().getDrawable(R.drawable.ic_mark_disabled));
                }
            }
        });

        ((TextView) this.findViewById(R.id.name)).setText(this.mLoggedUser.getName());

        NfcManager nfcManager = (NfcManager) this.getSystemService(NFC_SERVICE);
        this.mNfcHelper = new NfcHelper(this, this, nfcManager.getDefaultAdapter());

        this.checkBleProxy();

        // otherwise not useful
        this.mOpenButton = this.findViewById(R.id.btn_open);
        this.mOpenButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                mDoorProxy.openOnly(mLoggedUser.getTokenHash());
                showProgressDialog(R.string.loading, R.string.please_wait);
                enableActions(false);
            }
        });

        // otherwise not useful
        this.mMarkButton = this.findViewById(R.id.btn_mark);
        this.mMarkButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                mDoorProxy.markOnly(mLoggedUser.getTokenHash());
                showProgressDialog(R.string.loading, R.string.please_wait);
                enableActions(false);
            }
        });

        // otherwise not useful
        this.mOpenAndMarkButton = this.findViewById(R.id.btn_open_and_mark);
        this.mOpenAndMarkButton.getLayoutParams().height = (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, 100, getResources().getDisplayMetrics());
        this.mOpenAndMarkButton.getLayoutParams().width = (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, 100, getResources().getDisplayMetrics());
        this.mOpenAndMarkButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                mDoorProxy.openAndMark(mLoggedUser.getTokenHash());
                showProgressDialog(R.string.loading, R.string.please_wait);
                enableActions(false);
            }
        });

        this.mProgressDialog = new ProgressDialog(this);
        this.mProgressDialog.setIndeterminate(true);
        this.mProgressDialog.setCancelable(false);
        //}

//        OkHttpClient client = new OkHttpClient();
//        client.networkInterceptors().add(new StethoInterceptor());
//        RestAdapter adapter = new RestAdapter.Builder()
//                .setEndpoint(this.getString(R.string.server_url))
//                .setClient(new OkClient(client))
//                .setRequestInterceptor(new RequestInterceptor() {
//                    @Override
//                    public void intercept(RequestFacade request) {
//                        request.addHeader("Authorization", String.format("Bearer %s", mLoggedUser.getToken()));
//                    }
//                })
//                .build();
//
//        OrganizationsEndPoint orgEndPoint = adapter.create(OrganizationsEndPoint.class);
//        orgEndPoint.get("5578236ba5d5b416001ec31b", new Callback<Organization>() {
//            @Override
//            public void success(Organization organization, Response response) {
//                Log.e(LOGTAG, "found " + organization.getName() + " organization");
//            }
//
//            @Override
//            public void failure(RetrofitError error) {
//
//            }
//        });
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
        this.checkBleProxy();
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
        this.mOpenButton.postDelayed(new Runnable() {
            @Override
            public void run() {
                enableActions(true);
            }
        }, 3000);
    }

    @Override
    public void onDoorOpened() {
        this.hideProgressDialog();
//      enableActions(true);
    }

    @Override
    public void onBLEError(final String error) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                hideProgressDialog();
                handleGenericError(error);
            }
        });
    }

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

    private void checkBleProxy() {
        if (this.mDoorProxy == null) {
            this.mDoorProxy = BleDoorProxy.create(this, this.getString(R.string.raspberry_name), this);
        }

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

                this.mNfcHelper.writeToken(this.mLoggedUser.getToken(), this.mMarkSwitch.isChecked());
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
                    sharedPref.getString(ILoggedUser.PREF_LOGGED_USER_EMAIL, ""),
                    sharedPref.getString(ILoggedUser.PREF_LOGGED_USER_TOKEN_HASH, "")
            );
        }
    }

    private void enableActions(boolean enable) {
        this.mOpenAndMarkButton.setEnabled(enable);
        this.mOpenButton.setEnabled(enable);
        this.mMarkButton.setEnabled(enable);
    }

    // endregion
}
