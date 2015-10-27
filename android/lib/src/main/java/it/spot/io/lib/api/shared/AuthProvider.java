package it.spot.io.lib.api.shared;

import android.content.Context;
import android.content.SharedPreferences;

/**
 * @author a.rinaldi
 */
public class AuthProvider {

    private static final String API_SHARED_PREF_NAME = "door_keeper_prefs";
    private static final String API_SHARED_PREF_TOKEN_KEY = "logged_user_token";

    public static String getToken(Context ctx) {
        SharedPreferences sharedPref = ctx.getSharedPreferences(API_SHARED_PREF_NAME, Context.MODE_PRIVATE);
        return sharedPref.getString(API_SHARED_PREF_TOKEN_KEY, "");
    }

    public static void setToken(Context ctx, String token) {
        ctx.getSharedPreferences(API_SHARED_PREF_NAME, Context.MODE_PRIVATE)
                .edit()
                .putString(API_SHARED_PREF_TOKEN_KEY, token)
                .commit();
    }
}
