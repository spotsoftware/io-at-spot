package it.spot.io.lib.proxies.ble;

import android.bluetooth.BluetoothDevice;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * This class implements a {@link BroadcastReceiver} which listens for Bluetooth bonding broadcast events.
 *
 * @author Andrea Rinaldi
 */
public class BluetoothBondBroadcastReceiver
        extends BroadcastReceiver {

    private final String mDeviceAddress;
    private final Listener mListener;

    // region Construction

    public BluetoothBondBroadcastReceiver(String deviceAddress, Listener listener) {
        super();
        this.mDeviceAddress = deviceAddress;
        this.mListener = listener;
    }

    // endregion

    // region BroadcastReceiver implementation

    @Override
    public void onReceive(final Context context, final Intent intent) {
        BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
        if (device.getAddress().equals(this.mDeviceAddress)) {

            int state = intent.getIntExtra(BluetoothDevice.EXTRA_BOND_STATE, -1);

            if (state == BluetoothDevice.BOND_BONDED) {
                this.mListener.onBondCreated();
            } else if (state == BluetoothDevice.BOND_BONDING) {
                this.mListener.onBondProgress();
            } else if (state == BluetoothDevice.BOND_NONE) {
                this.mListener.onBondRemoved();
            }
        }
    }

    // endregion

    // region Public listener interface

    interface Listener {

        void onBondCreated();

        void onBondProgress();

        void onBondRemoved();
    }

    // endregion
}
