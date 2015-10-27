package it.spot.io.android;

import android.app.Activity;
import android.app.Fragment;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

/**
 * @author a.rinaldi
 */
public abstract class BaseFragment
        extends Fragment {

    private BaseActivityInterface mInterface;

    // region Fragment life cycle

    @Override
    public void onAttach(Activity activity) {
        super.onAttach(activity);
        if (activity instanceof BaseActivityInterface) {
            this.mInterface = (BaseActivityInterface) activity;
        }
    }

    @Nullable
    @Override
    public abstract View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState);

    // endregion
}
