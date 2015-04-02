package it.spot.io.doorkeeper.proximity.ble;

import it.spot.io.doorkeeper.proximity.IProximityServiceHelper;

/**
 * Created by andreacorzani on 18/10/14.
 */
public interface IBleHelper extends IProximityServiceHelper {

    public void readSignature();

    public void writeToken(String token, boolean mark);

}
