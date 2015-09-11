package it.spot.io.app.login;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.KeyEvent;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.inputmethod.EditorInfo;
import android.widget.AutoCompleteTextView;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GooglePlayServicesUtil;
import com.google.android.gms.common.SignInButton;

import it.spot.io.app.DoorKeeperApplication;
import it.spot.io.android.R;
import it.spot.io.android.BaseActivity;
import it.spot.io.app.home.LoggedInActivity;
import it.spot.io.app.login.auth.AuthUtils;
import it.spot.io.app.login.auth.Authenticator;
import it.spot.io.app.login.auth.IAuthenticator;
import it.spot.io.app.login.auth.model.ILoggedUser;


/**
 * A login screen that offers login via email/password and via Google+ sign in.
 * <p/>
 * ************ IMPORTANT SETUP NOTES: ************
 * In order for Google+ sign in to work with your app, you must first go to:
 * https://developers.google.com/+/mobile/android/getting-started#step_1_enable_the_google_api
 * and follow the steps in "Step 1" to create an OAuth 2.0 client for your package.
 */
public class LogInActivity
        extends BaseActivity
        implements IAuthenticator.Listener {

    // UI references.
    private EditText mEmailView;
    private EditText mPasswordView;
    private Button mEmailSignInButton;
    private SignInButton mPlusSignInButton;

    private View mLoginFormView;

    private IAuthenticator mAuthenticator;

    // { BaseActivity methods overriding

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        this.setContentView(R.layout.activity_log_in);

        this.mAuthenticator = new Authenticator(this, this);

        this.mPlusSignInButton = (SignInButton) this.findViewById(R.id.plus_sign_in_button);
        if (this.areGooglePlayServicesSupported()) {
            this.mPlusSignInButton.setEnabled(true);
            this.mPlusSignInButton.setOnClickListener(new OnClickListener() {
                @Override
                public void onClick(View v) {
                    showProgressDialog(R.string.loading_title, R.string.loading);
                    mAuthenticator.loginByGoogle();
                }
            });
        }

        this.initializeLoginForm();

        // checks logout
        Bundle extras = this.getIntent().getExtras();
        if (extras != null && extras.getBoolean("logout")) {
            SharedPreferences sharedPref = this.getSharedPreferences(DoorKeeperApplication.SHARED_PREFERENCE_NAME, Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = sharedPref.edit();
            editor.putString(ILoggedUser.PREF_LOGGED_USER_ID, "");
            editor.putString(ILoggedUser.PREF_LOGGED_USER_NAME, "");
            editor.putString(ILoggedUser.PREF_LOGGED_USER_TOKEN, "");
            editor.putString(ILoggedUser.PREF_LOGGED_USER_EMAIL, "");
            editor.putString(ILoggedUser.PREF_LOGGED_USER_TOKEN_HASH, "");
            editor.commit();
            // TODO - logout
            //this.mAuthenticator.googleLogout();
        }
    }

    @Override
    protected void onStop() {
        super.onStop();
        this.mAuthenticator.destroy();
    }

    @Override
    protected void onActivityResult(int requestCode, int responseCode, Intent intent) {
        if (!this.mAuthenticator.checkGoogleErrorsResolution(requestCode, responseCode, intent)) {
            super.onActivityResult(requestCode, responseCode, intent);
        }
    }

    // endregion

    // region Private methods

    /**
     * It simply initializes the login form and its fields.
     */
    private void initializeLoginForm() {
        this.mEmailView = (AutoCompleteTextView) findViewById(R.id.email);

        this.mPasswordView = (EditText) this.findViewById(R.id.password);
        this.mPasswordView.setOnEditorActionListener(new TextView.OnEditorActionListener() {
            @Override
            public boolean onEditorAction(TextView textView, int id, KeyEvent keyEvent) {
                if (id == R.id.login || id == EditorInfo.IME_NULL) {
                    attemptLocalLogin();
                    return true;
                }
                return false;
            }
        });

        this.mEmailSignInButton = (Button) findViewById(R.id.email_sign_in_button);
        this.mEmailSignInButton.setEnabled(true);
        this.mEmailSignInButton.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View view) {
                attemptLocalLogin();
            }
        });

        this.mLoginFormView = findViewById(R.id.login_form);
    }

        /**
         * Attempts to sign in or register the account specified by the login form.
         * If there are form errors (invalid email, missing fields, etc.), the
         * errors are presented and no actual login attempt is made.
         */
        private void attemptLocalLogin() {

        // Reset errors.
        this.mEmailView.setError(null);
        this.mPasswordView.setError(null);

        // Store values at the time of the login attempt.
        final String email = this.mEmailView.getText().toString();
        String password = this.mPasswordView.getText().toString();

        boolean cancel = false;
        View focusView = null;

        // Check for a valid password, if the user entered one.
        if (!TextUtils.isEmpty(password) && !AuthUtils.isPasswordValid(password)) {
            this.mPasswordView.setError(this.getString(R.string.error_invalid_password));
            focusView = this.mPasswordView;
            cancel = true;
        }

        // Check for a valid email address.
        if (TextUtils.isEmpty(email)) {
            this.mEmailView.setError(this.getString(R.string.error_field_required));
            focusView = this.mEmailView;
            cancel = true;
        } else if (!AuthUtils.isEmailValid(email)) {
            this.mEmailView.setError(this.getString(R.string.error_invalid_email));
            focusView = this.mEmailView;
            cancel = true;
        }

        if (cancel) {
            focusView.requestFocus();
        } else {
            this.showProgressDialog(R.string.loading_title, R.string.loading);
            this.mAuthenticator.login(email, password);
        }
    }

    /**
     * Check if the device supports Google Play Services.  It's best
     * practice to check first rather than handling this as an error case.
     *
     * @return whether the device supports Google Play Services
     */
    private boolean areGooglePlayServicesSupported() {
        return GooglePlayServicesUtil.isGooglePlayServicesAvailable(this) == ConnectionResult.SUCCESS;
    }

    // endregion

    // region IAuthenticator.Listener implementation

    @Override
    public void onLoginCompleted(ILoggedUser user) {
        final SharedPreferences sharedPref = this.getSharedPreferences(DoorKeeperApplication.SHARED_PREFERENCE_NAME, Context.MODE_PRIVATE);
        final SharedPreferences.Editor editor = sharedPref.edit();
        editor.putString(ILoggedUser.PREF_LOGGED_USER_ID, user.getId());
        editor.putString(ILoggedUser.PREF_LOGGED_USER_NAME, user.getName());
        editor.putString(ILoggedUser.PREF_LOGGED_USER_TOKEN, user.getToken());
        editor.putString(ILoggedUser.PREF_LOGGED_USER_TOKEN_HASH, user.getTokenHash());
        editor.putString(ILoggedUser.PREF_LOGGED_USER_EMAIL, user.getEmail());
        editor.commit();

        this.hideProgressDialog();

        final Intent intent = new Intent(this, LoggedInActivity.class);
        intent.putExtra(LoggedInActivity.EXTRA_LOGGED_USER, user);
        this.startActivity(intent);
        this.finish();
    }

    @Override
    public void onError(int errCode, String errMessage) {
        this.hideProgressDialog();

        if (errCode == Authenticator.ERROR_CODE_LOGIN_UNAUTHORIZED_ERROR) {
            this.mPasswordView.setError("Invalid password");
            this.mPasswordView.requestFocus();
        }

        this.handleGenericError(errMessage);
    }

    // endregion
}



