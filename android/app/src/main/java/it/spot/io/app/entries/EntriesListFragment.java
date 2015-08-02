package it.spot.io.app.entries;

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
public class EntriesListFragment
        extends BaseFragment {

    // region Fragment life cycle

    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_entries_list, container, false);
    }

    // endregion
}
