package it.spot.io.android.auth;

import android.app.Activity;
import android.content.Intent;
import android.content.IntentSender;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;

import com.google.android.gms.auth.GoogleAuthException;
import com.google.android.gms.auth.GoogleAuthUtil;
import com.google.android.gms.auth.UserRecoverableAuthException;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.Scopes;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.Scope;
import com.google.android.gms.plus.Plus;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

import it.spot.io.android.R;
import it.spot.io.android.http.HttpPostHelper;
import it.spot.io.android.http.IDataResponse;
import it.spot.io.android.http.IHttpPostCallback;
import it.spot.io.android.http.IJsonResponse;
import it.spot.io.android.model.ILoggedUser;
import it.spot.io.android.model.LoggedUser;

/**
 * @author a.rinaldi
 */
public class AuthHelper
        implements IAuthHelper {

    // region Properties

    public static final int ERROR_CODE_LOGIN_ERROR = 0;
    public static final int ERROR_CODE_PROFILE_ERROR = 1;
    public static final int ERROR_CODE_REFRESH_ERROR = 2;
    public static final int ERROR_CODE_LOGIN_UNAUTHORIZED_ERROR = 3;

    private static final int REQUEST_CODE_GOOGLE_SING_IN = 2;

    private final Activity mActivity;
    private final Listener mListener;
    private final HttpPostHelper mHttpPostHelper;

    private boolean mIsResolving = false;
    private boolean mShouldResolve = false;
    private GoogleApiClient mGoogleApiClient;

    // endregion

    // region Construction

    public AuthHelper(Activity activity, Listener listener) {
        super();
        this.mActivity = activity;
        this.mListener = listener;
        this.mHttpPostHelper = new HttpPostHelper();
    }

    // endregion

    // region IAuthHelper implementation

    @Override
    public void login(String email, String password) {
        JSONObject jsonObject = new JSONObject();
        try {
            jsonObject.put("email", email);
            jsonObject.put("password", password);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        String url = String.format("%s/%s", this.mActivity.getString(R.string.server_url), "auth/local/");
        mHttpPostHelper.post(url, jsonObject, new IHttpPostCallback<IJsonResponse>() {

            @Override
            public void exec(IJsonResponse jsonResponse) {
                try {
                    if (!jsonResponse.hasError()) {
                        JSONObject jsonData = jsonResponse.getJSON();
                        String token = jsonData.getString("token");

                        refresh(token);
                    } else {
                        if (jsonResponse.getErrorMessage().equals("401")) {
                            mListener.onError(ERROR_CODE_LOGIN_UNAUTHORIZED_ERROR, "Unauthorized.");
                        }
                    }
                } catch (JSONException e) {
                    mListener.onError(ERROR_CODE_LOGIN_ERROR, e.getMessage());
                }
            }
        });
    }

    @Override
    public void loginByGoogle() {
        if (this.mGoogleApiClient == null) {
            this.mGoogleApiClient = new GoogleApiClient.Builder(this.mActivity)
                    .addConnectionCallbacks(this)
                    .addOnConnectionFailedListener(this)
                    .addApi(Plus.API)
                    .addScope(new Scope(Scopes.PROFILE))
                    .build();
        }

        if (this.mGoogleApiClient.isConnecting() || this.mGoogleApiClient.isConnected()) {
            return;
        }

        this.mShouldResolve = true;
        this.mGoogleApiClient.connect();
    }

    @Override
    public void refreshLogin(String token) {
        this.refresh(token);
    }

    @Override
    public boolean checkGoogleErrorsResolution(int requestCode, int responseCode, Intent intent) {
        if (requestCode == REQUEST_CODE_GOOGLE_SING_IN) {
            // If the error resolution was not successful we should not resolve further.
            if (responseCode != Activity.RESULT_OK) {
                mShouldResolve = false;
            }

            mIsResolving = false;
            mGoogleApiClient.connect();

            return true;
        }

        return false;
    }

    // endregion

    // region Private methods

    /**
     * Refreshes the token and validates the sign-in of the user.
     *
     * @param token the token to refresh
     */
    private void refresh(String token) {

        final JSONObject jsonObject = new JSONObject();
        try {
            jsonObject.put("token", token);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        String url = String.format("%s/%s", this.mActivity.getString(R.string.server_url), "auth/local/refresh");
        mHttpPostHelper.post(url, jsonObject, new IHttpPostCallback<IJsonResponse>() {

            @Override
            public void exec(IJsonResponse jsonResponse) {

                IDataResponse<ILoggedUser> response = null;

                try {
                    if (!jsonResponse.hasError()) {

                        JSONObject jsonData = jsonResponse.getJSON();

                        JSONObject jsonUser = jsonData.getJSONObject("user");
                        String name = jsonUser.getString("name");
                        String id = jsonUser.getString("_id");
                        String newToken = jsonData.getString("token");
                        String type = jsonData.getString("type");

                        mListener.onLoginCompleted(new LoggedUser(id, name, newToken, type));
                    } else {
                        mListener.onError(ERROR_CODE_REFRESH_ERROR, jsonResponse.getErrorMessage());
                    }
                } catch (JSONException e) {
                    mListener.onError(ERROR_CODE_REFRESH_ERROR, e.getMessage());
                }
            }
        });
    }

    /**
     * Gets the profile info of the io@spot user.
     *
     * @param token the authentication token
     * @param email the user email
     */
    private void getUserProfile(final String token, final String email) {
        JSONObject jsonObject = new JSONObject();
        try {
            jsonObject.put("email", email);
            jsonObject.put("token", token);

        } catch (JSONException e) {
            e.printStackTrace();
        }

        String url = String.format("%s/%s", this.mActivity.getString(R.string.server_url), "auth/google/getLocalUser");
        mHttpPostHelper.post(url, jsonObject, new IHttpPostCallback<IJsonResponse>() {

            @Override
            public void exec(IJsonResponse jsonResponse) {

                IDataResponse<ILoggedUser> response = null;

                try {
                    if (!jsonResponse.hasError()) {

                        JSONObject jsonData = jsonResponse.getJSON();
                        JSONObject jsonUser = jsonData.getJSONObject("user");
                        String token = jsonData.getString("token");
                        String name = jsonUser.getString("name");
                        String id = jsonUser.getString("_id");

                        mListener.onLoginCompleted(new LoggedUser(id, name, token, email));
                    } else {
                        Log.e("AUTH HELPER", "Error retrieving the user profile");
                        mListener.onError(ERROR_CODE_PROFILE_ERROR, "Error retrieving user profile.");
                    }
                } catch (JSONException e) {
                    Log.e("AUTH HELPER", "Error retrieving the user profile");
                    mListener.onError(ERROR_CODE_PROFILE_ERROR, "Error retrieving user profile.");
                }
            }
        });
    }

    // endregion

    // region GoogleApiClient.OnConnectionFailedListener implementation

    @Override
    public void onConnectionFailed(ConnectionResult connectionResult) {
        // Could not connect to Google Play Services.  The user needs to select an account,
        // grant permissions or resolve an error in order to sign in. Refer to the javadoc for
        // ConnectionResult to see possible error codes.
        Log.d("LogInActivity", "onConnectionFailed:" + connectionResult);

        if (!mIsResolving && mShouldResolve) {
            if (connectionResult.hasResolution()) {
                try {
                    connectionResult.startResolutionForResult(this.mActivity, REQUEST_CODE_GOOGLE_SING_IN);
                    mIsResolving = true;
                } catch (IntentSender.SendIntentException e) {
                    Log.e("LogInActivity", "Could not resolve ConnectionResult.", e);
                    mIsResolving = false;
                    mGoogleApiClient.connect();
                }
            } else {
                // Could not resolve the connection result, show the user an
                // error dialog.
//                showErrorDialog(connectionResult);
                // TODO - notify error
            }
        } else {
            // Show the signed-out UI
//            showSignedOutUI();
            // TODO - notify sign out
        }
    }

    // endregion

    // region GoogleApiClient.ConnectionCallbacks implementation

    @Override
    public void onConnected(Bundle bundle) {
        mShouldResolve = false;
        new GetOAuthTokenTask().execute();
    }

    @Override
    public void onConnectionSuspended(int i) {
        // TODO - don't know
    }

    // endregion

    // region Inner classes and interfaces

    private class GetOAuthTokenTask
            extends AsyncTask<Void, Void, String> {

        @Override
        protected String doInBackground(Void... voids) {
            String scope = "oauth2:" + Scopes.PLUS_LOGIN + " https://www.googleapis.com/auth/userinfo.email";

            try {
                return GoogleAuthUtil.getToken(mActivity, Plus.AccountApi.getAccountName(mGoogleApiClient), scope);
            } catch (UserRecoverableAuthException e) {
                mActivity.startActivityForResult(e.getIntent(), REQUEST_CODE_GOOGLE_SING_IN);
            } catch (GoogleAuthException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            }

            return null;
        }

        @Override
        protected void onPostExecute(final String token) {
            if (token != null) {
                getUserProfile(token, Plus.AccountApi.getAccountName(mGoogleApiClient));
            }
        }
    }

    // endregion
}
