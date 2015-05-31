package it.spot.io.doorkeeper.activities;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.Handler;
import android.widget.Toast;

import it.spot.io.doorkeeper.DoorKeeperApplication;
import it.spot.io.doorkeeper.R;
import it.spot.io.doorkeeper.auth.AuthHelper;
import it.spot.io.doorkeeper.auth.IAuthHelper;
import it.spot.io.doorkeeper.auth.IGoogleAuthListener;
import it.spot.io.doorkeeper.http.IDataResponse;
import it.spot.io.doorkeeper.http.IHttpPostCallback;
import it.spot.io.doorkeeper.model.ILoggedUser;

/**
 * A common splash activity which internally checks if the stored token is still valid.
 *
 * @author Andrea Rinaldi
 */
public class SplashActivity
        extends Activity
        implements Runnable, IGoogleAuthListener {

    private static final int TIMEOUT = 2000;

    private IAuthHelper mAuthenticationHelper;

    private String mAddress;

    // { Activity methods overriding

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        this.setContentView(R.layout.activity_splash);

        this.mAuthenticationHelper = new AuthHelper();
        this.mAuthenticationHelper.setupGoogleAuthentication(this, this, AuthHelper.PLUS_REQUEST_CODE);

        new Handler().postDelayed(this, TIMEOUT);
    }

    // }

    // { Runnable implementation

    @Override
    public void run() {
        final SharedPreferences sharedPref = this.getSharedPreferences(DoorKeeperApplication.SHARED_PREFERENCE_NAME, Context.MODE_PRIVATE);
        final String token = sharedPref.getString(ILoggedUser.PREF_LOGGED_USER_TOKEN, "");
        if (token != "") {
            this.refreshLocalToken(token);
        } else {
            this.goToLoginActivity();
        }
    }

    // }

    // { Private methods

    private void refreshLocalToken(final String token) {
        this.mAuthenticationHelper.refreshLocalLogin(token, new IHttpPostCallback<IDataResponse<ILoggedUser>>() {
            @Override
            public void exec(IDataResponse<ILoggedUser> response) {

                if (!response.hasError()) {
                    onLoginCompleted(response.getData());
                } else {
                    Toast.makeText(SplashActivity.this, "##Error refreshing token", Toast.LENGTH_LONG).show();
                    goToLoginActivity();
                }
            }
        });
    }

    /**
     * This method gets called when login process goes well.</br>
     * It stores in {@link android.content.SharedPreferences} the server's IP address and the user token,
     * then navigates to the application's landing page.
     *
     * @param user the logged user model returned from the server
     */
    private void onLoginCompleted(final ILoggedUser user) {
        final SharedPreferences sharedPref = this.getSharedPreferences(DoorKeeperApplication.SHARED_PREFERENCE_NAME, Context.MODE_PRIVATE);
        final SharedPreferences.Editor editor = sharedPref.edit();
        editor.putString(ILoggedUser.PREF_LOGGED_USER_ID, user.getId());
        editor.putString(ILoggedUser.PREF_LOGGED_USER_NAME, user.getName());
        editor.putString(ILoggedUser.PREF_LOGGED_USER_TOKEN, user.getToken());
        editor.putString(ILoggedUser.PREF_LOGGED_USER_EMAIL, user.getEmail());
        editor.commit();

        final Intent intent = new Intent(this, LoggedInActivity.class);
        intent.putExtra(LoggedInActivity.EXTRA_LOGGED_USER, user);
        this.startActivity(intent);
    }

    /**
     * This method simply navigates to the {@link it.spot.io.doorkeeper.activities.LogInActivity}.
     */
    private void goToLoginActivity() {
        this.startActivity(new Intent(this, LogInActivity.class));
    }

    // }

    // { IGoogleAuthListener implementation

    @Override
    public void onPlusConnected(String token, String name) {
        // INF: Emtpy
    }

    @Override
    public void onPlusDisconnected() {
        // INF: Emtpy
    }

    @Override
    public void onPlusAccessRevoked() {
        // INF: Emtpy
    }

    // }

}
