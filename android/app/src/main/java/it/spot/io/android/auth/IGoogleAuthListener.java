package it.spot.io.android.auth;

/**
 * Created by andreacorzani on 20/10/14.
 */
public interface IGoogleAuthListener {
    public void onPlusConnected(String oAuthToken, String name);

    public void onPlusDisconnected();

    public void onPlusAccessRevoked();
}
