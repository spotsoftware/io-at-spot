package it.spot.io.android.proximity.ble;

import android.bluetooth.BluetoothDevice;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.os.Message;
import android.util.Log;

import it.spot.io.android.DoorKeeperApplication;

/**
 * This class implements a {@link android.content.BroadcastReceiver} which listens for BLE broadcast events.
 *
 * @author Andrea Rinaldi
 */
public class BleBondingBroadcastReceiver extends BroadcastReceiver {

    private final Handler mMessageHandler;
    private final IBleListener mListener;

    // { Construction

    public BleBondingBroadcastReceiver(final Handler messageHandler, final IBleListener listener) {
        super();

        this.mListener = listener;
        this.mMessageHandler = messageHandler;
    }

    // }

    // { BroadcastReceiver abstract method implementation

    @Override
    public void onReceive(final Context context, final Intent intent) {
        final BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
        final int bondState = intent.getIntExtra(BluetoothDevice.EXTRA_BOND_STATE, -1);
        final int previousBondState = intent.getIntExtra(BluetoothDevice.EXTRA_PREVIOUS_BOND_STATE, -1);

        Log.d(this.getClass().getSimpleName(), "Bond state changed for: " + device.getAddress() + " new state: " + bondState + " previous: " + previousBondState);

        if (bondState == BluetoothDevice.BOND_BONDED) {
            this.mMessageHandler.sendMessage(Message.obtain(null, DoorKeeperApplication.MessageConstants.MSG_DISMISS, "Bonded."));
            this.mListener.onBLEDeviceReady();
        } else if (bondState == BluetoothDevice.BOND_BONDING) {
            this.mMessageHandler.sendMessage(Message.obtain(null, DoorKeeperApplication.MessageConstants.MSG_PROGRESS, "Bonding..."));
        } else if (bondState == BluetoothDevice.BOND_NONE) {
            this.mMessageHandler.sendMessage(Message.obtain(null, DoorKeeperApplication.MessageConstants.MSG_DISMISS, "Bond error."));
        }
    }

    // }

}
