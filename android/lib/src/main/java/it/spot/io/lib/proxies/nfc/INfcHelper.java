package it.spot.io.lib.proxies.nfc;

import android.content.Intent;

/**
 * This is the interface of a NFC helper.</br>
 * It provides generic methods for communicating through NFC.
 *
 * @author Andrea Corzani
 */
public interface INfcHelper extends IProximityServiceHelper {

    public String readSignature(final Intent ndefIntent);

    public void writeToken(final String token, final boolean mark);

    public String readAuthenticationResult(final Intent ndefIntent);

    public boolean isP2PStarted();

    public boolean isP2PDisabled();
}
