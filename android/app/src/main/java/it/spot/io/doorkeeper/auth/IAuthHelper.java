package it.spot.io.doorkeeper.auth;

import android.app.Activity;
import android.content.Intent;

import it.spot.io.doorkeeper.http.IDataResponse;
import it.spot.io.doorkeeper.http.IHttpPostCallback;
import it.spot.io.doorkeeper.model.ILoggedUser;

/**
 * Created by andreacorzani on 19/10/14.
 */
public interface IAuthHelper {

    public void refreshLocalLogin(final String token, final IHttpPostCallback<IDataResponse<ILoggedUser>> callback);

    public void localLogin(final String email, final String password, final IHttpPostCallback<IDataResponse<String>> callback);

    public void getLocalUser(final String token, final String email, final IHttpPostCallback<IDataResponse<ILoggedUser>> callback);

    public void setupGoogleAuthentication(final Activity activity, final IGoogleAuthListener listener, final int requestCode);

    public void resetGoogleAuthentication();

    public boolean googleLogin();

    public void googleLogout();

    public void googleRevokeAccess();

    public void googleResolution(final int result, final Intent intent);
}
