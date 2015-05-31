package it.spot.io.doorkeeper.proximity.ble;

/**
 * Created by andreacorzani on 18/10/14.
 */
public interface IBleListener {

    public void onBLEDeviceReady();

    public void onBLEReadSignatureCompleted(byte[] result);

    public void onBLEWriteTokenCompleted(int result);

    public void onBLEError(String error);
}
