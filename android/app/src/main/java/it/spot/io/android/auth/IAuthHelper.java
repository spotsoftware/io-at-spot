package it.spot.io.android.auth;

import android.app.Activity;
import android.content.Intent;

import com.google.android.gms.common.api.GoogleApiClient;

import it.spot.io.android.http.IDataResponse;
import it.spot.io.android.http.IHttpPostCallback;
import it.spot.io.android.model.ILoggedUser;

/**
 * Groups all the needed methods and logic to accomplish a sign-in to io@spot.<br/>
 * It can be done by entering plain user credentials or by selecting a Google Account previously logged on the device.
 *
 * @author a.rinaldi
 */
public interface IAuthHelper
        extends GoogleApiClient.ConnectionCallbacks, GoogleApiClient.OnConnectionFailedListener {

    /**
     * Attempts a sign-in with plain credentials.
     *
     * @param email    the user email
     * @param password the authentication password
     * @param callback the callback triggered at the end of the sign-in process
     */
    void login(String email, String password, IHttpPostCallback<IDataResponse<String>> callback);

    /**
     * Gets the profile info of the io@spot user.
     *
     * @param token    the authentication token
     * @param email    the user email
     * @param callback the callback triggered at the end of the request
     */
    void getUserProfile(String token, String email, IHttpPostCallback<IDataResponse<ILoggedUser>> callback);

    /**
     * Enables or disables the login by Google feature.<br/>
     * It's required to enable the feature before calling any of the following:
     * <ul>
     * <li>{@link #loginByGoogle()};</li>
     * <li>{@link #checkGoogleErrorsResolution(int, int, Intent)}.</li>
     * </ul>
     *
     * @param activity the activity the method is called from
     */
    void enableLoginByGoogle(Activity activity);

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
     * @return {@code true} if the result intent was handled from the IAuthHelper, {@code false} otherwise
     */
    boolean checkGoogleErrorsResolution(int requestCode, int responseCode, Intent intent);

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

        void onLoginByGoogleCompleted();

        void onError(int errCode, String errMessage);
    }

    // endregion
}
