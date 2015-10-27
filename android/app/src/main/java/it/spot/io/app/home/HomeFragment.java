package it.spot.io.app.home;

import android.os.Bundle;
import android.support.annotation.Nullable;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import it.spot.io.android.BaseFragment;
import it.spot.io.android.R;

/**
 * @author a.rinaldi
 */
public class HomeFragment
        extends BaseFragment {

    // region Fragment life cycle

    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_home, container, false);

        // TODO - put here all the logic for nfc and ble authentication

        return view;
    }

    // endregion
}
