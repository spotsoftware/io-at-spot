package it.spot.io.doorkeeper.activities;

import android.app.Activity;
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

import it.spot.io.doorkeeper.DoorKeeperApplication;
import it.spot.io.doorkeeper.R;
import it.spot.io.doorkeeper.auth.AuthHelper;
import it.spot.io.doorkeeper.auth.AuthUtils;
import it.spot.io.doorkeeper.auth.IAuthHelper;
import it.spot.io.doorkeeper.auth.IGoogleAuthListener;
import it.spot.io.doorkeeper.http.IDataResponse;
import it.spot.io.doorkeeper.http.IHttpPostCallback;
import it.spot.io.doorkeeper.model.ILoggedUser;


/**
 * A login screen that offers login via email/password and via Google+ sign in.
 * <p/>
 * ************ IMPORTANT SETUP NOTES: ************
 * In order for Google+ sign in to work with your app, you must first go to:
 * https://developers.google.com/+/mobile/android/getting-started#step_1_enable_the_google_api
 * and follow the steps in "Step 1" to create an OAuth 2.0 client for your package.
 */
public class LogInActivity extends BaseActivity implements IGoogleAuthListener {

    // UI references.
    private EditText mEmailView;
    private EditText mPasswordView;
    private Button mEmailSignInButton;
    private SignInButton mPlusSignInButton;

    private View mLoginFormView;

    private IAuthHelper mAuthenticationHelper;

    // { BaseActivity methods overriding

    @Override
    protected void onCreate(final Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        this.setContentView(R.layout.activity_log_in);

        this.mPlusSignInButton = (SignInButton) this.findViewById(R.id.plus_sign_in_button);
        this.mPlusSignInButton.setEnabled(true);
        if (this.areGooglePlayServicesSupported()) {
            this.mPlusSignInButton.setOnClickListener(new OnClickListener() {

                @Override
                public void onClick(View view) {
                    if (!mAuthenticationHelper.googleLogin()) {
                        showProgressDialog(R.string.loading_title, R.string.loading);
                    }
                }
            });
        } else {
            this.mPlusSignInButton.setVisibility(View.GONE);
        }

        this.initializeLoginForm();

        this.mAuthenticationHelper = new AuthHelper();
        this.mAuthenticationHelper.setupGoogleAuthentication(this, this, AuthHelper.PLUS_REQUEST_CODE);

        SharedPreferences sharedPref = this.getSharedPreferences(DoorKeeperApplication.SHARED_PREFERENCE_NAME, Context.MODE_PRIVATE);

        final Bundle extras = this.getIntent().getExtras();
        if (extras != null && extras.getBoolean("logout")) {
            SharedPreferences.Editor editor = sharedPref.edit();
            editor.putString(DoorKeeperApplication.SHARED_PREFERENCE_TOKEN_KEY, "");
            editor.commit();
            this.mAuthenticationHelper.googleLogout();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int responseCode, Intent intent) {

        if (requestCode == AuthHelper.PLUS_REQUEST_CODE && responseCode == RESULT_OK) {
            this.mAuthenticationHelper.googleResolution(responseCode, intent);
        } else if (requestCode == AuthHelper.PLUS_REQUEST_CODE && responseCode != Activity.RESULT_OK) {
            // If we've got an error we can't resolve, we're no longer in the midst of signing
            // in, so we can stop the progress spinner.
            this.hideProgressDialog();
        }
    }

    // }

    // { Private methods

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
     * Through this method, the activity tries to refresh the stored access token.
     *
     * @param token the access token to refresh
     */
    private void refreshLocalToken(final String token) {
        this.showProgressDialog(R.string.loading_title, R.string.loading);

        this.mAuthenticationHelper.refreshLocalLogin(token, new IHttpPostCallback<IDataResponse<ILoggedUser>>() {
            @Override
            public void exec(IDataResponse<ILoggedUser> response) {

                hideProgressDialog();

                if (!response.hasError()) {
                    onLoginCompleted(response.getData());
                } else {
                    handleGenericError(response.getErrorMessage());
                }
            }
        });
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
            // There was an error; don't attempt login and focus the first
            // form field with an error.
            focusView.requestFocus();
        } else {
            // Show a progress spinner, and kick off a background task to
            // perform the user login attempt.
            this.showProgressDialog(R.string.loading_title, R.string.loading);

            this.mAuthenticationHelper.localLogin(email, password, new IHttpPostCallback<IDataResponse<String>>() {
                @Override
                public void exec(IDataResponse<String> response) {

                    if (!response.hasError()) {
                        refreshLocalToken(response.getData());
                    } else {
                        hideProgressDialog();
                        if (response.getErrorMessage().equals("401")) {
                            mPasswordView.setError("Invalid password");
                            mPasswordView.requestFocus();
                            handleGenericError(R.string.error_invalid_password);
                        } else {
                            handleGenericError(response.getErrorMessage());
                        }
                    }
                }
            });
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

    /**
     * This method handles the login flow completion.</br>
     * No need to check error presence, this code gets executed only in the successful case.
     *
     * @param user the model mapping the logged user's data
     */
    private void onLoginCompleted(final ILoggedUser user) {
        SharedPreferences sharedPref = getSharedPreferences(DoorKeeperApplication.SHARED_PREFERENCE_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putString(DoorKeeperApplication.SHARED_PREFERENCE_TOKEN_KEY, user.getToken());
        editor.commit();

        Intent intent = new Intent(this, LoggedInActivity.class);
        intent.putExtra("token", user.getToken());
        intent.putExtra("email", user.getEmail());
        intent.putExtra("name", user.getName());
        intent.putExtra("id", user.getId());

        startActivity(intent);
        finish();
    }

    // }

    // { IGoogleAuthListener implementation

    @Override
    public void onPlusConnected(final String oAuthToken, final String email) {

        this.mAuthenticationHelper.getLocalUser(oAuthToken, email, new IHttpPostCallback<IDataResponse<ILoggedUser>>() {
            @Override
            public void exec(final IDataResponse<ILoggedUser> response) {
                hideProgressDialog();

                if (!response.hasError()) {
                    onLoginCompleted(response.getData());
                } else {
                    handleGenericError(response.getErrorMessage());
                    mAuthenticationHelper.resetGoogleAuthentication();
                }
            }
        });
    }

    @Override
    public void onPlusDisconnected() {
        // INF: Empty
    }

    @Override
    public void onPlusAccessRevoked() {
        // TODO: Access to the user's G+ account has been revoked.  Per the developer terms, delete
        // any stored user data here.
    }

    // }

}



