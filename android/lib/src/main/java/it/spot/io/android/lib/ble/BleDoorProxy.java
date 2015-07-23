package it.spot.io.android.lib.ble;

import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanResult;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.Handler;
import android.util.Log;

import it.spot.io.android.lib.ProxyNotInitializedException;
import it.spot.io.android.lib.ProxyNotSupportedException;

/**
 * @author a.rinaldi
 */
public class BleDoorProxy
        extends ScanCallback
        implements IBleDoorProxy, BluetoothBondBroadcastReceiver.Listener, Runnable {

    public static final int REQUEST_CODE_ENABLE_BT = 100;

    private static final int DEFAULT_SCAN_PERIOD = 10000;
    private static final String LOGTAG = "IO_AT_SPOT_BLE_PROXY";

    private final Activity mActivity;
    private final Listener mListener;
    private final Handler mHandler;

    private boolean mInitialized;
    private boolean mDiscovering;
    private int mScanPeriod;

    private BluetoothDevice mDoorBleDevice;
    private IBleDoorActuator mDoorActuator;
    private BluetoothManager mBtManager;
    private BluetoothAdapter mBtAdapter;
    private BluetoothLeScanner mBleAdapter;
    private BluetoothBondBroadcastReceiver mBondReceiver;

    // region Construction

    protected BleDoorProxy(Activity activity, Listener listener) {
        super();
        this.mActivity = activity;
        this.mListener = listener;
        this.mHandler = new Handler();

        this.mInitialized = false;
        this.mDiscovering = false;
        this.mScanPeriod = DEFAULT_SCAN_PERIOD;
    }

    public static IBleDoorProxy create(Activity activity, Listener listener) {
        return new BleDoorProxy(activity, listener);
    }

    // endregion

    // region IBleDoorProxy implementation

    /**
     * {@inheritDoc}<br/>
     * You should handle the {@link Activity#onActivityResult(int, int, Intent)} event in you activity,
     * it could get triggered in the case the bluetooth adapter is off when this method gets called. If the
     * request code is {@link #REQUEST_CODE_ENABLE_BT} and the result code is {@link Activity#RESULT_OK}
     * you should call this method again to retry an initialization process.<br/>
     */
    @Override
    public boolean init() throws ProxyNotSupportedException {
        if (!this.mActivity.getPackageManager().hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE)) {
            throw new ProxyNotSupportedException("BleDoorProxy is not supported because of missing features on the device.");
        }

        if (this.mBtManager == null) {
            this.mBtManager = (BluetoothManager) this.mActivity.getSystemService(Context.BLUETOOTH_SERVICE);
            this.mBtAdapter = this.mBtManager.getAdapter();
            this.mBleAdapter = this.mBtAdapter.getBluetoothLeScanner();
        }

        if (this.mBtAdapter == null || !this.mBtAdapter.isEnabled()) {
            this.mActivity.startActivityForResult(new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE), REQUEST_CODE_ENABLE_BT);
            return false;
        }

        this.mInitialized = true;
        return true;
    }

    @Override
    public void setScanningPeriod(int period) {
        this.mScanPeriod = period;
    }

    @Override
    public void startScanningForDoorController() throws ProxyNotInitializedException {
        if (!this.mInitialized) {
            throw new ProxyNotInitializedException("BleDoorProxy wasn't properly initialized");
        }

        this.mDiscovering = true;
        this.mBleAdapter.startScan(this);
        // schedules scan stop
        this.mHandler.postDelayed(this, this.mScanPeriod);
    }

    @Override
    public void openDoor(String token, boolean mark) {
        this.mDoorActuator = BleDoorActuator.create(this.mActivity, this.mDoorBleDevice, new IBleDoorActuator.Listener() {

            @Override
            public void onBLEReadSignatureCompleted(byte[] signature) {

            }

            @Override
            public void onBLEWriteTokenCompleted(int result) {
                destroyDoorActuator();
                mListener.onDoorOpened();
            }
        });

        this.mDoorActuator.openDoor(token, mark);
    }

    @Override
    public void destroy() {
        this.stopScan();
        this.cancelBondBroadcastReceiver();
        this.destroyDoorActuator();
        this.mHandler.removeCallbacks(this);
    }

    // endregion

    // region ScanCallback methods overriding

    @Override
    public void onScanResult(int callbackType, ScanResult result) {
        Log.d(LOGTAG, "Found device " + result.getDevice().getName() + " with " + result.getRssi() + " rssi");
        if (result.getDevice().getName().equals("raspy")) {
            this.stopScan();

            this.mDoorBleDevice = result.getDevice();

            if (result.getDevice().getBondState() == BluetoothDevice.BOND_BONDED) {
                this.mListener.onProxyReady();
            } else {
                Log.e(LOGTAG, "Starting bonding creation");
                this.mBondReceiver = new BluetoothBondBroadcastReceiver(this.mDoorBleDevice.getAddress(), this);
                this.mActivity.registerReceiver(this.mBondReceiver, new IntentFilter(BluetoothDevice.ACTION_BOND_STATE_CHANGED));
                result.getDevice().createBond();
            }
        }
    }

    @Override
    public void onScanFailed(int errorCode) {
        super.onScanFailed(errorCode);
        this.mDiscovering = false;
        this.mHandler.removeCallbacks(this);
    }

    // endregion

    // region Runnable implementation

    @Override
    public void run() {
        this.stopScan();
    }

    // endregion

    // region BluetoothBondBroadcastReceiver.Listener implementation

    @Override
    public void onBondCreated() {
        this.mListener.onProxyReady();
        this.stopScan();
    }

    @Override
    public void onBondProgress() {
        // INF: Empty
    }

    @Override
    public void onBondRemoved() {
        // INF: Empty
    }

    // endregion

    // region Private methods

    private void stopScan() {
        if (this.mDiscovering) {
            this.mDiscovering = false;
            this.mBleAdapter.stopScan(this);
            this.cancelBondBroadcastReceiver();
        }
    }

    private void cancelBondBroadcastReceiver() {
        if (this.mBondReceiver != null) {
            this.mActivity.unregisterReceiver(this.mBondReceiver);
            this.mBondReceiver = null;
        }
    }

    private void destroyDoorActuator() {
        if (this.mDoorActuator != null) {
            this.mDoorActuator.destroy();
            this.mDoorActuator = null;
        }
    }

    // endregion
}
