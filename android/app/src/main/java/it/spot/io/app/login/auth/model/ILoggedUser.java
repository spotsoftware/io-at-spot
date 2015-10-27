package it.spot.io.app.login.auth.model;

import android.os.Parcelable;

/**
 * @author a.rinaldi
 */
public interface ILoggedUser extends Parcelable {

    String PREF_LOGGED_USER_ID = "logged_user_id";
    String PREF_LOGGED_USER_TOKEN = "logged_user_token";
    String PREF_LOGGED_USER_NAME = "logged_user_name";
    String PREF_LOGGED_USER_EMAIL = "logged_user_email";
    String PREF_LOGGED_USER_TOKEN_HASH = "logged_user_token_hash";

    String getName();

    void setName(String name);

    String getId();

    void setId(String id);

    String getToken();

    void setToken(String token);

    String getTokenHash();

    void setTokenHash(String tokenHash);

    String getEmail();

    void setEmail(String email);
}
