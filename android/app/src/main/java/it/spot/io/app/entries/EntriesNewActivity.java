package it.spot.io.app.entries;

import android.os.Bundle;

import it.spot.io.android.BaseActivity;
import it.spot.io.android.R;

/**
 * @author a.rinaldi
 */
public class EntriesNewActivity
        extends BaseActivity {

    // region Activity life cycle

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        this.setContentView(R.layout.activity_entries_new);
    }

    // endregion
}
