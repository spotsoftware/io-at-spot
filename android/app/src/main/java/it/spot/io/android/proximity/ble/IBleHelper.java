package it.spot.io.android.proximity.ble;

import it.spot.io.android.proximity.IProximityServiceHelper;

/**
 * Created by andreacorzani on 18/10/14.
 */
public interface IBleHelper extends IProximityServiceHelper {

    public void readSignature();

    public void writeToken(String token, boolean mark);

}
