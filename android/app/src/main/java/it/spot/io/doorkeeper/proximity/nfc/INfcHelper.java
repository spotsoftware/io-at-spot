package it.spot.io.doorkeeper.proximity.nfc;

import android.content.Intent;

import it.spot.io.doorkeeper.proximity.IProximityServiceHelper;

/**
 * This is the interface of a NFC helper.</br>
 * It provides generic methods for communicating through NFC.
 *
 * @author Andrea Corzani
 */
public interface INfcHelper extends IProximityServiceHelper {

    public String readSignature(final Intent ndefIntent);

    public void writeToken(final String token, final boolean isEntrance);

    public String readAuthenticationResult(final Intent ndefIntent);

    public boolean isP2PStarted();

    public boolean isP2PDisabled();
}
