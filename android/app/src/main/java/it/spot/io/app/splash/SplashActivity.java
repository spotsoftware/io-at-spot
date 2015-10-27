package it.spot.io.app.splash;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.Handler;

import it.spot.io.app.home.LoggedInActivity;
import it.spot.io.app.DoorKeeperApplication;
import it.spot.io.android.R;
import it.spot.io.app.home.HomeActivity;
import it.spot.io.app.login.auth.Authenticator;
import it.spot.io.app.login.auth.IAuthenticator;
import it.spot.io.app.login.LogInActivity;
import it.spot.io.app.login.auth.model.ILoggedUser;

/**
 * A common splash activity which internally checks if the stored token is still valid.
 *
 * @author Andrea Rinaldi
 */
public class SplashActivity
        extends Activity
        implements Runnable, IAuthenticator.Listener {

    private static final int TIMEOUT = 2000;

    private IAuthenticator mAuthenticator;

    // { Activity methods overriding

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        this.setContentView(R.layout.activity_splash);

        this.mAuthenticator = new Authenticator(this, this);

        new Handler().postDelayed(this, TIMEOUT);
    }

    // }

    // { Runnable implementation

    @Override
    public void run() {
        final SharedPreferences sharedPref = this.getSharedPreferences(DoorKeeperApplication.SHARED_PREFERENCE_NAME, Context.MODE_PRIVATE);
        final String token = sharedPref.getString(ILoggedUser.PREF_LOGGED_USER_TOKEN, "");
        if (token != "") {
            this.mAuthenticator.refreshLogin(token);
        } else {
            // navigates to login activity
            this.startActivity(new Intent(this, LogInActivity.class));
        }
    }

    // }

    // region IAuthenticator.Listener implementation

    @Override
    public void onLoginCompleted(final ILoggedUser user) {
        final SharedPreferences sharedPref = this.getSharedPreferences(DoorKeeperApplication.SHARED_PREFERENCE_NAME, Context.MODE_PRIVATE);
        final SharedPreferences.Editor editor = sharedPref.edit();
        editor.putString(ILoggedUser.PREF_LOGGED_USER_ID, user.getId());
        editor.putString(ILoggedUser.PREF_LOGGED_USER_NAME, user.getName());
        editor.putString(ILoggedUser.PREF_LOGGED_USER_TOKEN, user.getToken());
        editor.putString(ILoggedUser.PREF_LOGGED_USER_TOKEN_HASH, user.getTokenHash());
        editor.putString(ILoggedUser.PREF_LOGGED_USER_EMAIL, user.getEmail());
        editor.commit();

        final Intent intent = new Intent(this, LoggedInActivity.class);
//        final Intent intent = new Intent(this, HomeActivity.class);
//        intent.putExtra(LoggedInActivity.EXTRA_LOGGED_USER, user);
        this.startActivity(intent);
    }

    @Override
    public void onError(int errCode, String errMessage) {
        // navigates to login activity, without taking care of the reason
        this.startActivity(new Intent(this, LogInActivity.class));
    }

    // endregion
}
