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
import it.spot.io.doorkeeper.http.IDataResponse;
import it.spot.io.doorkeeper.auth.IGoogleAuthListener;
import it.spot.io.doorkeeper.http.IHttpPostCallback;
import it.spot.io.doorkeeper.model.ILoggedUser;

/**
 * A common splash activity which internally checks if the stored token is still valid.
 *
 * @author Andrea Rinaldi
 */
public class SplashActivity extends Activity implements IGoogleAuthListener {

    private static final int TIMEOUT = 2000;

    private IAuthHelper mAuthenticationHelper;

    private String mAddress;

    // { Activity methods overriding

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        this.mAuthenticationHelper = new AuthHelper();
        this.mAuthenticationHelper.setupGoogleAuthentication(this, this, AuthHelper.PLUS_REQUEST_CODE);

        final SharedPreferences sharedPref = this.getSharedPreferences(DoorKeeperApplication.SHARED_PREFERENCE_NAME, Context.MODE_PRIVATE);

        new Handler().postDelayed(new Runnable() {

            @Override
            public void run() {
                String token = sharedPref.getString(DoorKeeperApplication.SHARED_PREFERENCE_TOKEN_KEY, "");
                if (token != "") {
                    refreshLocalToken(token);
                } else {
                    goToLoginActivity();
                }
            }
        }, TIMEOUT);
    }

    // }

    // { Private methods

    private void refreshLocalToken(final String token) {
        mAuthenticationHelper.refreshLocalLogin(token, new IHttpPostCallback<IDataResponse<ILoggedUser>>() {
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
     * @param result the model returned by the server: it contains user's data.
     */
    private void onLoginCompleted(final ILoggedUser result) {
        final SharedPreferences sharedPref = this.getSharedPreferences(DoorKeeperApplication.SHARED_PREFERENCE_NAME, Context.MODE_PRIVATE);
        final SharedPreferences.Editor editor = sharedPref.edit();
        editor.putString("token", result.getToken());
        editor.putString("address", this.mAddress);
        editor.commit();

        final Intent intent = new Intent(this, LoggedInActivity.class);
        intent.putExtra("token", result.getToken());
        intent.putExtra("email", result.getEmail());
        intent.putExtra("name", result.getName());
        intent.putExtra("id", result.getId());

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
