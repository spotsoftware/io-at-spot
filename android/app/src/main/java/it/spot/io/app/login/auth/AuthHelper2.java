//package it.spot.io.app.login.auth;
//
//import android.app.Activity;
//import android.content.Intent;
//import android.content.IntentSender;
//import android.os.AsyncTask;
//import android.os.Bundle;
//
//import com.google.android.gms.auth.GoogleAuthException;
//import com.google.android.gms.auth.GoogleAuthUtil;
//import com.google.android.gms.auth.UserRecoverableAuthException;
//import com.google.android.gms.common.ConnectionResult;
//import com.google.android.gms.common.Scopes;
//import com.google.android.gms.common.api.GoogleApiClient;
//
//import org.json.JSONException;
//import org.json.JSONObject;
//
//import java.io.IOException;
//
//import it.spot.io.android.R;
//import it.spot.io.android.http.DataResponse;
//import it.spot.io.android.http.HttpPostHelper;
//import it.spot.io.android.http.IDataResponse;
//import it.spot.io.android.http.IHttpPostCallback;
//import it.spot.io.android.http.IJsonResponse;
//import it.spot.io.app.login.auth.model.ILoggedUser;
//import it.spot.io.app.login.auth.model.LoggedUser;
//
///**
// * Created by andreacorzani on 19/10/14.
// */
//public class AuthHelper2 implements IAuthenticator {
//
//    // A magic number used to know that the sign-in error resolution activity has completed
//    public static final int PLUS_REQUEST_CODE = 49404;
//
//    private HttpPostHelper mHttpPostHelper;
//
//    // A flag to stop multiple dialogues appearing for the user
//    private boolean mAutoResolveOnFail;
//
//    // A flag to track when a connection is already in progress
//    public boolean mPlusClientIsConnecting = false;
//
//    // The saved result from {@link #onConnectionFailed(ConnectionResult)}.  If a connection
//    // attempt has been made, this is non-null.
//    // If this IS null, then the connect method is still running.
//    private ConnectionResult mConnectionResult;
//
//    private IGoogleAuthListener mListener;
//
//    private Activity mActivity;
//
//    public AuthHelper2() {
//        this.mHttpPostHelper = new HttpPostHelper();
//    }
//
//    @Override
//    public void refreshLocalLogin(String token, final IHttpPostCallback<IDataResponse<ILoggedUser>> callback) {
//
//        final JSONObject jsonObject = new JSONObject();
//        try {
//            jsonObject.put("token", token);
//        } catch (JSONException e) {
//            e.printStackTrace();
//        }
//
//        String url = String.format("%s/%s", this.mActivity.getString(R.string.server_url), "auth/local/refresh");
//        mHttpPostHelper.post(url, jsonObject, new IHttpPostCallback<IJsonResponse>() {
//
//            @Override
//            public void exec(IJsonResponse jsonResponse) {
//
//
//                IDataResponse<ILoggedUser> response = null;
//
//                try {
//                    if (!jsonResponse.hasError()) {
//
//                        JSONObject jsonData = jsonResponse.getJSON();
//
//                        JSONObject jsonUser = jsonData.getJSONObject("user");
//                        String name = jsonUser.getString("name");
//                        String id = jsonUser.getString("_id");
//                        String newToken = jsonData.getString("token");
//                        String type = jsonData.getString("type");
//
//                        response = new DataResponse<ILoggedUser>(new LoggedUser(id, name, newToken, type));
//
//                    } else {
//                        response = new DataResponse<ILoggedUser>();
//                        response.setErrorMessage(jsonResponse.getErrorMessage());
//                    }
//
//                } catch (JSONException e) {
//                    response = new DataResponse<ILoggedUser>();
//                    response.setErrorMessage(e.getMessage());
//                }
//
//                callback.exec(response);
//            }
//        });
//    }
//
//    @Override
//    public void localLogin(String email, String password, final IHttpPostCallback<IDataResponse<String>> callback) {
//        JSONObject jsonObject = new JSONObject();
//        try {
//            jsonObject.put("email", email);
//            jsonObject.put("password", password);
//        } catch (JSONException e) {
//            e.printStackTrace();
//        }
//
//        String url = String.format("%s/%s", this.mActivity.getString(R.string.server_url), "auth/local/");
//        mHttpPostHelper.post(url, jsonObject, new IHttpPostCallback<IJsonResponse>() {
//
//            @Override
//            public void exec(IJsonResponse jsonResponse) {
//
//                IDataResponse<String> response = null;
//
//                try {
//                    if (!jsonResponse.hasError()) {
//
//                        JSONObject jsonData = jsonResponse.getJSON();
//                        String token = jsonData.getString("token");
//                        response = new DataResponse<String>(token);
//
//                    } else {
//
//                        response = new DataResponse<String>();
//                        response.setErrorMessage(jsonResponse.getErrorMessage());
//
//                    }
//                } catch (JSONException e) {
//                    response = new DataResponse<String>();
//                    response.setErrorMessage(e.getMessage());
//                }
//
//                callback.exec(response);
//            }
//        });
//    }
//
//    @Override
//    public void getLocalUser(final String token, final String email, final IHttpPostCallback<IDataResponse<ILoggedUser>> callback) {
//        JSONObject jsonObject = new JSONObject();
//        try {
//            jsonObject.put("email", email);
//            jsonObject.put("token", token);
//
//        } catch (JSONException e) {
//            e.printStackTrace();
//        }
//
//        String url = String.format("%s/%s", this.mActivity.getString(R.string.server_url), "auth/google/getLocalUser");
//        mHttpPostHelper.post(url, jsonObject, new IHttpPostCallback<IJsonResponse>() {
//
//            @Override
//            public void exec(IJsonResponse jsonResponse) {
//
//                IDataResponse<ILoggedUser> response = null;
//
//                try {
//                    if (!jsonResponse.hasError()) {
//
//                        JSONObject jsonData = jsonResponse.getJSON();
//                        JSONObject jsonUser = jsonData.getJSONObject("user");
//                        String token = jsonData.getString("token");
//                        String name = jsonUser.getString("name");
//                        String id = jsonUser.getString("_id");
//
//                        response = new DataResponse<ILoggedUser>(new LoggedUser(id, name, token, email));
//                    } else {
//                        response = new DataResponse<ILoggedUser>();
//                        response.setErrorMessage(jsonResponse.getErrorMessage());
//                    }
//                } catch (JSONException e) {
//                    response = new DataResponse<ILoggedUser>();
//                    response.setErrorMessage(jsonResponse.getErrorMessage());
//                }
//
//                callback.exec(response);
//            }
//        });
//    }
//
//    @Override
//    public void setupGoogleAuthentication(Activity activity, IGoogleAuthListener listener, int requestCode) {
//
//        this.mActivity = activity;
//        this.mListener = listener;
//        this.mRequestCode = requestCode;
//
//        mPlusClient =
//                new PlusClient.Builder(mActivity, new GooglePlayServicesClient.ConnectionCallbacks() {
//                    @Override
//                    public void onConnected(Bundle bundle) {
//                        new GetOAuthTokenTask().execute();
//                    }
//
//                    @Override
//                    public void onDisconnected() {
//                        mListener.onPlusDisconnected();
//                    }
//                }, new GoogleApiClient.OnConnectionFailedListener() {
//                    @Override
//                    public void onConnectionFailed(ConnectionResult connectionResult) {
//
//                        // Most of the time, the connection will fail with a user resolvable result. We can store
//                        // that in our mConnectionResult property ready to be used when the user clicks the
//                        // sign-in button.
//                        if (connectionResult.hasResolution()) {
//                            mConnectionResult = connectionResult;
//                            if (mAutoResolveOnFail) {
//                                // This is a local helper function that starts the resolution of the problem,
//                                // which may be showing the user an account chooser or similar.
//                                startGoogleResolution();
//                            }
//                        }
//                    }
//                }).setScopes(Scopes.PLUS_LOGIN,
//                        Scopes.PLUS_ME).build();
//    }
//
//    @Override
//    public void resetGoogleAuthentication() {
//        this.mPlusClient.disconnect();
//    }
//
//    @Override
//    public boolean googleLogin() {
//        if (!mPlusClient.isConnected()) {
//            // Make sure that we will connect the resolution (e.g. fire the intent and pop up a
//            // dialog for the user) for any errors that come in.
//            mAutoResolveOnFail = true;
//            // We should always have a connection result ready to resolve,
//            // so we can connect that process.
//            if (mConnectionResult != null) {
//                startGoogleResolution();
//            } else {
//                // If we don't have one though, we can connect connect in
//                // order to retrieve one.
//                initiatePlusClientConnect();
//            }
//        }
//
//        return mPlusClient.isConnected();
//    }
//
//    @Override
//    public void googleLogout() {
//
//        // We only want to sign out if we're connected.
//        if (mPlusClient.isConnected()) {
//            // Clear the default account in order to allow the user to potentially choose a
//            // different account from the account chooser.
//            mPlusClient.clearDefaultAccount();
//
//            // Disconnect from Google Play Services, then reconnect in order to restart the
//            // process from scratch.
//            initiatePlusClientDisconnect();
//
//        }
//    }
//
//    @Override
//    public void googleRevokeAccess() {
//
//        if (mPlusClient.isConnected()) {
//            // Clear the default account as in the Sign Out.
//            mPlusClient.clearDefaultAccount();
//
//            // Revoke access to this entire application. This will call back to
//            // onPlusAccessRevoked when it is complete, as it needs to reach the Google
//            // authentication servers to revoke all tokens.
//            mPlusClient.revokeAccessAndDisconnect(new PlusClient.OnAccessRevokedListener() {
//                public void onAccessRevoked(ConnectionResult result) {
//                    mListener.onPlusAccessRevoked();
//                }
//            });
//        }
//    }
//
//    @Override
//    public void googleResolution(int responseCode, Intent intent) {
//
//        // If we have a successful result, we will want to be able to resolve any further
//        // errors, so turn on resolution with our flag.
//        mAutoResolveOnFail = true;
//        // If we have a successful result, let's call connect() again. If there are any more
//        // errors to resolve we'll get our onConnectionFailed, but if not,
//        // we'll get onPlusConnected.
//        initiatePlusClientConnect();
//    }
//
//    /**
//     * Connect the {@link PlusClient} only if a connection isn't already in progress.
//     */
//    private void initiatePlusClientConnect() {
//        if (!mPlusClient.isConnected() && !mPlusClient.isConnecting()) {
//            mPlusClient.connect();
//        }
//    }
//
//    /**
//     * Disconnect the {@link PlusClient} only if it is connected (otherwise, it can throw an error.)
//     */
//    private void initiatePlusClientDisconnect() {
//        if (mPlusClient.isConnected()) {
//            mPlusClient.disconnect();
//        }
//    }
//
//    /**
//     * A helper method to flip the mResolveOnFail flag and connect the resolution
//     * of the ConnectionResult from the failed connect() call.
//     */
//    private void startGoogleResolution() {
//        try {
//            // Don't connect another resolution now until we have a result from the activity we're
//            // about to connect.
//            mAutoResolveOnFail = false;
//            // If we can resolve the error, then call connect resolution and pass it an integer tag
//            // we can use to track.
//            // This means that when we get the onActivityResult callback we'll know it's from
//            // being started here.
//            mConnectionResult.startResolutionForResult(mActivity, mRequestCode);
//        } catch (IntentSender.SendIntentException e) {
//            // Any problems, just try to connect() again so we get a new ConnectionResult.
//            mConnectionResult = null;
//            initiatePlusClientConnect();
//        }
//    }
//
//    private class GetOAuthTokenTask extends AsyncTask<Void, Void, String> {
//        @Override
//        protected String doInBackground(Void... voids) {
//            String scope = "oauth2:" + Scopes.PLUS_LOGIN
//                    + " https://www.googleapis.com/auth/userinfo.email";
//
//            try {
//                return GoogleAuthUtil.getToken(mActivity, mPlusClient.getAccountName(), scope);
//            } catch (UserRecoverableAuthException e) {
//                mActivity.startActivityForResult(e.getIntent(), mRequestCode);
//            } catch (GoogleAuthException e) {
//                e.printStackTrace();
//            } catch (IOException e) {
//                e.printStackTrace();
//            }
//
//            return null;
//        }
//
//        @Override
//        protected void onPostExecute(String token) {
//            if (token != null) {
//                mListener.onPlusConnected(token, mPlusClient.getAccountName());
//            }
//        }
//    }
//}
