package it.spot.io.android.lib.ble;

/**
 * @author a.rinaldi
 */
public interface IBleDoorActuator {

    void openDoor(String token, boolean shouldMark);

    void destroy();

    // region Inner listener interface

    interface Listener {

        void onBLEReadSignatureCompleted(byte[] signature);

        void onBLEWriteTokenCompleted(int result);
    }

    // endregion
}
