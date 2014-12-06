package it.spot.io.doorkeeper.proximity.ble;

/**
 * Created by andreacorzani on 18/10/14.
 */
public interface IBleListener {

    public void onBLEDeviceReady();

    public void onReadSignatureCompleted(byte[] result);

    public void onWriteTokenCompleted(int result);

    public void onBLEError(String error);
}
