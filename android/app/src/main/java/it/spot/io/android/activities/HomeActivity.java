package it.spot.io.android.activities;

import android.os.Bundle;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.ActionBarDrawerToggle;
import android.support.v7.widget.Toolbar;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ListView;

import it.spot.io.android.R;

/**
 * @author a.rinaldi
 */
public class HomeActivity
        extends BaseActivity
        implements AdapterView.OnItemClickListener {

    private ActionBarDrawerToggle mDrawerToggle;
    private DrawerLayout mDrawer;
    private ListView mDrawerList;

    // region Activity life cycle

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        this.setContentView(R.layout.activity_home);

        this.initializeDrawer();
    }

    // endregion

    // region AdapterView.OnItemClickListener implementation

    @Override
    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {

    }

    // endregion

    // region Private methods

    private void initializeDrawer() {
        this.mDrawer = (DrawerLayout) this.findViewById(R.id.drawer_layout);
        this.mDrawerList = (ListView) this.mDrawer.findViewById(R.id.left_drawer);
        this.mDrawerList.setAdapter(new ArrayAdapter<String>(this,
                R.layout.drawer_item,
                this.getResources().getStringArray(R.array.menu_voices)));
        this.mDrawerList.setOnItemClickListener(this);

        Toolbar toolbar = (Toolbar) this.findViewById(R.id.toolbar);
        this.setSupportActionBar(toolbar);

        this.mDrawerToggle = new ActionBarDrawerToggle(this, mDrawer,
                toolbar, R.string.action_settings, R.string.action_logout);
        this.mDrawer.setDrawerListener(this.mDrawerToggle);
        this.getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        this.getSupportActionBar().setHomeButtonEnabled(true);
        this.mDrawerToggle.syncState();
    }

    // endregion
}
