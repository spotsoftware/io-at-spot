package it.spot.io.app.login.auth;

import android.content.Intent;

import com.google.android.gms.common.api.GoogleApiClient;

import it.spot.io.app.login.auth.model.ILoggedUser;

/**
 * Groups all the needed methods and logic to accomplish a sign-in to io@spot.<br/>
 * It can be done by entering plain user credentials or by selecting a Google Account previously logged on the device.
 *
 * @author a.rinaldi
 */
public interface IAuthenticator
        extends GoogleApiClient.ConnectionCallbacks, GoogleApiClient.OnConnectionFailedListener {

    /**
     * Attempts a sign-in with plain credentials.
     *
     * @param email    the user email
     * @param password the authentication password
     */
    void login(String email, String password);

    /**
     * Refreshes the token and validates the sign-in of the user.
     *
     * @param token the token to refresh
     */
    void refreshLogin(String token);

    /**
     * Starts the login by Google flow.
     */
    void loginByGoogle();

    /**
     * Checks the result of the error resolution procedure accomplished by the Google auth.
     *
     * @param requestCode  the integer request code originally supplied to startActivityForResult(), allowing you to identify who this result came from
     * @param responseCode the integer response code returned from the activity started for result
     * @param intent       intent returned from the activity started for result
     * @return {@code true} if the result intent was handled from the IAuthenticator, {@code false} otherwise
     */
    boolean checkGoogleErrorsResolution(int requestCode, int responseCode, Intent intent);

    /**
     * Destroys the authenticator, freeing all the occupied resources.
     */
    void destroy();

    // region Inner listener interface

    interface Listener {

        /**
         * This method handles the login flow completion.</br>
         * No need to check error presence, this code gets executed only in the successful case.<br/>
         * The data of the logged user gets stored within shared preferences and directly passed to the next activity.
         *
         * @param user the logged user model
         */
        void onLoginCompleted(ILoggedUser user);

        void onError(int errCode, String errMessage);
    }

    // endregion
}
